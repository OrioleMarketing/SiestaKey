import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { notifyOwner } from "./_core/notification";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import {
  createClaimLead,
  createListingSubmission,
  getAllCategories,
  getBusinessBySlug,
  getBusinesses,
  getFeaturedBusinesses,
  getRelatedBusinesses,
  markClaimLeadWebhookSent,
  markSubmissionWebhookSent,
} from "./db";
import { ENV } from "./_core/env";

// ─── GoHighLevel Webhook Helper ────────────────────────────────────────────────
async function sendGHLWebhook(webhookUrl: string, payload: Record<string, unknown>) {
  if (!webhookUrl) return false;
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (err) {
    console.error("[GHL Webhook] Failed to send:", err);
    return false;
  }
}

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Categories ─────────────────────────────────────────────────────────────
  categories: router({
    list: publicProcedure.query(async () => {
      return getAllCategories();
    }),
  }),

  // ─── Businesses ─────────────────────────────────────────────────────────────
  businesses: router({
    featured: publicProcedure.query(async () => {
      return getFeaturedBusinesses();
    }),

    list: publicProcedure
      .input(
        z.object({
          categorySlug: z.string().optional(),
          keyword: z.string().optional(),
          area: z.string().optional(),
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(50).default(12),
        })
      )
      .query(async ({ input }) => {
        return getBusinesses(input);
      }),

    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const business = await getBusinessBySlug(input.slug);
        if (!business) return null;
        return business;
      }),

    related: publicProcedure
      .input(z.object({ categoryId: z.number(), excludeId: z.number() }))
      .query(async ({ input }) => {
        return getRelatedBusinesses(input.categoryId, input.excludeId);
      }),
  }),

  // ─── Claim Your Business ────────────────────────────────────────────────────
  claims: router({
    submit: publicProcedure
      .input(
        z.object({
          businessId: z.number().optional(),
          businessName: z.string().min(1).max(200),
          contactName: z.string().min(1).max(200),
          email: z.string().email(),
          phone: z.string().optional(),
          message: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        // 1. Save to DB
        const id = await createClaimLead(input);

        // 2. Send GHL webhook
        const webhookUrl = process.env.GHL_CLAIM_WEBHOOK_URL ?? "";
        if (webhookUrl) {
          const sent = await sendGHLWebhook(webhookUrl, {
            type: "claim_lead",
            id,
            businessName: input.businessName,
            contactName: input.contactName,
            email: input.email,
            phone: input.phone ?? "",
            message: input.message ?? "",
            submittedAt: new Date().toISOString(),
          });
          if (sent) await markClaimLeadWebhookSent(id);
        }

        // 3. Notify owner
        await notifyOwner({
          title: `New Business Claim: ${input.businessName}`,
          content: `${input.contactName} (${input.email}) wants to claim "${input.businessName}". ${input.phone ? `Phone: ${input.phone}.` : ""} ${input.message ? `Message: ${input.message}` : ""}`,
        });

        return { success: true, id };
      }),
  }),

  // ─── New Listing Submission ──────────────────────────────────────────────────
  submissions: router({
    submit: publicProcedure
      .input(
        z.object({
          businessName: z.string().min(1).max(200),
          categoryId: z.number().optional(),
          contactName: z.string().min(1).max(200),
          email: z.string().email(),
          phone: z.string().optional(),
          website: z.string().url().optional().or(z.literal("")),
          address: z.string().optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        // 1. Save to DB
        const id = await createListingSubmission(input);

        // 2. Send GHL webhook
        const webhookUrl = process.env.GHL_SUBMISSION_WEBHOOK_URL ?? "";
        if (webhookUrl) {
          const sent = await sendGHLWebhook(webhookUrl, {
            type: "listing_submission",
            id,
            businessName: input.businessName,
            categoryId: input.categoryId,
            contactName: input.contactName,
            email: input.email,
            phone: input.phone ?? "",
            website: input.website ?? "",
            address: input.address ?? "",
            description: input.description ?? "",
            submittedAt: new Date().toISOString(),
          });
          if (sent) await markSubmissionWebhookSent(id);
        }

        // 3. Notify owner
        await notifyOwner({
          title: `New Listing Submission: ${input.businessName}`,
          content: `${input.contactName} (${input.email}) submitted a new listing for "${input.businessName}". ${input.address ? `Address: ${input.address}.` : ""} ${input.website ? `Website: ${input.website}.` : ""}`,
        });

        return { success: true, id };
      }),
  }),
});

export type AppRouter = typeof appRouter;
