import Stripe from "stripe";
import { type Express, type Request, type Response } from "express";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { GHL_WORKFLOWS, ghlAddTags, ghlTriggerWorkflow, ghlUpsertContact } from "./ghl";
import { PLANS, type PlanKey, type BillingInterval } from "./stripeProducts";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-05-27.dahlia",
});

// ── Helper: get or create a Stripe price for a plan ──────────────────────────
async function getOrCreatePrice(planKey: PlanKey, interval: BillingInterval): Promise<string> {
  const plan = PLANS[planKey];
  const amount = interval === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  const stripeInterval = interval === "monthly" ? "month" : "year";
  const nickname = `${plan.name} ${interval === "monthly" ? "Monthly" : "Annual"}`;

  // Search for existing price
  const prices = await stripe.prices.list({
    active: true,
    type: "recurring",
    expand: ["data.product"],
  });

  const existing = prices.data.find(
    (p: Stripe.Price) =>
      p.nickname === nickname &&
      p.unit_amount === amount &&
      p.recurring?.interval === stripeInterval
  );

  if (existing) return existing.id;

  // Create product + price
  const product = await stripe.products.create({
    name: `${plan.name} - Shop in Siesta Key`,
    description: plan.description,
    metadata: { plan_key: planKey },
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: amount,
    currency: "usd",
    recurring: { interval: stripeInterval },
    nickname,
    metadata: { plan_key: planKey, billing_interval: interval },
  });

  return price.id;
}

// ── Create a Checkout Session ─────────────────────────────────────────────────
export async function createCheckoutSession(opts: {
  planKey: PlanKey;
  interval: BillingInterval;
  userId: number;
  userEmail: string;
  userName: string;
  origin: string;
}): Promise<string> {
  const { planKey, interval, userId, userEmail, userName, origin } = opts;
  const priceId = await getOrCreatePrice(planKey, interval);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: userEmail,
    allow_promotion_codes: true,
    client_reference_id: userId.toString(),
    metadata: {
      user_id: userId.toString(),
      customer_email: userEmail,
      customer_name: userName,
      plan_key: planKey,
      billing_interval: interval,
    },
    success_url: `${origin}/pricing?success=1&plan=${planKey}`,
    cancel_url: `${origin}/pricing?cancelled=1`,
  });

  return session.url ?? "";
}

// ── Register Stripe webhook route ─────────────────────────────────────────────
export function registerStripeWebhook(app: Express) {
  app.post(
    "/api/stripe/webhook",
    // raw body required for signature verification — registered BEFORE express.json()
    (req: Request, res: Response, next) => {
      // If already parsed (Buffer), skip; otherwise read raw
      if (Buffer.isBuffer(req.body)) return next();
      let data = "";
      req.setEncoding("utf8");
      req.on("data", (chunk: string) => (data += chunk));
      req.on("end", () => {
        (req as Request & { rawBody: string }).rawBody = data;
        next();
      });
    },
    async (req: Request, res: Response) => {
      const sig = req.headers["stripe-signature"] as string;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

      let event: Stripe.Event;
      try {
        const body = Buffer.isBuffer(req.body)
          ? req.body
          : (req as Request & { rawBody: string }).rawBody;
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
      } catch (err) {
        console.error("[Stripe Webhook] Signature verification failed:", err);
        return res.status(400).send("Webhook signature verification failed");
      }

      // Test events — return immediately
      if (event.id.startsWith("evt_test_")) {
        console.log("[Stripe Webhook] Test event detected, returning verification response");
        return res.json({ verified: true });
      }

      console.log(`[Stripe Webhook] Event: ${event.type} (${event.id})`);

      try {
        if (event.type === "checkout.session.completed") {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = parseInt(session.metadata?.user_id ?? "0");
          const planKey = (session.metadata?.plan_key ?? "gulf_breeze") as PlanKey;
          const customerEmail = session.metadata?.customer_email ?? "";
          const customerName = session.metadata?.customer_name ?? "";
          const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? "";
          const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id ?? "";

          if (userId) {
          // Update user record
          const db1 = await getDb();
          await db1!
            .update(users)
            .set({
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              subscriptionPlan: planKey,
              subscriptionStatus: "active",
            })
            .where(eq(users.id, userId));
          }

          // Trigger GHL workflows
          try {
            const nameParts = customerName.trim().split(" ");
            const contactId = await ghlUpsertContact({
              firstName: nameParts[0] ?? customerName,
              lastName: nameParts.slice(1).join(" ") || undefined,
              email: customerEmail,
              tags: [PLANS[planKey].ghlTag, "Paid Subscriber", "Siesta Key Directory"],
              source: "Shop in Siesta Key - Stripe Checkout",
            });

            if (contactId) {
              if (planKey === "island_premier") {
                await ghlTriggerWorkflow(contactId, GHL_WORKFLOWS.LISTING_UPGRADED_PREMIUM);
                await ghlTriggerWorkflow(contactId, GHL_WORKFLOWS.PREMIUM_UPGRADE_PUSH);
              } else {
                await ghlTriggerWorkflow(contactId, GHL_WORKFLOWS.PREMIUM_UPGRADE_PUSH);
              }
            }
          } catch (ghlErr) {
            console.error("[GHL] post-payment workflow error:", ghlErr);
          }
        }

        if (event.type === "customer.subscription.deleted") {
          const sub = event.data.object as Stripe.Subscription;
          const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;

          // Find user by stripeCustomerId and reset plan
          const db2 = await getDb();
          const [user] = await db2!
            .select()
            .from(users)
            .where(eq(users.stripeCustomerId, customerId))
            .limit(1);

          if (user) {
            await db2!
              .update(users)
              .set({ subscriptionPlan: "free", subscriptionStatus: "cancelled" })
              .where(eq(users.id, user.id));
          }
        }
      } catch (err) {
        console.error("[Stripe Webhook] Handler error:", err);
        return res.status(500).send("Webhook handler error");
      }

      res.json({ received: true });
    }
  );
}
