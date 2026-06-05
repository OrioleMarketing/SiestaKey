import { Helmet } from "react-helmet-async";

const SITE_NAME = "Shop in Siesta Key";
export const BASE_URL = "https://shopinsiestakey.com";
const DEFAULT_IMAGE = `${BASE_URL}/manus-storage/SiestaKey-hero_60f0f3c1.webp`;
const DEFAULT_DESCRIPTION =
  "Your premier guide to dining, shopping, activities, nightlife, and accommodations on Siesta Key — Florida's #1 beach destination.";

interface SEOProps {
  /** Page title — will be appended with " | Shop in Siesta Key" */
  title?: string;
  /** Meta description (keep under 160 characters) */
  description?: string;
  /** Canonical path, e.g. "/directory/dining" */
  canonical?: string;
  /** Open Graph image URL (absolute) */
  image?: string;
  /** "website" for static pages, "article" for blog/profile pages */
  type?: "website" | "article";
  /** Prevent search engines from indexing this page */
  noIndex?: boolean;
  /** One or more JSON-LD structured data objects to inject into <head> */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Drop-in SEO head component.
 * Renders <title>, meta description, Open Graph, Twitter Card, canonical link,
 * and optional JSON-LD structured data for rich search results.
 *
 * Usage:
 *   <SEO title="Dining" description="Best restaurants on Siesta Key." canonical="/directory/dining" />
 *   <SEO jsonLd={{ "@context": "https://schema.org", "@type": "WebSite", ... }} />
 */
export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  image = DEFAULT_IMAGE,
  type = "website",
  noIndex = false,
  jsonLd,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Siesta Key Business Directory`;
  const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : undefined;

  // Normalise to array so we can render multiple schema blocks
  const schemas = jsonLd
    ? Array.isArray(jsonLd)
      ? jsonLd
      : [jsonLd]
    : [];

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD Structured Data */}
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
