import { useEffect, useRef } from "react";
import { useParams, Link } from "wouter";
import {
  MapPin, Phone, Globe, Clock, Star, ArrowLeft, Crown, Sparkles,
  Share2, ExternalLink, ChevronRight
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BusinessCard from "@/components/BusinessCard";
import { MapView } from "@/components/Map";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";

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

export default function BusinessProfile() {
  const { slug } = useParams<{ slug: string }>();
  const mapRef = useRef<google.maps.Map | null>(null);

  const { data: business, isLoading } = trpc.businesses.bySlug.useQuery({ slug: slug ?? "" });
  const { data: related } = trpc.businesses.related.useQuery(
    { categoryId: business?.categoryId ?? 0, excludeId: business?.id ?? 0 },
    { enabled: !!business }
  );

  // Place marker when map and business are ready
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
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: business.isSponsored ? "#D4A017" : "#2B6CB0",
        fillOpacity: 1,
        strokeColor: "#fff",
        strokeWeight: 3,
      },
    });
  };

  const hours = business?.hours as Record<string, string> | null;
  const tags = Array.isArray(business?.tags) ? (business.tags as string[]) : [];
  const photos = Array.isArray(business?.photos) ? (business.photos as string[]) : [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 pt-24 pb-16">
          <div className="container max-w-4xl">
            <div className="skeleton h-8 w-1/2 mb-4" />
            <div className="skeleton h-5 w-3/4 mb-8" />
            <div className="skeleton h-64 w-full rounded-2xl" />
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
  const seoImage = photos.length > 0 ? photos[0] : undefined;

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={`${business.name} — Siesta Key`}
        description={seoDesc}
        canonical={`/business/${business.slug}`}
        image={seoImage}
        type="article"
      />
      <Navbar />

      {/* ── Header Band ─────────────────────────────────────────────────────── */}
      <section
        className="relative pt-24 pb-10 flex items-end overflow-hidden"
        style={{
          backgroundImage: `url(/manus-storage/SiestaKey-hero_60f0f3c1.webp)`,
          backgroundSize: "cover",
          backgroundPosition: "center 40%",
          minHeight: "240px",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/65" />
        <div className="relative z-10 container max-w-5xl">
          <Link href="/directory" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </Link>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                {business.isSponsored && (
                  <span className="badge-sponsored flex items-center gap-1">
                    <Crown className="w-2.5 h-2.5" /> Sponsored
                  </span>
                )}
                {!business.isSponsored && business.isFeatured && (
                  <span className="badge-featured flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Featured
                  </span>
                )}
              </div>

              <h1 className="font-serif text-3xl md:text-4xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] mb-3">{business.name}</h1>

              {business.rating && business.reviewCount != null && business.reviewCount > 0 && (
                <div className="mb-3">
                  <StarRating rating={business.rating} count={business.reviewCount} />
                </div>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-white/15 text-white/90 font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="flex gap-2 shrink-0">
              {business.website && (
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/15 hover:bg-white/25 text-sm font-medium transition-colors text-white"
                >
                  <Globe className="w-4 h-4" /> Website
                </a>
              )}
              <button
                onClick={() => navigator.share?.({ title: business.name, url: window.location.href })}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/15 hover:bg-white/25 text-sm font-medium transition-colors text-white"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <main className="flex-1 py-10 bg-[var(--color-white-sand)]">
        <div className="container max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Description + Map */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-serif text-xl font-semibold mb-4 text-[var(--color-charcoal)]">About</h2>
                <p className="text-[var(--color-muted-foreground)] leading-relaxed">
                  {business.description ?? business.shortDescription ?? "No description available."}
                </p>
              </div>

              {/* Photos Gallery */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-serif text-xl font-semibold mb-4 text-[var(--color-charcoal)]">Photos</h2>
                {photos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {photos.map((url: string, i: number) => (
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

              {/* Map */}
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

              {/* Hours */}
              {hours && Object.keys(hours).length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="font-serif text-xl font-semibold mb-4 text-[var(--color-charcoal)] flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[var(--color-ocean)]" /> Hours of Operation
                  </h2>
                  <div className="space-y-2">
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
            </div>

            {/* Right: Contact + Premium CTA */}
            <div className="space-y-6">
              {/* Contact card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-serif text-lg font-semibold mb-4 text-[var(--color-charcoal)]">Contact</h2>
                <div className="space-y-3">
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

              {/* Claim / Premium CTA */}
              {!business.isClaimed ? (
                <div className="bg-[var(--color-ocean-pale)] border border-[var(--color-ocean-light)] rounded-2xl p-5">
                  <h3 className="font-serif font-semibold text-[var(--color-ocean-deep)] mb-2">
                    Is this your business?
                  </h3>
                  <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
                    Claim this listing to update your information, respond to customers, and unlock premium features.
                  </p>
                  <Link href={`/claim?business=${encodeURIComponent(business.name)}&id=${business.id}`} className="btn-ocean w-full justify-center text-sm">
                    Claim This Listing
                  </Link>
                </div>
              ) : (
                <div className="premium-banner">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-4 h-4 text-[var(--color-gold)]" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-white/70">Upgrade</span>
                    </div>
                    <h3 className="font-serif font-bold text-lg mb-2">Get Featured</h3>
                    <p className="text-sm text-white/75 mb-4">
                      Appear at the top of search results and category pages. Drive more customers to your business.
                    </p>
                    <a
                      href={import.meta.env.VITE_GHL_PAYMENT_LINK ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-coral w-full justify-center text-sm"
                    >
                      <Sparkles className="w-4 h-4" /> Upgrade to Featured
                    </a>
                  </div>
                </div>
              )}

              {/* Google Reviews Widget — Gulf Breeze (featured) & Island Premier (sponsored) only */}
              {(business.tier === "featured" || business.tier === "sponsored") && business.googleReviewEmbedCode && (
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="font-serif text-lg font-semibold mb-4 text-[var(--color-charcoal)] flex items-center gap-2">
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

              {/* Premium upgrade for free listings */}
              {business.tier === "free" && (
                <div className="premium-banner">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-[var(--color-gold)]" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-white/70">Premium</span>
                    </div>
                    <h3 className="font-serif font-bold text-lg mb-2">Get Featured Today</h3>
                    <p className="text-sm text-white/75 mb-4">
                      Stand out with a featured listing. Priority placement, enhanced profile, and more visibility.
                    </p>
                    <a
                      href={import.meta.env.VITE_GHL_PAYMENT_LINK ?? "/claim"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-coral w-full justify-center text-sm"
                    >
                      <Crown className="w-4 h-4" /> Upgrade Now
                    </a>
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
