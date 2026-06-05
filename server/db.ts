import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  Business,
  Category,
  ClaimLead,
  InsertUser,
  ListingSubmission,
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
  page?: number;
  limit?: number;
}): Promise<{ items: Business[]; total: number }> {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  const { categorySlug, keyword, area, tier, page = 1, limit = 12 } = opts;
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

  const whereClause = and(...conditions);

  const [items, countResult] = await Promise.all([
    db
      .select()
      .from(businesses)
      .where(whereClause)
      .orderBy(
        desc(businesses.isSponsored),
        desc(businesses.isFeatured),
        asc(businesses.name)
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

export async function getBusinessBySlug(slug: string): Promise<Business | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(businesses)
    .where(and(eq(businesses.slug, slug), eq(businesses.isActive, true)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
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
  status: "pending" | "approved" | "rejected"
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(listingSubmissions).set({ status }).where(eq(listingSubmissions.id, id));
}
