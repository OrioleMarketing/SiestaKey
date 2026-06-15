import { useEffect, useRef } from "react";
import { useParams, Link } from "wouter";
import {
  MapPin, Phone, Globe, Clock, Star, ArrowLeft, Crown, Sparkles,
  Share2, ExternalLink, ChevronRight, Mail, BadgeCheck,
  Facebook, Instagram, Twitter, Youtube, Linkedin,
  Calendar, Megaphone, MapPin as LocationPin, Camera
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BusinessCard from "@/components/BusinessCard";
import { MapView } from "@/components/Map";
import SEO from "@/components/SEO";

const LIFEGUARD_DEFAULT = "/manus-storage/LifeguardStand_453b6dda.png";
const PANORAMA_DEFAULT = "/manus-storage/SiestaKey_panorama_734eb779.webp";

// AI-generated covers are hosted on this CloudFront distribution
const AI_COVER_CDN = "d2xsxph8kpxj0f.cloudfront.net";

function isAiGeneratedCover(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes(AI_COVER_CDN) || url.includes("SiestaKey_panorama") || url.includes("LifeguardStand");
}

function StarRating({ rating, count }: { rating: string; count: number }) {
  const r = parseFloat(rating);
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i <= Math.round(r) ? "fill-[var(--color-gold)] text-[var(--color-gold)]" : "text-[var(--color-border)]"}`}
          />
        ))}
      </div>
      <span className="font-semibold text-sm">{r.toFixed(1)}</span>
      <span className="text-sm text-[var(--color-muted-foreground)]">({count.toLocaleString()} reviews)</span>
    </div>
  );
}

const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Normalize hours object to always use Title-case keys (handles CSV imports that use lowercase)
function normalizeHours(raw: Record<string, string> | null): Record<string, string> {
  if (!raw) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    const normalized = k.charAt(0).toUpperCase() + k.slice(1).toLowerCase();
    out[normalized] = v;
  }
  return out;
}

// Maps category slugs to schema.org LocalBusiness subtypes for richer search results
// See: https://schema.org/LocalBusiness
const CATEGORY_SCHEMA_TYPE: Record<string, string> = {
  dining: "Restaurant",
  shopping: "Store",
  activities: "TouristAttraction",
  nightlife: "BarOrPub",
  accommodations: "LodgingBusiness",
  services: "ProfessionalService",
  wellness: "HealthAndBeautyBusiness",
  "real-estate": "RealEstateAgent",
};

// Maps category slugs to Open Graph object types for richer social share cards
// See: https://ogp.me/#types
const CATEGORY_OG_TYPE: Record<string, string> = {
  dining: "restaurant.restaurant",
  shopping: "business.business",
  activities: "place",
  nightlife: "bar",
  accommodations: "hotel",
  services: "business.business",
  wellness: "business.business",
  "real-estate": "business.business",
};

const SOCIAL_ICONS: Record<string, React.ElementType> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  linkedin: Linkedin,
};

export default function BusinessProfile() {
  const { slug } = useParams<{ slug: string }>();
  const mapRef = useRef<google.maps.Map | null>(null);

  const { user } = useAuth();
  const { data: business, isLoading } = trpc.businesses.bySlug.useQuery({ slug: slug ?? "" });
  const { data: related } = trpc.businesses.related.useQuery(
    { categoryId: business?.categoryId ?? 0, excludeId: business?.id ?? 0 },
    { enabled: !!business }
  );
  const { data: events } = trpc.events.list.useQuery(
    { businessId: business?.id ?? 0 },
    { enabled: !!business?.id && business?.tier === "sponsored" }
  );

  const handleMapReady = (map: google.maps.Map) => {
    mapRef.current = map;
    if (!business?.lat || !business?.lng) return;
    const lat = parseFloat(business.lat);
    const lng = parseFloat(business.lng);
    if (isNaN(lat) || isNaN(lng)) return;
    map.setCenter({ lat, lng });
    map.setZoom(16);
    new google.maps.Marker({
      position: { lat, lng },
      map,
      title: business.name,
      // Use the standard Google Maps red pin (default marker — no custom icon)
    });
  };

  const rawHours = business?.hours as Record<string, string> | null;
  const hours = normalizeHours(rawHours);
  const tags = Array.isArray(business?.tags) ? (business.tags as string[]) : [];
  const photos = Array.isArray(business?.photos) ? (business.photos as string[]) : [];
  const socialLinks = (business?.socialLinks as Record<string, string> | null) ?? {};

  // Tier helpers
  const isFree = business?.tier === "free";
  const isGulfBreeze = business?.tier === "featured";
  const isIslandPremier = business?.tier === "sponsored";
  const isPaid = isGulfBreeze || isIslandPremier;

  // Cover image: use designated coverPhoto, fall back to first photo, then panorama default for all businesses
  const coverImage = (business as any)?.coverPhoto
    ? (business as any).coverPhoto
    : photos.length > 0
      ? photos[0]
      : PANORAMA_DEFAULT;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 pt-24 pb-16">
          <div className="container max-w-5xl">
            <div className="skeleton h-72 w-full rounded-2xl mb-6" />
            <div className="skeleton h-8 w-1/2 mb-4" />
            <div className="skeleton h-5 w-3/4 mb-8" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 pt-32 text-center">
          <div className="text-5xl mb-4">🌊</div>
          <h2 className="font-serif text-2xl font-bold mb-2">Business Not Found</h2>
          <p className="text-[var(--color-muted-foreground)] mb-6">This listing may have been removed.</p>
          <Link href="/directory" className="btn-ocean">Back to Directory</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const seoDesc = business.description
    ? `${business.description.slice(0, 145).trimEnd()}…`
    : `Visit ${business.name} on Siesta Key, Florida. Find hours, location, contact info, and more.`;
  const seoImage = photos.length > 0
    ? `https://shopinsiestakey.com${photos[0].startsWith('/') ? '' : '/'}${photos[0]}`
    : `https://shopinsiestakey.com/manus-storage/SiestaKey_panorama_734eb779.webp`;

  // ── JSON-LD Structured Data ──────────────────────────────────────────────
  const categorySlug = (business as any).categorySlug as string | null;
  const schemaType = (categorySlug && CATEGORY_SCHEMA_TYPE[categorySlug]) ?? "LocalBusiness";
  const ogTypeValue = (categorySlug && CATEGORY_OG_TYPE[categorySlug]) ?? "business.business";

  const businessSchema: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": schemaType,
      "@id": `https://shopinsiestakey.com/business/${business.slug}`,
      "name": business.name,
      "description": seoDesc,
      "url": `https://shopinsiestakey.com/business/${business.slug}`,
      "image": seoImage,
      ...(business.address ? {
        "address": {
          "@type": "PostalAddress",
          "streetAddress": business.address,
          "addressLocality": "Siesta Key",
          "addressRegion": "FL",
          "addressCountry": "US"
        }
      } : {}),
      ...(business.phone ? { "telephone": business.phone } : {}),
      ...(business.website ? { "sameAs": business.website } : {}),
      ...(business.email ? { "email": business.email } : {}),
      ...(business.lat && business.lng ? {
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": business.lat,
          "longitude": business.lng
        }
      } : {}),
      ...(business.rating && business.reviewCount && business.reviewCount > 0 ? {
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": business.rating,
          "reviewCount": business.reviewCount,
          "bestRating": "5",
          "worstRating": "1"
        }
      } : {}),
      ...(Object.keys(hours).length > 0 ? {
        "openingHoursSpecification": Object.entries(hours).map(([day, timeStr]) => ({
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": `https://schema.org/${day}`,
          "opens": timeStr.split("-")[0]?.trim() ?? "",
          "closes": timeStr.split("-")[1]?.trim() ?? ""
        }))
      } : {}),
      "isPartOf": { "@id": "https://shopinsiestakey.com/#website" }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://shopinsiestakey.com" },
        { "@type": "ListItem", "position": 2, "name": "Directory", "item": "https://shopinsiestakey.com/directory" },
        { "@type": "ListItem", "position": 3, "name": business.name, "item": `https://shopinsiestakey.com/business/${business.slug}` }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-white-sand)]">
      <SEO
        title={`${business.name} — Siesta Key`}
        description={seoDesc}
        canonical={`/business/${business.slug}`}
        image={seoImage}
        type="article"
        ogType={ogTypeValue}
        jsonLd={businessSchema}
      />
      <Navbar />

      {/* ── Hero Cover Image ──────────────────────────────────────────────────── */}
      <div className="relative pt-16 w-full" style={{ minHeight: coverImage ? "360px" : "80px" }}>
        {coverImage ? (
          <>
            <img
              src={coverImage}
              alt={business.name}
              className="w-full object-cover"
              style={{ height: "360px" }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50" />
          </>
        ) : (
          <div
            className={`w-full h-20 ${
              isIslandPremier
                ? "bg-gradient-to-r from-[var(--color-gold)] to-[oklch(0.68_0.18_55)]"
                : isPaid
                ? "bg-ocean-gradient"
                : "bg-gradient-to-r from-[var(--color-seafoam)] to-[var(--color-ocean-pale)]"
            }`}
          />
        )}

        {/* Badges overlaid on image */}
        {coverImage && (
          <>
            <div className="absolute top-20 left-4 flex gap-2">
              {business.isSponsored && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[var(--color-gold)] text-white shadow-lg">
                  <Crown className="w-3.5 h-3.5" /> FEATURED
                </span>
              )}
              {!business.isSponsored && business.isFeatured && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[var(--color-ocean)] text-white shadow-lg">
                  <Sparkles className="w-3.5 h-3.5" /> FEATURED
                </span>
              )}
            </div>
          </>
        )}
        {/* CLAIMED badge — always shown regardless of cover photo */}
        {business.isClaimed && (
          <div className="absolute right-4" style={{ top: coverImage ? "80px" : "16px" }}>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-600 text-white shadow-lg">
              <BadgeCheck className="w-3.5 h-3.5" /> CLAIMED
            </span>
          </div>
        )}

        {/* Back button */}
        <div className="absolute top-20 left-4 flex gap-2" style={{ top: coverImage ? undefined : "84px" }}>
          {!coverImage && (
            <Link href="/directory" className="inline-flex items-center gap-1.5 text-[var(--color-ocean)] hover:text-[var(--color-ocean-deep)] text-sm font-medium transition-colors bg-white/80 px-3 py-1.5 rounded-full shadow">
              <ArrowLeft className="w-4 h-4" /> Back to Directory
            </Link>
          )}
        </div>
        {coverImage && (
          <div className="absolute bottom-4 left-4">
            <Link href="/directory" className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Directory
            </Link>
          </div>
        )}
        {coverImage && (business as any).isChamberMember && (
          <div className="absolute bottom-4 right-4 group/chamber">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663047046836/LgGdfsvMFzrUmENex4CRQA/chamber_badge-cnLf2FfXDVDZgysSz9HxLV.webp"
              alt="Chamber Member"
              className="w-14 h-14 rounded-full shadow-xl border-2 border-white/70"
            />
            <span className="pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-md bg-gray-900/90 px-2.5 py-1 text-xs font-medium text-white opacity-0 group-hover/chamber:opacity-100 transition-opacity duration-150 shadow">
              Chamber Member
            </span>
          </div>
        )}
      </div>

      {/* ── Update Photos CTA ─────────────────────────────────────────────────── */}
      {(() => {
        const cover = (business as any)?.coverPhoto as string | null;
        const hasAiCover = isAiGeneratedCover(cover) || (!cover && photos.length === 0);
        const isOwner = user && (business as any).claimedByUserId === user?.id;
        const isAdmin = user?.role === "admin";
        if (!business?.isClaimed || !hasAiCover) return null;
        return (
          <div className="bg-amber-50 border-b border-amber-200">
            <div className="container max-w-5xl py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Camera className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="text-sm text-amber-800 font-medium">
                  {isOwner || isAdmin
                    ? "This listing is using an AI-generated cover photo. Upload your own real photography to make it stand out."
                    : "This business hasn't uploaded a cover photo yet — the image above is AI-generated."}
                </p>
              </div>
              {(isOwner || isAdmin) && (
                <a
                  href="/dashboard"
                  className="shrink-0 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
                >
                  Upload Real Photo
                </a>
              )}
            </div>
          </div>
        );
      })()}

      {/* ── Business Name + Meta ──────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[var(--color-border)] shadow-sm">
        <div className="container max-w-5xl py-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              {/* Tier + category breadcrumb */}
              <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-[var(--color-muted-foreground)]">
                {isIslandPremier && (
                  <span className="badge-sponsored flex items-center gap-1 text-xs">
                    <Crown className="w-2.5 h-2.5" /> Island Premier
                  </span>
                )}
                {isGulfBreeze && !isIslandPremier && (
                  <span className="badge-featured flex items-center gap-1 text-xs">
                    <Sparkles className="w-2.5 h-2.5" /> Gulf Breeze
                  </span>
                )}
                {tags.map((tag) => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-ocean-pale)] text-[var(--color-ocean)] font-medium">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-[var(--color-charcoal)]">
                  {business.name}
                </h1>
                {business.isClaimed && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200 shrink-0">
                    <BadgeCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
              </div>

              {business.rating && business.reviewCount != null && business.reviewCount > 0 && (
                <StarRating rating={business.rating} count={business.reviewCount} />
              )}

              {/* Last Updated timestamp */}
              {business.updatedAt && (
                <p className="mt-1.5 text-xs text-[var(--color-muted-foreground)]">
                  Last updated{" "}
                  {new Date(business.updatedAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>

            {/* Quick actions */}
            <div className="flex gap-2 shrink-0 flex-wrap">
              {business.website && (
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-ocean-pale)] text-sm font-medium transition-colors text-[var(--color-ocean)]"
                >
                  <Globe className="w-4 h-4" /> Website
                </a>
              )}
              <button
                onClick={async () => {
                  const url = window.location.href;
                  if (navigator.share) {
                    try {
                      await navigator.share({ title: business.name, url });
                    } catch {
                      // user cancelled — no toast needed
                    }
                  } else {
                    try {
                      await navigator.clipboard.writeText(url);
                      toast.success("Link copied to clipboard!");
                    } catch {
                      toast.error("Could not copy link. Please copy the URL manually.");
                    }
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-ocean-pale)] text-sm font-medium transition-colors text-[var(--color-ocean)]"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <main className="flex-1 py-8">
        <div className="container max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── Left Column ─────────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">

              {/* About — all tiers */}
              {(business.description || business.shortDescription) && (
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="font-serif text-xl font-semibold mb-4 text-[var(--color-charcoal)]">About</h2>
                  <div className="text-[var(--color-muted-foreground)] leading-relaxed space-y-4">
                    {(business.description ?? business.shortDescription ?? "")
                      .split(/\n\n+/)
                      .map((para, i) => (
                        <p key={i}>
                          {para.split(/\n/).map((line, j, arr) => (
                            <span key={j}>
                              {line}
                              {j < arr.length - 1 && <br />}
                            </span>
                          ))}
                        </p>
                      ))}
                  </div>
                </div>
              )}

              {/* Hours — all tiers (including free) */}
              {Object.keys(hours).length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="font-serif text-xl font-semibold mb-4 text-[var(--color-charcoal)] flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[var(--color-ocean)]" /> Hours of Operation
                  </h2>
                  <div className="space-y-1">
                    {DAY_ORDER.map((day) => {
                      const h = hours[day];
                      if (!h) return null;
                      const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
                      const isToday = day === today;
                      return (
                        <div
                          key={day}
                          className={`flex justify-between items-center py-2 px-3 rounded-lg text-sm ${
                            isToday ? "bg-[var(--color-ocean-pale)] font-semibold" : ""
                          }`}
                        >
                          <span className={isToday ? "text-[var(--color-ocean)]" : "text-[var(--color-foreground)]"}>
                            {day}
                            {isToday && <span className="ml-2 text-[10px] uppercase tracking-wider text-[var(--color-ocean)]">Today</span>}
                          </span>
                          <span className={h === "Closed" ? "text-red-500" : isToday ? "text-[var(--color-ocean)]" : "text-[var(--color-muted-foreground)]"}>
                            {h}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Photo Gallery — Gulf Breeze (max 5) and Island Premier (max 10) */}
              {isPaid && (
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="font-serif text-xl font-semibold mb-4 text-[var(--color-charcoal)]">Photos</h2>
                  {photos.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {photos.slice(0, isGulfBreeze ? 5 : 10).map((url: string, i: number) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block aspect-square overflow-hidden rounded-xl group"
                        >
                          <img
                            src={url}
                            alt={`${business.name} photo ${i + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center rounded-xl bg-[var(--color-ocean-pale)]">
                      <div className="text-3xl mb-2">📸</div>
                      <p className="text-sm text-[var(--color-muted-foreground)]">No photos yet.</p>
                      {!business.isClaimed && (
                        <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
                          <a href="/claim" className="text-[var(--color-ocean)] hover:underline">Claim this listing</a> to add photos.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Map — all tiers (Google Maps link shown for free; embedded map for paid) */}
              {business.lat && business.lng && (
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-[var(--color-border)]">
                    <h2 className="font-serif text-xl font-semibold text-[var(--color-charcoal)]">Location</h2>
                    {business.address && (
                      <p className="text-sm text-[var(--color-muted-foreground)] mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> {business.address}
                      </p>
                    )}
                  </div>
                  <MapView
                    onMapReady={handleMapReady}
                    initialCenter={{ lat: parseFloat(business.lat), lng: parseFloat(business.lng) }}
                    initialZoom={16}
                    className="w-full h-64"
                  />
                </div>
              )}

              {/* Google Reviews — Gulf Breeze + Island Premier */}
              {isPaid && business.googleReviewEmbedCode && (
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="font-serif text-xl font-semibold mb-4 text-[var(--color-charcoal)] flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google Reviews
                  </h2>
                  <div
                    className="google-review-widget"
                    dangerouslySetInnerHTML={{ __html: business.googleReviewEmbedCode }}
                  />
                </div>
              )}

              {/* Events & Announcements — Island Premier only */}
              {isIslandPremier && events && events.length > 0 && (() => {
                const now = new Date();
                const announcements = events.filter((e) => e.type === "announcement");
                const upcoming = events.filter(
                  (e) => e.type === "event" && (!e.startDate || new Date(e.startDate) >= now)
                );
                const past = events.filter(
                  (e) => e.type === "event" && e.startDate && new Date(e.startDate) < now
                );

                return (
                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-[var(--color-border)] flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-ocean" />
                      <h2 className="font-serif text-xl font-semibold text-[var(--color-charcoal)]">Events &amp; Announcements</h2>
                    </div>
                    <div className="divide-y divide-[var(--color-border)]">
                      {/* Announcements */}
                      {announcements.map((ev) => (
                        <div key={ev.id} className="p-5 flex gap-4">
                          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                            <Megaphone className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">Announcement</span>
                            </div>
                            <h3 className="font-semibold text-[var(--color-charcoal)] leading-snug">{ev.title}</h3>
                            {ev.description && (
                              <p className="text-sm text-[var(--color-muted-foreground)] mt-1 leading-relaxed">{ev.description}</p>
                            )}
                          </div>
                          {ev.imageUrl && (
                            <img src={ev.imageUrl} alt={ev.title} className="flex-shrink-0 w-20 h-20 rounded-xl object-cover" />
                          )}
                        </div>
                      ))}

                      {/* Upcoming events */}
                      {upcoming.map((ev) => (
                        <div key={ev.id} className="p-5 flex gap-4">
                          <div className="flex-shrink-0 text-center min-w-[3rem]">
                            {ev.startDate ? (
                              <div className="rounded-xl border-2 border-ocean overflow-hidden">
                                <div className="bg-ocean text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                                  {new Date(ev.startDate).toLocaleString("en-US", { month: "short" })}
                                </div>
                                <div className="bg-white text-ocean font-bold text-xl leading-none px-2 py-1">
                                  {new Date(ev.startDate).getDate()}
                                </div>
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-ocean/10 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-ocean" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-[var(--color-charcoal)] leading-snug">{ev.title}</h3>
                            {ev.startDate && (
                              <p className="text-xs text-ocean font-medium mt-0.5">
                                {new Date(ev.startDate).toLocaleString("en-US", {
                                  weekday: "short", month: "long", day: "numeric",
                                  hour: "numeric", minute: "2-digit",
                                })}
                                {ev.endDate && (
                                  <> &ndash; {new Date(ev.endDate).toLocaleString("en-US", { hour: "numeric", minute: "2-digit" })}</>
                                )}
                              </p>
                            )}
                            {ev.location && (
                              <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5 flex items-center gap-1">
                                <LocationPin className="w-3 h-3" /> {ev.location}
                              </p>
                            )}
                            {ev.description && (
                              <p className="text-sm text-[var(--color-muted-foreground)] mt-1 leading-relaxed">{ev.description}</p>
                            )}
                          </div>
                          {ev.imageUrl && (
                            <img src={ev.imageUrl} alt={ev.title} className="flex-shrink-0 w-20 h-20 rounded-xl object-cover" />
                          )}
                        </div>
                      ))}

                      {/* Past events — collapsed */}
                      {past.length > 0 && (
                        <details className="group">
                          <summary className="p-4 text-sm text-[var(--color-muted-foreground)] cursor-pointer hover:text-[var(--color-charcoal)] flex items-center gap-2 list-none">
                            <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                            {past.length} past event{past.length !== 1 ? "s" : ""}
                          </summary>
                          <div className="divide-y divide-[var(--color-border)]">
                            {past.map((ev) => (
                              <div key={ev.id} className="p-5 flex gap-4 opacity-60">
                                <div className="flex-shrink-0 text-center min-w-[3rem]">
                                  {ev.startDate ? (
                                    <div className="rounded-xl border-2 border-muted overflow-hidden">
                                      <div className="bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                                        {new Date(ev.startDate).toLocaleString("en-US", { month: "short" })}
                                      </div>
                                      <div className="bg-white text-muted-foreground font-bold text-xl leading-none px-2 py-1">
                                        {new Date(ev.startDate).getDate()}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                                      <Calendar className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-[var(--color-charcoal)] leading-snug">{ev.title}</h3>
                                  {ev.startDate && (
                                    <p className="text-xs text-muted-foreground font-medium mt-0.5">
                                      {new Date(ev.startDate).toLocaleString("en-US", { weekday: "short", month: "long", day: "numeric" })}
                                    </p>
                                  )}
                                  {ev.description && (
                                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{ev.description}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Video Embed — Island Premier only */}
              {isIslandPremier && business.videoEmbed && (() => {
                // Convert YouTube/Vimeo watch URLs to embed URLs
                let embedUrl = business.videoEmbed as string;
                const ytMatch = embedUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
                if (ytMatch) embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
                const vimeoMatch = embedUrl.match(/vimeo\.com\/(\d+)/);
                if (vimeoMatch) embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
                return (
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-[var(--color-border)]">
                      <h2 className="font-serif text-xl font-semibold text-[var(--color-charcoal)]">Video</h2>
                    </div>
                    <div className="aspect-video">
                      <iframe
                        src={embedUrl}
                        title={`${business.name} video`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Upgrade CTA for free listings in left column */}
              {isFree && (
                <div className="premium-banner">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-[var(--color-gold)]" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-white/70">Upgrade</span>
                    </div>
                    <h3 className="font-serif font-bold text-lg mb-2">Unlock Your Full Profile</h3>
                    <p className="text-sm text-white/75 mb-4">
                      Get a photo gallery, top search placement, featured badge, Google Reviews display, and homepage spotlight with a Gulf Breeze or Island Premier listing.
                    </p>
                    <Link href="/pricing" className="btn-coral w-full justify-center text-sm">
                      <Crown className="w-4 h-4" /> View Plans
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right Sidebar ────────────────────────────────────────────── */}
            <div className="space-y-6">

              {/* Contact card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-serif text-lg font-semibold mb-4 text-[var(--color-charcoal)]">Get More Information</h2>

                {/* Tier badge */}
                <div className="mb-4">
                  {isIslandPremier ? (
                    <span className="badge-sponsored flex items-center gap-1 text-xs w-fit">
                      <Crown className="w-2.5 h-2.5" /> Island Premier
                    </span>
                  ) : isGulfBreeze ? (
                    <span className="badge-featured flex items-center gap-1 text-xs w-fit">
                      <Sparkles className="w-2.5 h-2.5" /> Gulf Breeze
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium w-fit inline-block">
                      Free Listing
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {business.phone && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[var(--color-ocean-pale)] flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4 text-[var(--color-ocean)]" />
                      </div>
                      <div>
                        <div className="text-xs text-[var(--color-muted-foreground)] mb-0.5">Phone</div>
                        <a href={`tel:${business.phone}`} className="text-sm font-medium text-[var(--color-ocean)] hover:underline">
                          {business.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {business.address && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[var(--color-ocean-pale)] flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-[var(--color-ocean)]" />
                      </div>
                      <div>
                        <div className="text-xs text-[var(--color-muted-foreground)] mb-0.5">Address</div>
                        <div className="text-sm font-medium">{business.address}</div>
                      </div>
                    </div>
                  )}

                  {/* Email — all tiers (hide if placeholder "N/A" or not a real email) */}
                  {business.email && business.email !== "N/A" && business.email.includes("@") && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[var(--color-ocean-pale)] flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4 text-[var(--color-ocean)]" />
                      </div>
                      <div>
                        <div className="text-xs text-[var(--color-muted-foreground)] mb-0.5">Email</div>
                        <a href={`mailto:${business.email}`} className="text-sm font-medium text-[var(--color-ocean)] hover:underline break-all">
                          {business.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Website — all tiers */}
                  {business.website && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[var(--color-ocean-pale)] flex items-center justify-center shrink-0">
                        <Globe className="w-4 h-4 text-[var(--color-ocean)]" />
                      </div>
                      <div>
                        <div className="text-xs text-[var(--color-muted-foreground)] mb-0.5">Website</div>
                        <a
                          href={business.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-[var(--color-ocean)] hover:underline flex items-center gap-1"
                        >
                          Visit Website <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Social links — all tiers */}
                {Object.keys(socialLinks).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                    <div className="text-xs text-[var(--color-muted-foreground)] mb-2">Follow Us</div>
                    <div className="flex gap-2 flex-wrap">
                      {Object.entries(socialLinks).map(([platform, url]) => {
                        // Skip empty, placeholder, or non-URL values (e.g. hours text accidentally stored here)
                        if (!url || !url.startsWith("http") && !url.startsWith("@") && !url.startsWith("facebook") && !url.startsWith("instagram") && !url.startsWith("twitter") && !url.startsWith("linkedin") && !url.startsWith("youtube") && !url.startsWith("tiktok")) return null;
                        const Icon = SOCIAL_ICONS[platform.toLowerCase()] ?? Globe;
                        return (
                          <a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 rounded-lg bg-[var(--color-ocean-pale)] flex items-center justify-center text-[var(--color-ocean)] hover:bg-[var(--color-ocean)] hover:text-white transition-colors"
                            title={platform}
                          >
                            <Icon className="w-4 h-4" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Directions button */}
                {business.address && (
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(business.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ocean w-full justify-center mt-4 text-sm"
                  >
                    <MapPin className="w-4 h-4" /> Get Directions
                  </a>
                )}
              </div>

              {/* Claim CTA */}
              {!business.isClaimed && (
                <div className="bg-[var(--color-ocean-pale)] border border-[var(--color-ocean-light)] rounded-2xl p-5">
                  <h3 className="font-serif font-semibold text-[var(--color-ocean-deep)] mb-2">
                    Is this your business?
                  </h3>
                  <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
                    Claim this listing to update your information, add photos, and unlock premium features.
                  </p>
                  <Link href={`/claim?business=${encodeURIComponent(business.name)}&id=${business.id}`} className="btn-ocean w-full justify-center text-sm">
                    Claim This Listing
                  </Link>
                </div>
              )}

              {/* Upgrade CTA for claimed free listings */}
              {business.isClaimed && isFree && (
                <div className="premium-banner">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-4 h-4 text-[var(--color-gold)]" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-white/70">Upgrade</span>
                    </div>
                    <h3 className="font-serif font-bold text-lg mb-2">Get Featured</h3>
                    <p className="text-sm text-white/75 mb-4">
                      Appear at the top of search results. Add a photo gallery, featured badge, Google Reviews display, and homepage spotlight.
                    </p>
                    <Link href="/pricing" className="btn-coral w-full justify-center text-sm">
                      <Sparkles className="w-4 h-4" /> View Plans
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Businesses */}
          {related && related.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl font-bold text-[var(--color-charcoal)]">
                  More in This Category
                </h2>
                <Link href="/directory" className="text-sm font-semibold text-[var(--color-ocean)] flex items-center gap-1 hover:text-[var(--color-ocean-deep)]">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {related.map((biz) => (
                  <BusinessCard key={biz.id} business={biz} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
