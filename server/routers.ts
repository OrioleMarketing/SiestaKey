import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { notifyOwner } from "./_core/notification";
import { systemRouter } from "./_core/systemRouter";
import { TRPCError } from "@trpc/server";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createClaimLead,
  createListingSubmission,
  getAllBusinessesAdmin,
  getAllCategories,
  getAllClaimLeads,
  getAllSubmissions,
  getBusinessBySlug,
  getBusinesses,
  getBusinessByUserId,
  updateBusinessByUserId,
  getFeaturedBusinesses,
  getRelatedBusinesses,
  markClaimLeadWebhookSent,
  markSubmissionWebhookSent,
  updateBusinessFlags,
  updateClaimStatus,
  updateSubmissionStatus,
  updateSubmissionStripeIds,
  getDb,
} from "./db";
import {
  getBlogPosts,
  getBlogPostBySlug,
  getBlogPostById,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  generateSlug,
} from "./blogDb";
import { businesses, claimLeads, listingSubmissions, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import {
  GHL_WORKFLOWS,
  ghlAddTags,
  ghlTriggerWorkflow,
  ghlUpsertContact,
} from "./ghl";
import { createCheckoutSession, cancelAndRefundSubmission } from "./stripeWebhook";
import { storagePut } from "./storage";
import { type PlanKey, type BillingInterval } from "./stripeProducts";

// --- Weather types & cache ---
interface WeatherForecastDay {
  date: string;
  weatherCode: number;
  condition: string;
  highF: number;
  lowF: number;
}

interface WeatherData {
  tempF: number;
  feelsLikeF: number;
  humidity: number;
  windMph: number;
  uvIndex: number;
  weatherCode: number;
  condition: string;
  forecast: WeatherForecastDay[];
  fetchedAt: number;
}

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
    uv_index: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

let weatherCache: { data: WeatherData; fetchedAt: number } | null = null;

function wmoDescription(code: number): string {
  if (code === 0) return "Clear Sky";
  if (code === 1) return "Mainly Clear";
  if (code === 2) return "Partly Cloudy";
  if (code === 3) return "Overcast";
  if (code >= 45 && code <= 48) return "Foggy";
  if (code >= 51 && code <= 55) return "Drizzle";
  if (code >= 61 && code <= 65) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Rain Showers";
  if (code >= 85 && code <= 86) return "Snow Showers";
  if (code === 95) return "Thunderstorm";
  if (code >= 96 && code <= 99) return "Thunderstorm w/ Hail";
  return "Unknown";
}

export const appRouter = router({
  system: systemRouter,

  // --- Admin Panel ---
  admin: router({
    listBusinesses: adminProcedure.query(async () => {
      return getAllBusinessesAdmin();
    }),

    updateBusiness: adminProcedure
      .input(
        z.object({
          id: z.number(),
          // Flags
          isFeatured: z.boolean().optional(),
          isSponsored: z.boolean().optional(),
          isActive: z.boolean().optional(),
          isClaimed: z.boolean().optional(),
          isChamberMember: z.boolean().optional(),
          tier: z.enum(["free", "featured", "sponsored"]).optional(),
          // Core fields
          name: z.string().min(1).max(200).optional(),
          slug: z.string().min(1).max(150).optional(),
          categoryId: z.number().int().positive().optional(),
          shortDescription: z.string().max(300).nullish(),
          description: z.string().max(5000).nullish(),
          address: z.string().max(300).nullish(),
          area: z.string().max(100).nullish(),
          phone: z.string().max(30).nullish(),
          website: z.string().max(300).nullish(),
          email: z.string().max(200).nullish(),
          lat: z.string().max(30).nullish(),
          lng: z.string().max(30).nullish(),
          rating: z.string().max(5).nullish(),
          reviewCount: z.number().int().nullish(),
          googleReviewEmbedCode: z.string().nullish(),
          coverPhoto: z.string().url().nullish(),
          hours: z.record(z.string(), z.string()).nullish(),
          socialLinks: z.record(z.string(), z.string()).nullish(),
          tags: z.array(z.string()).nullish(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...fields } = input;
        const db = await getDb();
        if (!db) return { success: false };
        // Build update object — only include defined keys
        const update: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(fields)) {
          if (v !== undefined) update[k] = v === null ? null : v;
        }
        if (Object.keys(update).length > 0) {
          await db.update(businesses).set(update).where(eq(businesses.id, id));
        }
        return { success: true };
      }),

    listClaims: adminProcedure.query(async () => {
      return getAllClaimLeads();
    }),

    listSubmissions: adminProcedure.query(async () => {
      return getAllSubmissions();
    }),

    updateSubmission: adminProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending", "approved", "rejected"]),
          origin: z.string().optional(), // frontend passes window.location.origin for approval email links
        })
      )
      .mutation(async ({ input }) => {
        await updateSubmissionStatus(input.id, input.status);

        const db = await getDb();

        // When approving, auto-create a business listing from the submission data
        if (input.status === "approved" && db) {
          // Fetch the submission
          const rows = await db
            .select()
            .from(listingSubmissions)
            .where(eq(listingSubmissions.id, input.id))
            .limit(1);
          const sub = rows[0];

          if (sub) {
            // Map submission tier to business tier
            const bizTier: "free" | "featured" | "sponsored" =
              sub.tier === "island_premier" ? "sponsored"
              : sub.tier === "gulf_breeze" ? "featured"
              : "free";

            // Generate a unique slug from the business name
            const baseSlug = sub.businessName
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "");
            const existing = await db
              .select({ slug: businesses.slug })
              .from(businesses)
              .where(eq(businesses.slug, baseSlug))
              .limit(1);
            const slug = existing.length > 0 ? `${baseSlug}-${Date.now()}` : baseSlug;

            const insertResult = await db.insert(businesses).values({
              slug,
              name: sub.businessName,
              categoryId: sub.categoryId ?? 1,
              description: sub.description ?? null,
              shortDescription: null,
              address: sub.address ?? null,
              area: "Siesta Key Village",
              phone: sub.phone ?? null,
              website: sub.website ?? null,
              email: sub.email ?? null,
              isActive: true,
              isFeatured: bizTier === "featured" || bizTier === "sponsored",
              isSponsored: bizTier === "sponsored",
              isClaimed: false,
              tier: bizTier,
            });

            const newBusinessId = Number((insertResult as any)[0]?.insertId ?? 0);

            // Store the created business ID and slug back on the submission
            if (newBusinessId) {
              await updateSubmissionStripeIds(input.id, { createdBusinessId: newBusinessId, createdBusinessSlug: slug });
            }

            // Trigger GHL "Listing Approved" workflow with profile URL
            try {
              const origin = input.origin ?? "https://shopinsiestakey.com";
              const profileUrl = `${origin}/business/${slug}`;
              const nameParts = sub.contactName.trim().split(" ");
              const contactId = await ghlUpsertContact({
                firstName: nameParts[0] ?? sub.contactName,
                lastName: nameParts.slice(1).join(" ") || undefined,
                email: sub.email,
                phone: sub.phone ?? undefined,
                companyName: sub.businessName,
                tags: ["Listing Approved", "Siesta Key Directory"],
                customFields: [
                  { key: "listing_url", field_value: profileUrl },
                ],
              });
              if (contactId) {
                await ghlTriggerWorkflow(contactId, GHL_WORKFLOWS.NEW_LISTING_ADDED);
              }
            } catch (ghlErr) {
              console.error("[GHL] approval workflow error:", ghlErr);
            }

            // Notify owner
            await notifyOwner({
              title: `Listing Approved: ${sub.businessName}`,
              content: `Submission #${input.id} approved. Business profile created at /business/${slug}. Tier: ${bizTier}.`,
            });

            // Return the slug so the frontend can build the correct View Listing URL
            return { success: true, slug, businessId: newBusinessId };
          }
        }

        // When rejecting, cancel Stripe subscription, issue refund, and fire GHL rejection workflow
        if (input.status === "rejected" && db) {
          const rows = await db
            .select()
            .from(listingSubmissions)
            .where(eq(listingSubmissions.id, input.id))
            .limit(1);
          const sub = rows[0];

          if (sub) {
            // Refund if payment exists
            if (sub.stripeSubscriptionId || sub.stripePaymentIntentId) {
              const result = await cancelAndRefundSubmission({
                stripeSubscriptionId: sub.stripeSubscriptionId,
                stripePaymentIntentId: sub.stripePaymentIntentId,
              });
              console.log(`[Stripe] Rejection refund for submission ${input.id}:`, result.message);

              await notifyOwner({
                title: `Submission Rejected + Refund: ${sub.businessName}`,
                content: `Submission #${input.id} rejected. Refund status: ${result.message}`,
              });
            }

            // Fire GHL "Listing Rejected" workflow
            try {
              const nameParts = sub.contactName.trim().split(" ");
              const contactId = await ghlUpsertContact({
                firstName: nameParts[0] ?? sub.contactName,
                lastName: nameParts.slice(1).join(" ") || undefined,
                email: sub.email,
                phone: sub.phone ?? undefined,
                companyName: sub.businessName,
                tags: ["Listing Rejected", "Siesta Key Directory"],
              });
              if (contactId) {
                await ghlTriggerWorkflow(contactId, GHL_WORKFLOWS.LISTING_REJECTED);
              }
            } catch (ghlErr) {
              console.error("[GHL] rejection workflow error:", ghlErr);
            }
          }
        }

        return { success: true, slug: undefined as string | undefined, businessId: undefined as number | undefined };
      }),

    // Approve/reject a claim and trigger the appropriate GHL workflow
    approveClaim: adminProcedure
      .input(z.object({
        claimId: z.number(),
        businessId: z.number().optional(),
        claimEmail: z.string().email().optional(),
        contactId: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        let businessSlug: string | null = null;

        // 1. Link the business to the user who submitted the claim (by email match)
        if (input.businessId && db) {
          const matchedBiz = await db
            .select({ slug: businesses.slug })
            .from(businesses)
            .where(eq(businesses.id, input.businessId))
            .limit(1);
          businessSlug = matchedBiz[0]?.slug ?? null;

          if (input.claimEmail) {
            const matchedUsers = await db
              .select({ id: users.id })
              .from(users)
              .where(eq(users.email, input.claimEmail))
              .limit(1);
            const userId = matchedUsers[0]?.id ?? null;
            await db
              .update(businesses)
              .set({ isClaimed: true, claimedByUserId: userId })
              .where(eq(businesses.id, input.businessId));
          } else {
            // No email match needed — just mark as claimed
            await db
              .update(businesses)
              .set({ isClaimed: true })
              .where(eq(businesses.id, input.businessId));
          }
        }

        // 2. Update claim status to approved
        await updateClaimStatus(input.claimId, "approved");

        // 3. Trigger GHL workflow
        if (input.contactId) {
          await ghlAddTags(input.contactId, ["Claim Approved"]);
          await ghlTriggerWorkflow(input.contactId, GHL_WORKFLOWS.CLAIM_REQUEST_APPROVED);
        }

        return { success: true, businessSlug };
      }),

    rejectClaim: adminProcedure
      .input(z.object({
        claimId: z.number(),
        contactId: z.string().optional(),
        rejectionReason: z.string().max(300).optional(),
        rejectionNotes: z.string().max(2000).optional(),
      }))
      .mutation(async ({ input }) => {
        // Update claim status to rejected with reason and notes
        await updateClaimStatus(
          input.claimId,
          "rejected",
          undefined,
          input.rejectionReason,
          input.rejectionNotes,
        );

        if (input.contactId) {
          await ghlAddTags(input.contactId, ["Claim Rejected"]);
          // Pass rejection reason and notes as custom fields to GHL contact
          try {
            const { ghlUpdateContact } = await import("./ghl");
            await ghlUpdateContact(input.contactId, {
              customFields: [
                { key: "claim_rejection_reason", field_value: input.rejectionReason ?? "" },
                { key: "claim_rejection_notes", field_value: input.rejectionNotes ?? "" },
              ],
            });
          } catch (e) {
            console.error("[GHL] failed to set rejection custom fields:", e);
          }
          await ghlTriggerWorkflow(input.contactId, GHL_WORKFLOWS.CLAIM_REQUEST_REJECTED);
        }
        return { success: true };
      }),

    createBusiness: adminProcedure
      .input(
        z.object({
          name: z.string().min(1).max(200),
          categoryId: z.number().int().positive(),
          shortDescription: z.string().max(300).optional(),
          description: z.string().max(5000).optional(),
          address: z.string().max(300).optional(),
          area: z.string().max(100).optional().default("Siesta Key Village"),
          phone: z.string().max(30).optional(),
          website: z.string().max(300).optional(),
          email: z.string().max(200).optional(),
          lat: z.string().optional(),
          lng: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        // Generate a unique slug from the name
        const baseSlug = input.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        // Check for slug collision and append a timestamp if needed
        const existing = await db
          .select({ slug: businesses.slug })
          .from(businesses)
          .where(eq(businesses.slug, baseSlug))
          .limit(1);
        const slug = existing.length > 0 ? `${baseSlug}-${Date.now()}` : baseSlug;
        const DEFAULT_COVER = "/manus-storage/SiestaKey_panorama_734eb779.webp";
        await db.insert(businesses).values({
          slug,
          name: input.name,
          categoryId: input.categoryId,
          shortDescription: input.shortDescription ?? null,
          description: input.description ?? null,
          address: input.address ?? null,
          area: input.area ?? "Siesta Key Village",
          phone: input.phone ?? null,
          website: input.website ?? null,
          email: input.email ?? null,
          lat: input.lat ?? null,
          lng: input.lng ?? null,
          isActive: true,
          isFeatured: false,
          isSponsored: false,
          isClaimed: false,
          tier: "free",
          coverPhoto: DEFAULT_COVER,
        });
        return { success: true, slug };
      }),

    deleteBusiness: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        await db.delete(businesses).where(eq(businesses.id, input.id));
        return { success: true };
      }),

    updateGoogleReview: adminProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          googleReviewEmbedCode: z.string().max(5000).nullable(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        await db
          .update(businesses)
          .set({ googleReviewEmbedCode: input.googleReviewEmbedCode })
          .where(eq(businesses.id, input.id));
        return { success: true };
      }),

    // Re-create a Stripe checkout link for a pending submission that hasn't paid yet
    resendPaymentLink: adminProcedure
      .input(
        z.object({
          submissionId: z.number().int().positive(),
          origin: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        const rows = await db
          .select()
          .from(listingSubmissions)
          .where(eq(listingSubmissions.id, input.submissionId))
          .limit(1);
        const sub = rows[0];
        if (!sub) throw new Error("Submission not found");
        if (sub.status !== "pending") throw new Error("Submission is not pending");
        if (sub.tier === "free") throw new Error("Free tier submissions do not require payment");

        // Map submission tier to plan key
        const planKey: PlanKey = sub.tier === "island_premier" ? "island_premier" : "gulf_breeze";

        // Create a fresh checkout session (no userId required for admin resend — use 0)
        const checkoutUrl = await createCheckoutSession({
          planKey,
          interval: "monthly",
          userId: 0,
          userEmail: sub.email,
          userName: sub.contactName,
          origin: input.origin,
          submissionId: sub.id,
        });

        return { checkoutUrl };
      }),

    bulkImportBusinesses: adminProcedure
      .input(
        z.object({
          rows: z.array(
            z.object({
              name: z.string().min(1),
              slug: z.string().optional(),
              category: z.string().min(1),   // category name or slug
              area: z.string().optional(),
              phone: z.string().optional(),
              email: z.string().optional(),
              website: z.string().optional(),
              address: z.string().optional(),
              shortDescription: z.string().optional(),
              description: z.string().optional(),
              tier: z.enum(["free", "featured", "sponsored"]).optional(),
              lat: z.string().optional(),
              lng: z.string().optional(),
              tags: z.string().optional(),          // comma-separated
              facebook: z.string().optional(),
              instagram: z.string().optional(),
              twitter: z.string().optional(),
              yelp: z.string().optional(),
              tripadvisor: z.string().optional(),
              rating: z.string().optional(),
              reviewCount: z.string().optional(),
              mondayHours: z.string().optional(),
              tuesdayHours: z.string().optional(),
              wednesdayHours: z.string().optional(),
              thursdayHours: z.string().optional(),
              fridayHours: z.string().optional(),
              saturdayHours: z.string().optional(),
              sundayHours: z.string().optional(),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");

        // Load all categories once for name/slug lookup
        const allCats = await db.select().from(businesses).limit(0); // just to warm db
        const { categories: catsTable } = await import("../drizzle/schema");
        const cats = await db.select().from(catsTable);

        const results: { row: number; action: "created" | "updated" | "error"; name: string; error?: string }[] = [];

        for (let i = 0; i < input.rows.length; i++) {
          const row = input.rows[i];
          try {
            // Resolve category
            const catMatch = cats.find(
              (c) =>
                c.name.toLowerCase() === row.category.toLowerCase() ||
                c.slug.toLowerCase() === row.category.toLowerCase()
            );
            if (!catMatch) throw new Error(`Unknown category: "${row.category}"`);

            // Build slug from name if not provided
            const slug =
              row.slug ||
              row.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");

            // Build hours object
            const hours: Record<string, string> = {};
            if (row.mondayHours) hours.monday = row.mondayHours;
            if (row.tuesdayHours) hours.tuesday = row.tuesdayHours;
            if (row.wednesdayHours) hours.wednesday = row.wednesdayHours;
            if (row.thursdayHours) hours.thursday = row.thursdayHours;
            if (row.fridayHours) hours.friday = row.fridayHours;
            if (row.saturdayHours) hours.saturday = row.saturdayHours;
            if (row.sundayHours) hours.sunday = row.sundayHours;

            // Build social links
            const socialLinks: Record<string, string> = {};
            if (row.facebook) socialLinks.facebook = row.facebook;
            if (row.instagram) socialLinks.instagram = row.instagram;
            if (row.twitter) socialLinks.twitter = row.twitter;
            if (row.yelp) socialLinks.yelp = row.yelp;
            if (row.tripadvisor) socialLinks.tripadvisor = row.tripadvisor;

            const tags = row.tags
              ? row.tags.split(",").map((t) => t.trim()).filter(Boolean)
              : [];

            const tier = row.tier ?? "free";
            const isFeatured = tier === "featured";
            const isSponsored = tier === "sponsored";

            const payload = {
              name: row.name,
              slug,
              categoryId: catMatch.id,
              area: row.area ?? "Siesta Key Village",
              phone: row.phone ?? null,
              email: row.email ?? null,
              website: row.website ?? null,
              address: row.address ?? null,
              shortDescription: row.shortDescription ?? null,
              description: row.description ?? null,
              tier,
              isFeatured,
              isSponsored,
              isActive: true,
              lat: row.lat ?? null,
              lng: row.lng ?? null,
              tags,
              hours,
              socialLinks,
              rating: row.rating ?? "4.5",
              reviewCount: row.reviewCount ? parseInt(row.reviewCount, 10) : 0,
            };

            // Check if slug already exists
            const existing = await db
              .select({ id: businesses.id })
              .from(businesses)
              .where(eq(businesses.slug, slug))
              .limit(1);

            if (existing.length > 0) {
              await db.update(businesses).set(payload).where(eq(businesses.slug, slug));
              results.push({ row: i + 1, action: "updated", name: row.name });
            } else {
              await db.insert(businesses).values({ ...payload, photos: [], isClaimed: false });
              results.push({ row: i + 1, action: "created", name: row.name });
            }
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            results.push({ row: i + 1, action: "error", name: row.name, error: msg });
          }
        }

        const created = results.filter((r) => r.action === "created").length;
        const updated = results.filter((r) => r.action === "updated").length;
        const errors = results.filter((r) => r.action === "error").length;
        return { created, updated, errors, results };
      }),

    stats: adminProcedure.query(async () => {
      const [businesses, claims, submissions] = await Promise.all([
        getAllBusinessesAdmin(),
        getAllClaimLeads(),
        getAllSubmissions(),
      ]);
      return {
        totalBusinesses: businesses.length,
        activeBusinesses: businesses.filter((b) => b.isActive).length,
        featuredBusinesses: businesses.filter((b) => b.isFeatured).length,
        sponsoredBusinesses: businesses.filter((b) => b.isSponsored).length,
        totalClaims: claims.length,
        pendingSubmissions: submissions.filter((s) => s.status === "pending").length,
        approvedSubmissions: submissions.filter((s) => s.status === "approved").length,
        rejectedSubmissions: submissions.filter((s) => s.status === "rejected").length,
      };
    }),
  }),

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // --- Categories ---
  categories: router({
    list: publicProcedure.query(async () => {
      return getAllCategories();
    }),
  }),

  // --- Businesses ---
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
          tier: z.enum(["free", "featured", "sponsored", "featured_sponsored"]).optional(),
          chamberMember: z.boolean().optional(),
          sortBy: z.enum(["default", "name", "category", "tags"]).optional(),
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

  // --- Claim Your Business ---
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

        // 2. Create/update GHL contact and trigger workflow
        try {
          const nameParts = input.contactName.trim().split(" ");
          const firstName = nameParts[0] ?? input.contactName;
          const lastName = nameParts.slice(1).join(" ") || undefined;

          const contactId = await ghlUpsertContact({
            firstName,
            lastName,
            email: input.email,
            phone: input.phone,
            companyName: input.businessName,
            tags: ["Claim Request", "Siesta Key Directory"],
            source: "Shop in Siesta Key - Claim Form",
          });

          if (contactId) {
            await ghlTriggerWorkflow(contactId, GHL_WORKFLOWS.NEW_CLAIM_REQUEST);
            await markClaimLeadWebhookSent(id);
            // Persist the GHL contact ID so approve/reject can fire workflows later
            const db = await getDb();
            if (db) {
              await db.update(claimLeads).set({ ghlContactId: contactId }).where(eq(claimLeads.id, id));
            }
          }
        } catch (err) {
          console.error("[GHL] claim submit error:", err);
        }

        // 3. Notify owner
        await notifyOwner({
          title: `New Business Claim: ${input.businessName}`,
          content: `${input.contactName} (${input.email}) wants to claim "${input.businessName}". ${input.phone ? `Phone: ${input.phone}.` : ""} ${input.message ? `Message: ${input.message}` : ""}`,
        });

        return { success: true, id };
      }),
  }),

  // --- New Listing Submission ---
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
          tier: z.enum(["free", "gulf_breeze", "island_premier"]).default("free"),
        })
      )
      .mutation(async ({ input }) => {
        // 1. Save to DB
        const id = await createListingSubmission(input);

        // 2. Create/update GHL contact and trigger workflows
        try {
          const nameParts = input.contactName.trim().split(" ");
          const firstName = nameParts[0] ?? input.contactName;
          const lastName = nameParts.slice(1).join(" ") || undefined;

          const tierTags = input.tier === "gulf_breeze"
            ? ["Gulf Breeze Plan", "Paid Submission", "New Business Request", "Siesta Key Directory"]
            : input.tier === "island_premier"
            ? ["Island Premier Plan", "Paid Submission", "New Business Request", "Siesta Key Directory"]
            : ["Free Listing", "New Business Request", "Siesta Key Directory"];

          const contactId = await ghlUpsertContact({
            firstName,
            lastName,
            email: input.email,
            phone: input.phone,
            companyName: input.businessName,
            tags: tierTags,
            source: "Shop in Siesta Key - Add Listing Form",
          });

          if (contactId) {
            await ghlTriggerWorkflow(contactId, GHL_WORKFLOWS.NEW_BUSINESS_REQUEST);
            if (input.tier === "free") {
              await ghlTriggerWorkflow(contactId, GHL_WORKFLOWS.NEW_LISTING_ADDED);
              await ghlTriggerWorkflow(contactId, GHL_WORKFLOWS.FREE_LISTING_OUTREACH);
            }
            await markSubmissionWebhookSent(id);
          }
        } catch (err) {
          console.error("[GHL] submission submit error:", err);
        }

        // 3. Notify owner
        await notifyOwner({
          title: `New Listing Submission (${input.tier}): ${input.businessName}`,
          content: `${input.contactName} (${input.email}) submitted a new listing for "${input.businessName}" on the ${input.tier} plan. ${input.address ? `Address: ${input.address}.` : ""} ${input.website ? `Website: ${input.website}.` : ""}`,
        });

        return { success: true, id };
      }),

    // Create a Stripe Checkout session for a paid submission (called right after submit)
    createCheckout: publicProcedure
      .input(
        z.object({
          submissionId: z.number().int().positive(),
          tier: z.enum(["gulf_breeze", "island_premier"]),
          interval: z.enum(["monthly", "yearly"]).default("monthly"),
          contactName: z.string(),
          email: z.string().email(),
          origin: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const { submissionId, tier, interval, contactName, email, origin } = input;
        const url = await createCheckoutSession({
          planKey: tier as PlanKey,
          interval: interval as BillingInterval,
          userId: 0,
          userEmail: email,
          userName: contactName,
          origin,
          submissionId,
        });
        return { url };
      }),
  }),

  // --- Contact Form ---
  contact: router({
    submit: publicProcedure
      .input(
        z.object({
          name: z.string().min(1).max(200),
          email: z.string().email(),
          phone: z.string().optional(),
          subject: z.string().optional(),
          message: z.string().min(1).max(2000),
        })
      )
      .mutation(async ({ input }) => {
        // Create/update GHL contact and trigger workflow
        try {
          const nameParts = input.name.trim().split(" ");
          const firstName = nameParts[0] ?? input.name;
          const lastName = nameParts.slice(1).join(" ") || undefined;

          const contactId = await ghlUpsertContact({
            firstName,
            lastName,
            email: input.email,
            phone: input.phone,
            tags: ["Contact Form", "Siesta Key Directory"],
            source: "Shop in Siesta Key - Contact Form",
          });

          if (contactId) {
            await ghlTriggerWorkflow(contactId, GHL_WORKFLOWS.CONTACT_FORM_SUBMITTED);
          }
        } catch (err) {
          console.error("[GHL] contact submit error:", err);
        }

        // Notify owner
        await notifyOwner({
          title: `Contact Form: ${input.subject ?? "New Message"}`,
          content: `${input.name} (${input.email}) sent a message: "${input.message}"`,
        });

        return { success: true };
      }),
  }),

  // --- Stripe Payments ---
  stripe: router({
    createCheckout: protectedProcedure
      .input(
        z.object({
          planKey: z.enum(["gulf_breeze", "island_premier"]),
          interval: z.enum(["monthly", "yearly"]),
          origin: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const url = await createCheckoutSession({
          planKey: input.planKey as PlanKey,
          interval: input.interval as BillingInterval,
          userId: ctx.user.id,
          userEmail: ctx.user.email ?? "",
          userName: ctx.user.name ?? "",
          origin: input.origin,
        });
        return { url };
      }),

    subscriptionStatus: protectedProcedure.query(async ({ ctx }) => {
      return {
        plan: ctx.user.subscriptionPlan ?? "free",
        status: ctx.user.subscriptionStatus ?? "inactive",
      };
    }),
  }),

  // --- User hooks (trigger GHL on new user) ---

  // --- User Dashboard ---
  dashboard: router({
    getMyProfile: protectedProcedure.query(async ({ ctx }) => {
      return {
        name: ctx.user.name,
        email: ctx.user.email,
        plan: ctx.user.subscriptionPlan ?? "free",
        subscriptionStatus: ctx.user.subscriptionStatus ?? "inactive",
        stripeCustomerId: ctx.user.stripeCustomerId,
        stripeSubscriptionId: ctx.user.stripeSubscriptionId,
      };
    }),

    getMyListing: protectedProcedure.query(async ({ ctx }) => {
      return getBusinessByUserId(ctx.user.id);
    }),

    updateMyListing: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1).max(200).optional(),
          shortDescription: z.string().max(300).optional(),
          description: z.string().max(5000).optional(),
          phone: z.string().max(30).optional(),
          website: z.string().url().optional().or(z.literal("")),
          email: z.string().email().optional().or(z.literal("")),
          address: z.string().max(300).optional(),
          area: z.string().max(100).optional(),
          hours: z.record(z.string(), z.string()).optional(),
          photos: z.array(z.string()).optional(),
          socialLinks: z.record(z.string(), z.string()).optional(),
          lat: z.string().optional(),
          lng: z.string().optional(),
          googleReviewEmbedCode: z.string().max(5000).nullable().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const existing = await getBusinessByUserId(ctx.user.id);
        if (!existing) {
          throw new Error("No claimed listing found for this account.");
        }
        await updateBusinessByUserId(ctx.user.id, input as Parameters<typeof updateBusinessByUserId>[1]);
        return { success: true };
      }),

    // Upload a new photo to S3 and append its URL to the listing's photos array
    uploadPhoto: protectedProcedure
      .input(
        z.object({
          // base64-encoded image data (without data URI prefix)
          base64Data: z.string(),
          mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]),
          fileName: z.string().max(200),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const existing = await getBusinessByUserId(ctx.user.id);
        if (!existing) {
          throw new Error("No claimed listing found for this account.");
        }
        // Validate base64 size (~10MB limit)
        const byteSize = Math.ceil((input.base64Data.length * 3) / 4);
        if (byteSize > 10 * 1024 * 1024) {
          throw new Error("Image must be under 10MB.");
        }
        const buffer = Buffer.from(input.base64Data, "base64");
        const ext = input.mimeType.split("/")[1] ?? "jpg";
        const key = `business-photos/${ctx.user.id}/${Date.now()}-${input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}.${ext}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        // Append new photo URL to existing photos
        const currentPhotos: string[] = Array.isArray(existing.photos) ? (existing.photos as string[]) : [];
        const updatedPhotos = [...currentPhotos, url];
        await updateBusinessByUserId(ctx.user.id, { photos: updatedPhotos });
        return { url, photos: updatedPhotos };
      }),

    // Remove a photo URL from the listing's photos array
    removePhoto: protectedProcedure
      .input(z.object({ photoUrl: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const existing = await getBusinessByUserId(ctx.user.id);
        if (!existing) {
          throw new Error("No claimed listing found for this account.");
        }
        const currentPhotos: string[] = Array.isArray(existing.photos) ? (existing.photos as string[]) : [];
        const updatedPhotos = currentPhotos.filter((p) => p !== input.photoUrl);
        // If the removed photo was the cover, clear coverPhoto too
        const clearCover = (existing as any).coverPhoto === input.photoUrl;
        await updateBusinessByUserId(ctx.user.id, {
          photos: updatedPhotos,
          ...(clearCover ? { coverPhoto: null } : {}),
        });
        return { photos: updatedPhotos };
      }),

    // Set a specific photo as the cover/header image
    setCoverPhoto: protectedProcedure
      .input(z.object({ photoUrl: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const existing = await getBusinessByUserId(ctx.user.id);
        if (!existing) {
          throw new Error("No claimed listing found for this account.");
        }
        const currentPhotos: string[] = Array.isArray(existing.photos) ? (existing.photos as string[]) : [];
        if (!currentPhotos.includes(input.photoUrl)) {
          throw new Error("Photo not found in this listing's gallery.");
        }
        await updateBusinessByUserId(ctx.user.id, { coverPhoto: input.photoUrl });
        return { coverPhoto: input.photoUrl };
      }),
  }),

  users: router({
    onboardNewUser: protectedProcedure.mutation(async ({ ctx }) => {
      const user = ctx.user;
      try {
        const nameParts = (user.name ?? "").trim().split(" ");
        const firstName = nameParts[0] ?? user.name ?? "";
        const lastName = nameParts.slice(1).join(" ") || undefined;

        const contactId = await ghlUpsertContact({
          firstName,
          lastName,
          email: user.email ?? undefined,
          tags: ["New User", "Siesta Key Directory"],
          source: "Shop in Siesta Key - Registration",
        });

        if (contactId) {
          await ghlTriggerWorkflow(contactId, GHL_WORKFLOWS.NEW_USER_CREATED);
        }
      } catch (err) {
        console.error("[GHL] onboardNewUser error:", err);
      }
      return { success: true };
    }),
  }),

  // --- Blog ---
  blog: router({
  list: publicProcedure
    .input(
      z.object({
        publishedOnly: z.boolean().optional().default(true),
        category: z.string().optional(),
        limit: z.number().min(1).max(50).optional().default(20),
        offset: z.number().min(0).optional().default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      return getBlogPosts({
        publishedOnly: input?.publishedOnly ?? true,
        category: input?.category,
        limit: input?.limit ?? 20,
        offset: input?.offset ?? 0,
      });
    }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const post = await getBlogPostBySlug(input.slug);
      if (!post) throw new TRPCError({ code: "NOT_FOUND", message: "Article not found" });
      return post;
    }),

  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(1).max(300),
        slug: z.string().optional(),
        excerpt: z.string().optional(),
        content: z.string().min(1),
        coverImage: z.string().optional(),
        author: z.string().optional().default("Shop in Siesta Key"),
        category: z.string().optional().default("Guide"),
        tags: z.array(z.string()).optional().default([]),
        isPublished: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ input }) => {
      const slug = input.slug || generateSlug(input.title);
      const id = await createBlogPost({
        ...input,
        slug,
        tags: input.tags ?? [],
        isPublished: input.isPublished ?? false,
        publishedAt: input.isPublished ? new Date() : null,
      });
      return { id, slug };
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(300).optional(),
        slug: z.string().optional(),
        excerpt: z.string().optional(),
        content: z.string().min(1).optional(),
        coverImage: z.string().nullable().optional(),
        author: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        isPublished: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateBlogPost(id, data);
      const updated = await getBlogPostById(id);
      return updated;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteBlogPost(input.id);
      return { success: true };
    }),
  }),

  // --- Weather ---
  weather: router({
    getCurrent: publicProcedure.query(async () => {
      // 30-minute server-side cache
      const now = Date.now();
      if (weatherCache && now - weatherCache.fetchedAt < 30 * 60 * 1000) {
        return weatherCache.data;
      }

      // Siesta Key, FL coordinates
      const lat = 27.2683;
      const lon = -82.5479;

      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,uv_index` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
        `&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FNew_York&forecast_days=5`;

      const res = await fetch(url);
      if (!res.ok) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Weather fetch failed" });
      const json = await res.json() as OpenMeteoResponse;

      const c = json.current;
      const d = json.daily;

      const data: WeatherData = {
        tempF: Math.round(c.temperature_2m),
        feelsLikeF: Math.round(c.apparent_temperature),
        humidity: c.relative_humidity_2m,
        windMph: Math.round(c.wind_speed_10m),
        uvIndex: c.uv_index ?? 0,
        weatherCode: c.weather_code,
        condition: wmoDescription(c.weather_code),
        forecast: d.time.map((date: string, i: number) => ({
          date,
          weatherCode: d.weather_code[i],
          condition: wmoDescription(d.weather_code[i]),
          highF: Math.round(d.temperature_2m_max[i]),
          lowF: Math.round(d.temperature_2m_min[i]),
        })),
        fetchedAt: now,
      };

      weatherCache = { data, fetchedAt: now };
      return data;
    }),
  }),
});

export type AppRouter = typeof appRouter;
