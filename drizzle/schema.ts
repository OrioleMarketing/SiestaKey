import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  json,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 100 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 100 }),
  subscriptionPlan: mysqlEnum("subscriptionPlan", ["free", "gulf_breeze", "island_premier"]).default("free"),
  subscriptionStatus: varchar("subscriptionStatus", { length: 50 }).default("inactive"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Categories ────────────────────────────────────────────────────────────────
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  icon: varchar("icon", { length: 50 }).notNull().default("store"),
  description: text("description"),
  sortOrder: int("sortOrder").default(0),
});

export type Category = typeof categories.$inferSelect;

// ─── Businesses ────────────────────────────────────────────────────────────────
export const businesses = mysqlTable("businesses", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 150 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  categoryId: int("categoryId").notNull(),
  description: text("description"),
  shortDescription: varchar("shortDescription", { length: 300 }),
  address: varchar("address", { length: 300 }),
  area: varchar("area", { length: 100 }).default("Siesta Key Village"),
  phone: varchar("phone", { length: 30 }),
  website: varchar("website", { length: 300 }),
  email: varchar("email", { length: 200 }),
  // JSON array of photo URLs
  photos: json("photos").$type<string[]>().default([]),
  // JSON object: { monday: "9am-5pm", ... }
  hours: json("hours").$type<Record<string, string>>().default({}),
  // Map coordinates
  lat: varchar("lat", { length: 30 }),
  lng: varchar("lng", { length: 30 }),
  // Listing tier
  tier: mysqlEnum("tier", ["free", "featured", "sponsored"]).default("free").notNull(),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  isSponsored: boolean("isSponsored").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  isClaimed: boolean("isClaimed").default(false).notNull(),
  claimedByUserId: int("claimedByUserId"),
  // JSON object: { facebook, instagram, twitter, yelp, tripadvisor }
  socialLinks: json("socialLinks").$type<Record<string, string>>().default({}),
  // Ratings
  rating: varchar("rating", { length: 5 }).default("4.5"),
  reviewCount: int("reviewCount").default(0),
  tags: json("tags").$type<string[]>().default([]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Business = typeof businesses.$inferSelect;
export type InsertBusiness = typeof businesses.$inferInsert;

// ─── Claim Leads ───────────────────────────────────────────────────────────────
export const claimLeads = mysqlTable("claim_leads", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId"),
  businessName: varchar("businessName", { length: 200 }).notNull(),
  contactName: varchar("contactName", { length: 200 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  message: text("message"),
  ghlWebhookSent: boolean("ghlWebhookSent").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ClaimLead = typeof claimLeads.$inferSelect;

// ─── New Listing Submissions ───────────────────────────────────────────────────
export const listingSubmissions = mysqlTable("listing_submissions", {
  id: int("id").autoincrement().primaryKey(),
  businessName: varchar("businessName", { length: 200 }).notNull(),
  categoryId: int("categoryId"),
  contactName: varchar("contactName", { length: 200 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  website: varchar("website", { length: 300 }),
  address: varchar("address", { length: 300 }),
  description: text("description"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  ghlWebhookSent: boolean("ghlWebhookSent").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ListingSubmission = typeof listingSubmissions.$inferSelect;
