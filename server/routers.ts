import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { notifyOwner } from "./_core/notification";
import { systemRouter } from "./_core/systemRouter";
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
  updateSubmissionStatus,
  getDb,
} from "./db";
import { businesses, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import {
  GHL_WORKFLOWS,
  ghlAddTags,
  ghlTriggerWorkflow,
  ghlUpsertContact,
} from "./ghl";
import { createCheckoutSession } from "./stripeWebhook";
import { storagePut } from "./storage";
import { type PlanKey, type BillingInterval } from "./stripeProducts";

export const appRouter = router({
  system: systemRouter,

  // ─── Admin Panel ─────────────────────────────────────────────────────────────
  admin: router({
    listBusinesses: adminProcedure.query(async () => {
      return getAllBusinessesAdmin();
    }),

    updateBusiness: adminProcedure
      .input(
        z.object({
          id: z.number(),
          isFeatured: z.boolean().optional(),
          isSponsored: z.boolean().optional(),
          isActive: z.boolean().optional(),
          isClaimed: z.boolean().optional(),
          tier: z.enum(["free", "featured", "sponsored"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...flags } = input;
        await updateBusinessFlags(id, flags);
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
        })
      )
      .mutation(async ({ input }) => {
        await updateSubmissionStatus(input.id, input.status);
        return { success: true };
      }),

    // Approve/reject a claim and trigger the appropriate GHL workflow
    approveClaim: adminProcedure
      .input(z.object({ claimId: z.number(), businessId: z.number().optional(), claimEmail: z.string().email().optional(), contactId: z.string().optional() }))
      .mutation(async ({ input }) => {
        // Link the business to the user who submitted the claim (by email match)
        if (input.businessId && input.claimEmail) {
          const db = await getDb();
          if (db) {
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
          }
        }
        // Trigger GHL workflow
        if (input.contactId) {
          await ghlAddTags(input.contactId, ["Claim Approved"]);
          await ghlTriggerWorkflow(input.contactId, GHL_WORKFLOWS.CLAIM_REQUEST_APPROVED);
        }
        return { success: true };
      }),

    rejectClaim: adminProcedure
      .input(z.object({ claimId: z.number(), contactId: z.string().optional() }))
      .mutation(async ({ input }) => {
        if (input.contactId) {
          await ghlAddTags(input.contactId, ["Claim Rejected"]);
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

        // 2. Create/update GHL contact and trigger workflows
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
            tags: ["Free Listing", "New Business Request", "Siesta Key Directory"],
            source: "Shop in Siesta Key - Add Listing Form",
          });

          if (contactId) {
            await ghlTriggerWorkflow(contactId, GHL_WORKFLOWS.NEW_BUSINESS_REQUEST);
            await ghlTriggerWorkflow(contactId, GHL_WORKFLOWS.NEW_LISTING_ADDED);
            await ghlTriggerWorkflow(contactId, GHL_WORKFLOWS.FREE_LISTING_OUTREACH);
            await markSubmissionWebhookSent(id);
          }
        } catch (err) {
          console.error("[GHL] submission submit error:", err);
        }

        // 3. Notify owner
        await notifyOwner({
          title: `New Listing Submission: ${input.businessName}`,
          content: `${input.contactName} (${input.email}) submitted a new listing for "${input.businessName}". ${input.address ? `Address: ${input.address}.` : ""} ${input.website ? `Website: ${input.website}.` : ""}`,
        });

        return { success: true, id };
      }),
  }),

  // ─── Contact Form ────────────────────────────────────────────────────────────
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

  // ─── Stripe Payments ────────────────────────────────────────────────────────
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

  // ─── User hooks (trigger GHL on new user) ────────────────────────────────────

  // ─── User Dashboard ─────────────────────────────────────────────────────────
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
        await updateBusinessByUserId(ctx.user.id, { photos: updatedPhotos });
        return { photos: updatedPhotos };
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
});

export type AppRouter = typeof appRouter;
