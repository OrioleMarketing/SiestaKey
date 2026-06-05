import { Express, Request, Response } from "express";
import { getDb } from "./db";
import { businesses, categories } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const BASE_URL = "https://shopinsiestakey.com";

// Static pages that should always be in the sitemap
const STATIC_PAGES = [
  { loc: "/", changefreq: "daily", priority: "1.0" },
  { loc: "/directory", changefreq: "daily", priority: "0.9" },
  { loc: "/pricing", changefreq: "weekly", priority: "0.7" },
  { loc: "/claim", changefreq: "monthly", priority: "0.6" },
  { loc: "/contact", changefreq: "monthly", priority: "0.5" },
];

// Category slugs for directory sub-pages
const CATEGORY_SLUGS = [
  "dining",
  "shopping",
  "activities",
  "nightlife",
  "accommodations",
  "services",
  "wellness",
  "real-estate",
];

function xmlEscape(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSitemapXml(
  staticUrls: { loc: string; changefreq: string; priority: string; lastmod?: string }[],
  businessUrls: { loc: string; lastmod: string }[]
): string {
  const now = new Date().toISOString().split("T")[0];

  const staticEntries = staticUrls
    .map(
      (u) => `  <url>
    <loc>${xmlEscape(BASE_URL + u.loc)}</loc>
    <lastmod>${u.lastmod ?? now}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join("\n");

  const categoryEntries = CATEGORY_SLUGS.map(
    (slug) => `  <url>
    <loc>${xmlEscape(`${BASE_URL}/directory/${slug}`)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`
  ).join("\n");

  const businessEntries = businessUrls
    .map(
      (u) => `  <url>
    <loc>${xmlEscape(BASE_URL + u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
          http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${staticEntries}
${categoryEntries}
${businessEntries}
</urlset>`;
}

export function registerSitemapRoutes(app: Express): void {
  // ── /sitemap.xml ─────────────────────────────────────────────────────────────
  app.get("/sitemap.xml", async (_req: Request, res: Response) => {
    try {
      const db = await getDb();

      let businessUrls: { loc: string; lastmod: string }[] = [];

      if (db) {
        const rows = await db
          .select({
            slug: businesses.slug,
            updatedAt: businesses.updatedAt,
          })
          .from(businesses)
          .where(eq(businesses.isActive, true));

        businessUrls = rows.map((r) => ({
          loc: `/business/${r.slug}`,
          lastmod: r.updatedAt
            ? new Date(r.updatedAt).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
        }));
      }

      const xml = buildSitemapXml(STATIC_PAGES, businessUrls);

      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=3600"); // cache 1 hour
      res.status(200).send(xml);
    } catch (err) {
      console.error("[Sitemap] Error generating sitemap:", err);
      res.status(500).send("Error generating sitemap");
    }
  });

  // ── /robots.txt ──────────────────────────────────────────────────────────────
  app.get("/robots.txt", (_req: Request, res: Response) => {
    const robotsTxt = `User-agent: *
Allow: /

# Disallow admin and API routes
Disallow: /admin
Disallow: /api/
Disallow: /dashboard

# Sitemap
Sitemap: ${BASE_URL}/sitemap.xml
`;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=86400"); // cache 24 hours
    res.status(200).send(robotsTxt);
  });
}
