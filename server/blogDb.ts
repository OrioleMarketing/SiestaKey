import { eq, desc, and } from "drizzle-orm";
import { getDb } from "./db";
import { blogPosts, type BlogPost, type InsertBlogPost } from "../drizzle/schema";

// ─── Read ──────────────────────────────────────────────────────────────────────

export async function getBlogPosts(opts?: {
  publishedOnly?: boolean;
  category?: string;
  limit?: number;
  offset?: number;
}): Promise<BlogPost[]> {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (opts?.publishedOnly) conditions.push(eq(blogPosts.isPublished, true));
  if (opts?.category) conditions.push(eq(blogPosts.category, opts.category));

  return db
    .select()
    .from(blogPosts)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.createdAt))
    .limit(opts?.limit ?? 100)
    .offset(opts?.offset ?? 0);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function getBlogPostById(id: number): Promise<BlogPost | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.id, id))
    .limit(1);
  return rows[0] ?? null;
}

// ─── Write ─────────────────────────────────────────────────────────────────────

export async function createBlogPost(
  data: Omit<InsertBlogPost, "id" | "createdAt" | "updatedAt">
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(blogPosts).values({
    ...data,
    publishedAt: data.isPublished ? (data.publishedAt ?? new Date()) : null,
  });
  return (result as any)[0]?.insertId ?? 0;
}

export async function updateBlogPost(
  id: number,
  data: Partial<Omit<InsertBlogPost, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const updateData: Record<string, unknown> = { ...data };
  // Auto-set publishedAt when first publishing
  if (data.isPublished === true && !data.publishedAt) {
    updateData.publishedAt = new Date();
  }
  await db.update(blogPosts).set(updateData).where(eq(blogPosts.id, id));
}

export async function deleteBlogPost(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(blogPosts).where(eq(blogPosts.id, id));
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 180);
}
