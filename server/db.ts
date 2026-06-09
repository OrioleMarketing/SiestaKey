import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  Business,
  BusinessEvent,
  InsertBusinessEvent,
  Category,
  ClaimLead,
  InsertUser,
  ListingSubmission,
  businessEvents,
  businesses,
  categories,
  claimLeads,
  listingSubmissions,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ─────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];

  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  };

  textFields.forEach(assignNullable);

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Categories ────────────────────────────────────────────────────────────────
export async function getAllCategories(): Promise<Category[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(categories.sortOrder);
}

// ─── Businesses ────────────────────────────────────────────────────────────────
export async function getFeaturedBusinesses(): Promise<Business[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(businesses)
    .where(and(eq(businesses.isActive, true), eq(businesses.isFeatured, true)))
    .orderBy(desc(businesses.isSponsored), desc(businesses.reviewCount));
}

export async function getBusinesses(opts: {
  categorySlug?: string;
  keyword?: string;
  area?: string;
  tier?: "free" | "featured" | "sponsored" | "featured_sponsored";
  chamberMember?: boolean;
  sortBy?: "default" | "name" | "category" | "tags";
  page?: number;
  limit?: number;
}): Promise<{ items: Business[]; total: number }> {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  const { categorySlug, keyword, area, tier, chamberMember, sortBy = "default", page = 1, limit = 12 } = opts;
  const offset = (page - 1) * limit;

  // Build conditions
  const conditions = [eq(businesses.isActive, true)];

  if (tier) {
    if (tier === "featured_sponsored") {
      conditions.push(
        or(
          eq(businesses.tier, "featured"),
          eq(businesses.tier, "sponsored")
        )!
      );
    } else {
      // tier is narrowed to "free" | "featured" | "sponsored" here
      const tierVal = tier as "free" | "featured" | "sponsored";
      conditions.push(eq(businesses.tier, tierVal));
    }
  }

  if (categorySlug && categorySlug !== "all") {
    const cat = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, categorySlug))
      .limit(1);
    if (cat.length > 0) {
      conditions.push(eq(businesses.categoryId, cat[0].id));
    }
  }

  if (keyword) {
    const kw = `%${keyword}%`;
    conditions.push(
      or(
        like(businesses.name, kw),
        like(businesses.description, kw),
        like(businesses.shortDescription, kw),
        like(businesses.address, kw)
      )!
    );
  }

  if (area) {
    conditions.push(like(businesses.area, `%${area}%`));
  }

  if (chamberMember) {
    conditions.push(eq(businesses.isChamberMember, true));
  }

  const whereClause = and(...conditions);

  const [items, countResult] = await Promise.all([
    db
      .select()
      .from(businesses)
      .where(whereClause)
      .orderBy(
        ...(sortBy === "name"
          ? [
              desc(businesses.isSponsored),
              desc(businesses.isFeatured),
              desc(businesses.isClaimed),
              asc(businesses.name),
            ]
          : sortBy === "category"
          ? [
              asc(businesses.categoryId),
              desc(businesses.isSponsored),
              desc(businesses.isFeatured),
              desc(businesses.isClaimed),
              asc(businesses.name),
            ]
          : sortBy === "tags"
          ? [
              desc(businesses.isSponsored),
              desc(businesses.isFeatured),
              desc(businesses.isClaimed),
              asc(businesses.name),
            ]
          : [
              desc(businesses.isSponsored),
              desc(businesses.isFeatured),
              desc(businesses.isClaimed),
              asc(businesses.name),
            ]
        )
      )
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(businesses)
      .where(whereClause),
  ]);

  return { items, total: Number(countResult[0]?.count ?? 0) };
}

export async function getBusinessBySlug(
  slug: string
): Promise<(Business & { categorySlug: string | null }) | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  // Fetch the business first
  const bizResult = await db
    .select()
    .from(businesses)
    .where(and(eq(businesses.slug, slug), eq(businesses.isActive, true)))
    .limit(1);
  if (bizResult.length === 0) return undefined;
  const biz = bizResult[0];
  // Fetch category slug separately to avoid TypeScript spread issues
  const catResult = await db
    .select({ slug: categories.slug })
    .from(categories)
    .where(eq(categories.id, biz.categoryId))
    .limit(1);
  return { ...biz, categorySlug: catResult[0]?.slug ?? null };
}

export async function getRelatedBusinesses(categoryId: number, excludeId: number): Promise<Business[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(businesses)
    .where(
      and(
        eq(businesses.categoryId, categoryId),
        eq(businesses.isActive, true),
        sql`${businesses.id} != ${excludeId}`
      )
    )
    .orderBy(desc(businesses.isFeatured), desc(businesses.reviewCount))
    .limit(3);
}

// ─── Claim Leads ───────────────────────────────────────────────────────────────
export async function createClaimLead(data: {
  businessId?: number | null;
  businessName: string;
  contactName: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  ghlContactId?: string | null;
}): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.insert(claimLeads).values({
    businessId: data.businessId ?? null,
    businessName: data.businessName,
    contactName: data.contactName,
    email: data.email,
    phone: data.phone ?? null,
    message: data.message ?? null,
    ghlWebhookSent: false,
    ghlContactId: data.ghlContactId ?? null,
  });
  return Number((result as any)[0]?.insertId ?? 0);
}

export async function updateClaimStatus(
  id: number,
  status: "approved" | "rejected",
  approvedAt?: Date,
  rejectionReason?: string,
  rejectionNotes?: string,
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(claimLeads)
    .set({
      status,
      approvedAt: status === "approved" ? (approvedAt ?? new Date()) : null,
      rejectionReason: status === "rejected" ? (rejectionReason ?? null) : null,
      rejectionNotes: status === "rejected" ? (rejectionNotes ?? null) : null,
    })
    .where(eq(claimLeads.id, id));
}

export async function markClaimLeadWebhookSent(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(claimLeads).set({ ghlWebhookSent: true }).where(eq(claimLeads.id, id));
}

// ─── Listing Submissions ───────────────────────────────────────────────────────
export async function createListingSubmission(data: {
  businessName: string;
  categoryId?: number;
  contactName: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  description?: string;
  tier?: "free" | "gulf_breeze" | "island_premier";
  hours?: Record<string, string>;
  socialLinks?: Record<string, string>;
  coverPhoto?: string;
  photos?: string[];
  googleReviewEmbedCode?: string;
  videoEmbed?: string;
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(listingSubmissions).values({
    businessName: data.businessName,
    categoryId: data.categoryId ?? null,
    contactName: data.contactName,
    email: data.email,
    phone: data.phone ?? null,
    website: data.website ?? null,
    address: data.address ?? null,
    description: data.description ?? null,
    tier: data.tier ?? "free",
    hours: data.hours ?? null,
    socialLinks: data.socialLinks ?? null,
    coverPhoto: data.coverPhoto ?? null,
    photos: data.photos ?? null,
    googleReviewEmbedCode: data.googleReviewEmbedCode ?? null,
    videoEmbed: data.videoEmbed ?? null,
    status: "pending",
    ghlWebhookSent: false,
  });
  return Number((result as any)[0]?.insertId ?? 0);
}

export async function updateSubmissionStripeIds(
  id: number,
  data: {
    stripeCheckoutSessionId?: string | null;
    stripePaymentIntentId?: string | null;
    stripeSubscriptionId?: string | null;
    createdBusinessId?: number | null;
    createdBusinessSlug?: string | null;
  }
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(listingSubmissions).set(data).where(eq(listingSubmissions.id, id));
}

export async function markSubmissionWebhookSent(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(listingSubmissions)
    .set({ ghlWebhookSent: true })
    .where(eq(listingSubmissions.id, id));
}

// ─── Dashboard / User-owned listing ──────────────────────────────────────────
export async function getBusinessByUserId(userId: number): Promise<Business | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(businesses)
    .where(eq(businesses.claimedByUserId, userId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateBusinessByUserId(
  userId: number,
  data: {
    name?: string;
    shortDescription?: string;
    description?: string;
    phone?: string;
    website?: string;
    email?: string;
    address?: string;
    area?: string;
    hours?: Record<string, string>;
    photos?: string[];
    coverPhoto?: string | null;
    socialLinks?: Record<string, string>;
    lat?: string;
    lng?: string;
    googleReviewEmbedCode?: string | null;
  }
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(businesses)
    .set(data)
    .where(eq(businesses.claimedByUserId, userId));
}

// ─── Admin Helpers ─────────────────────────────────────────────────────────────
export async function getAllBusinessesAdmin(): Promise<Business[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(businesses).orderBy(desc(businesses.createdAt));
}

export async function updateBusinessFlags(
  id: number,
  flags: {
    isFeatured?: boolean;
    isSponsored?: boolean;
    isActive?: boolean;
    isClaimed?: boolean;
    tier?: "free" | "featured" | "sponsored";
  }
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(businesses).set(flags).where(eq(businesses.id, id));
}

export async function getAllClaimLeads(): Promise<ClaimLead[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(claimLeads).orderBy(desc(claimLeads.createdAt));
}

export async function getAllSubmissions(): Promise<ListingSubmission[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(listingSubmissions).orderBy(desc(listingSubmissions.createdAt));
}

export async function updateSubmissionStatus(
  id: number,
  status: "pending" | "approved" | "rejected",
  rejectionReason?: string,
  rejectionNotes?: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const update: Record<string, unknown> = { status };
  if (status === "rejected") {
    update.rejectionReason = rejectionReason ?? null;
    update.rejectionNotes = rejectionNotes ?? null;
  } else {
    // Clear rejection fields if re-approving or resetting
    update.rejectionReason = null;
    update.rejectionNotes = null;
  }
  await db.update(listingSubmissions).set(update).where(eq(listingSubmissions.id, id));
}

// ─── Business Events ──────────────────────────────────────────────────────────────────────────────

export async function getEventsByBusinessId(businessId: number): Promise<BusinessEvent[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(businessEvents)
    .where(and(eq(businessEvents.businessId, businessId), eq(businessEvents.isPublished, true)))
    .orderBy(asc(businessEvents.startDate), desc(businessEvents.createdAt));
}

export async function getAllEventsAdmin(): Promise<(BusinessEvent & { businessName: string })[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      id: businessEvents.id,
      businessId: businessEvents.businessId,
      type: businessEvents.type,
      title: businessEvents.title,
      description: businessEvents.description,
      startDate: businessEvents.startDate,
      endDate: businessEvents.endDate,
      location: businessEvents.location,
      imageUrl: businessEvents.imageUrl,
      isPublished: businessEvents.isPublished,
      createdAt: businessEvents.createdAt,
      updatedAt: businessEvents.updatedAt,
      businessName: businesses.name,
    })
    .from(businessEvents)
    .leftJoin(businesses, eq(businessEvents.businessId, businesses.id))
    .orderBy(desc(businessEvents.createdAt));
  return rows as (BusinessEvent & { businessName: string })[];
}

export async function upsertEvent(
  data: Omit<InsertBusinessEvent, "createdAt" | "updatedAt"> & { id?: number }
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  if (data.id) {
    const { id, ...rest } = data;
    await db.update(businessEvents).set(rest).where(eq(businessEvents.id, id));
    return id;
  }
  const { id: _id, ...insertData } = data;
  const [result] = await db.insert(businessEvents).values(insertData);
  return (result as any).insertId as number;
}

export async function deleteEvent(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(businessEvents).where(eq(businessEvents.id, id));
}

export async function getUpcomingEvents(limit = 5): Promise<(BusinessEvent & { businessName: string; businessSlug: string })[]> {
  const db = await getDb();
  if (!db) return [];
  const now = new Date().toISOString();
  const rows = await db
    .select({
      id: businessEvents.id,
      businessId: businessEvents.businessId,
      type: businessEvents.type,
      title: businessEvents.title,
      description: businessEvents.description,
      startDate: businessEvents.startDate,
      endDate: businessEvents.endDate,
      location: businessEvents.location,
      imageUrl: businessEvents.imageUrl,
      isPublished: businessEvents.isPublished,
      createdAt: businessEvents.createdAt,
      updatedAt: businessEvents.updatedAt,
      businessName: businesses.name,
      businessSlug: businesses.slug,
    })
    .from(businessEvents)
    .leftJoin(businesses, eq(businessEvents.businessId, businesses.id))
    .where(
      and(
        eq(businessEvents.isPublished, true),
        eq(businessEvents.type, "event"),
        // startDate >= now OR startDate is null (announcements already filtered by type)
      )
    )
    .orderBy(asc(businessEvents.startDate))
    .limit(limit);
  // Filter client-side for startDate >= now (avoids complex SQL date comparison across MySQL versions)
  const upcoming = rows.filter((r) => !r.startDate || r.startDate >= now);
  return upcoming.slice(0, limit) as (BusinessEvent & { businessName: string; businessSlug: string })[];
}
