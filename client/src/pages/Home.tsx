import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Search, MapPin, Star, ArrowRight, Waves, UtensilsCrossed, ShoppingBag, Sailboat, Music, Heart, Bed, Home as HomeIcon, Wrench, Crown, Sparkles, BookOpen, Calendar } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BusinessCard from "@/components/BusinessCard";
import SEO from "@/components/SEO";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  dining: <UtensilsCrossed className="w-6 h-6" />,
  shopping: <ShoppingBag className="w-6 h-6" />,
  activities: <Waves className="w-6 h-6" />,
  services: <Wrench className="w-6 h-6" />,
  nightlife: <Music className="w-6 h-6" />,
  wellness: <Heart className="w-6 h-6" />,
  accommodations: <Bed className="w-6 h-6" />,
  "real-estate": <HomeIcon className="w-6 h-6" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  dining: "from-orange-400 to-red-400",
  shopping: "from-pink-400 to-rose-400",
  activities: "from-cyan-400 to-blue-500",
  services: "from-slate-400 to-slate-600",
  nightlife: "from-purple-400 to-indigo-500",
  wellness: "from-green-400 to-emerald-500",
  accommodations: "from-amber-400 to-orange-400",
  "real-estate": "from-teal-400 to-cyan-500",
};

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [, navigate] = useLocation();

  const { data: categories } = trpc.categories.list.useQuery();
  const { data: featured } = trpc.businesses.featured.useQuery();
  const { data: upcomingEvents = [] } = trpc.events.upcoming.useQuery({ limit: 5 });

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (keyword.trim()) {
        navigate(`/directory?q=${encodeURIComponent(keyword.trim())}`);
      } else {
        navigate("/directory");
      }
    },
    [keyword, navigate]
  );

  const homeSchemas = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": "https://shopinsiestakey.com/#website",
      "name": "Shop in Siesta Key",
      "url": "https://shopinsiestakey.com",
      "description": "Your premier guide to dining, shopping, activities, nightlife, and accommodations on Siesta Key — Florida's #1 beach destination.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://shopinsiestakey.com/directory?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": "https://shopinsiestakey.com/#organization",
      "name": "Shop in Siesta Key",
      "url": "https://shopinsiestakey.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://shopinsiestakey.com/manus-storage/SiestaKey-hero_60f0f3c1.webp"
      },
      "sameAs": [
        "https://www.facebook.com/shopinsiestakey",
        "https://www.instagram.com/shopinsiestakey"
      ],
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Siesta Key",
        "addressRegion": "FL",
        "postalCode": "34242",
        "addressCountry": "US"
      }
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Siesta Key Business Directory — Dining, Shopping & More"
        description="Discover the best restaurants, shops, activities, nightlife, and accommodations on Siesta Key, Florida's #1 beach. Browse 200+ local businesses."
        canonical="/"
        jsonLd={homeSchemas}
      />
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[92vh] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(/manus-storage/SiestaKey-hero_60f0f3c1.webp)`,
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-hero-gradient" />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/5"
              style={{
                width: `${60 + i * 40}px`,
                height: `${60 + i * 40}px`,
                top: `${10 + i * 12}%`,
                left: `${5 + i * 15}%`,
                animation: `fadeIn ${2 + i * 0.5}s ease both`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 container text-center text-white">
          <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-sm font-medium mb-6">
              <MapPin className="w-3.5 h-3.5" />
              Siesta Key, Florida — America's #1 Beach
            </div>
          </div>

          <h1
            className="font-serif text-5xl md:text-7xl font-bold leading-tight mb-6 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <span className="text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)]">Discover the Best of</span>
            <br />
            <span
              className="italic"
              style={{
                color: "#F5A623",
                textShadow: "0 2px 20px rgba(0,0,0,0.75), 0 0 40px rgba(245,166,35,0.4), 0 1px 0 rgba(0,0,0,0.5)",
              }}
            >
              Siesta Key
            </span>
          </h1>

          <p
            className="text-lg md:text-xl text-white max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]"
            style={{ animationDelay: "0.3s" }}
          >
            Your premier guide to dining, shopping, activities, and services on Florida's most beautiful island.
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="flex gap-2 bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20">
              <div className="flex-1 flex items-center gap-3 bg-white rounded-xl px-4 py-3">
                <Search className="w-5 h-5 text-[var(--color-muted-foreground)] shrink-0" />
                <input
                  type="text"
                  placeholder="Search restaurants, shops, activities…"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-[var(--color-charcoal)] placeholder:text-[var(--color-muted-foreground)] text-sm"
                />
              </div>
              <button type="submit" className="btn-ocean px-6 py-3 rounded-xl text-sm shrink-0">
                Search
              </button>
            </div>
          </form>

          {/* Quick stats */}
          <div
            className="flex flex-wrap justify-center gap-6 mt-10 animate-fade-in-up"
            style={{ animationDelay: "0.5s" }}
          >
            {[
              { value: "200+", label: "Local Businesses" },
              { value: "8", label: "Categories" },
              { value: "4+", label: "Distinct Areas" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-serif font-bold">{stat.value}</div>
                <div className="text-xs text-white/60 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none" style={{ marginBottom: "-2px" }}>
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" style={{ display: "block" }}>
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="var(--color-white-sand)" />
          </svg>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────────────────── */}
      <section className="py-16 bg-[var(--color-white-sand)]">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[var(--color-charcoal)] mb-3">
              Explore by Category
            </h2>
            <p className="text-[var(--color-muted-foreground)] max-w-xl mx-auto">
              From waterfront dining to water sports, discover everything Siesta Key has to offer.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {(categories ?? []).slice().sort((a, b) => {
              const ORDER = ["dining","shopping","activities","nightlife","accommodations","wellness","services","real-estate"]; // Row 1: Dining, Shopping, Activities, Nightlife | Row 2: Accommodations, Wellness, Services, Real Estate
              return (ORDER.indexOf(a.slug) ?? 99) - (ORDER.indexOf(b.slug) ?? 99);
            }).map((cat, i) => (
              <a
                key={cat.id}
                href={`/directory/${cat.slug}`}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-white border border-[var(--color-border)] hover:border-[var(--color-ocean-light)] hover:shadow-lg transition-all duration-200 cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${CATEGORY_COLORS[cat.slug] ?? "from-blue-400 to-cyan-500"} flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform duration-200`}
                >
                  {CATEGORY_ICONS[cat.slug] ?? <Star className="w-6 h-6" />}
                </div>
                <div className="text-center">
                  <div className="font-semibold text-sm text-[var(--color-charcoal)] group-hover:text-[var(--color-ocean)] transition-colors">
                    {cat.name}
                  </div>
                  {cat.description && (
                    <div className="text-[11px] text-[var(--color-muted-foreground)] mt-0.5 line-clamp-1">
                      {cat.description}
                    </div>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Businesses (Gulf Breeze) ─────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-[var(--color-ocean)]" />
                <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-ocean)]">
                  Featured Listings
                </span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-[var(--color-charcoal)]">
                Featured Siesta Key Businesses
              </h2>
            </div>
            <a
              href="/directory?tier=featured_sponsored"
              className="hidden md:flex items-center gap-2 text-sm font-semibold text-[var(--color-ocean)] hover:text-[var(--color-ocean-deep)] transition-colors"
            >
              View All Featured &amp; Sponsored <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {!featured ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden">
                  <div className="skeleton h-2 w-full" />
                  <div className="p-5 space-y-3">
                    <div className="skeleton h-5 w-3/4" />
                    <div className="skeleton h-4 w-full" />
                    <div className="skeleton h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (() => {
            const featuredOnly = featured.filter((b: any) => !b.isSponsored).slice(0, 9);
            const sponsoredOnly = featured.filter((b: any) => b.isSponsored).slice(0, 9);
            return (
              <>
                {/* Featured (non-sponsored) grid — shown first */}
                {featuredOnly.length > 0 && (
                  <div className="mb-14">
                    {sponsoredOnly.length > 0 && (
                      <div className="flex items-center gap-2 mb-6">
                        <Star className="w-4 h-4 text-[var(--color-ocean)]" />
                        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-ocean)]">
                          Gulf Breeze Listings
                        </span>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {featuredOnly.map((biz: any, i: number) => (
                        <div key={biz.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.07}s` }}>
                          <BusinessCard business={biz} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sponsored section — shown after Featured */}
                {sponsoredOnly.length > 0 && (
                  <div className="mb-14">
                    <div className="flex items-end justify-between mb-8">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Crown className="w-5 h-5 text-[var(--color-gold)]" />
                          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-gold)]">
                            Sponsored Listings
                          </span>
                        </div>
                        <h2 className="font-serif text-2xl md:text-3xl font-bold text-[var(--color-charcoal)]">
                          Our Sponsors
                        </h2>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sponsoredOnly.map((biz: any, i: number) => (
                        <div key={biz.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.07}s` }}>
                          <BusinessCard business={biz} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })()}

          {/* View All buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <a href="/directory?tier=featured_sponsored" className="btn-outline-ocean px-8 py-3 flex items-center gap-2">
              View All Featured &amp; Sponsored <ArrowRight className="w-4 h-4" />
            </a>
            <a href="/directory" className="btn-ocean px-8 py-3 flex items-center gap-2">
              View All Listings <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── Upcoming Events ──────────────────────────────────────────────────── */}
      {upcomingEvents.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-[var(--color-ocean)]" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-ocean)]">Island Premier Events</span>
                </div>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-[var(--color-charcoal)]">
                  Upcoming Events on Siesta Key
                </h2>
              </div>
              <a href="/directory?tier=featured_sponsored" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-[var(--color-ocean)] hover:underline">
                View all listings <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {upcomingEvents.map((ev: any, i: number) => (
                <a
                  key={ev.id}
                  href={`/business/${ev.businessSlug}`}
                  className="group block rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--color-ocean-pale)] shrink-0">
                        <Calendar className="w-5 h-5 text-[var(--color-ocean)]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[var(--color-ocean)] uppercase tracking-wide truncate">{ev.businessName}</p>
                        {ev.startDate && (
                          <p className="text-xs text-gray-400">
                            {new Date(ev.startDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                            {" "}
                            {new Date(ev.startDate).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                          </p>
                        )}
                      </div>
                    </div>
                    <h3 className="font-semibold text-[var(--color-charcoal)] group-hover:text-[var(--color-ocean)] transition-colors line-clamp-2 mb-1">{ev.title}</h3>
                    {ev.location && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 shrink-0" /> {ev.location}
                      </p>
                    )}
                    {ev.description && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">{ev.description}</p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Premium Banner ────────────────────────────────────────────────────── */}
      <section className="py-16 bg-[var(--color-white-sand)]">
        <div className="container">
          <div className="premium-banner">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-[var(--color-gold)]" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-white/60">
                    Premium Listing
                  </span>
                </div>
                <h3 className="font-serif text-2xl md:text-3xl font-bold mb-2 text-white">
                  Get Your Business Featured
                </h3>
                <p className="text-white/75 max-w-lg text-sm leading-relaxed">
                  Stand out from the crowd with a premium listing. Get featured at the top of search results, a highlighted profile, and direct GoHighLevel automation to capture more leads.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <a href="/claim" className="btn-coral px-6 py-3">
                  Claim Your Business
                </a>
                <a href="/submit-listing" className="btn-outline-ocean px-6 py-3 border-white/40 text-white hover:bg-white/10">
                  Submit New Listing
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Siesta Key ────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-ocean-pale)] text-[var(--color-ocean)] text-xs font-semibold uppercase tracking-wider mb-4">
                <Waves className="w-3.5 h-3.5" /> America's #1 Beach
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-[var(--color-charcoal)] mb-4">
                The Perfect Island Destination
              </h2>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed mb-6">
                Siesta Key is home to the world's finest, whitest quartz sand beaches and a vibrant community of locally owned businesses. Whether you're a visitor looking for the best dining and activities, or a local seeking trusted services, our directory connects you to the heart of island life.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: "🏖️", label: "#1 Beach in the US", sub: "TripAdvisor 2023" },
                  { icon: "🌊", label: "Crystal Clear Waters", sub: "Gulf of America" },
                  { icon: "🍽️", label: "World-Class Dining", sub: "Fresh local seafood" },
                  { icon: "🛍️", label: "Unique Boutiques", sub: "One-of-a-kind shops" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--color-white-sand)]">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <div className="font-semibold text-sm text-[var(--color-charcoal)]">{item.label}</div>
                      <div className="text-xs text-[var(--color-muted-foreground)]">{item.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img
                src="/manus-storage/siesta-key-beach_bf6ee230.jpg"
                alt="Siesta Key Beach"
                className="rounded-2xl shadow-xl w-full object-cover aspect-[4/3]"
              />
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-ocean-gradient flex items-center justify-center">
                  <Star className="w-5 h-5 text-white fill-white" />
                </div>
                <div>
                  <div className="font-serif font-bold text-sm">Voted #1 Beach</div>
                  <div className="text-xs text-[var(--color-muted-foreground)]">by TripAdvisor</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Guides Teaser ─────────────────────────────────────────────────── */}
      <GuidesTeaser />

      {/* ── CTA Strip ─────────────────────────────────────────────────────────── */}
      <section className="py-12 bg-ocean-gradient text-white">
        <div className="container text-center">
          <h3 className="font-serif text-2xl md:text-3xl font-bold mb-3 text-white">
            Own a Business on Siesta Key?
          </h3>
          <p className="text-white/75 mb-6 max-w-xl mx-auto">
            Join hundreds of local businesses already listed in the directory. Claim your free listing or upgrade to a featured placement today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/claim" className="btn-coral px-8 py-3">
              Claim Your Business
            </a>
            <a href="/submit-listing" className="inline-flex items-center gap-2 px-8 py-3 rounded-lg border border-white/40 text-white font-semibold text-sm hover:bg-white/10 transition-colors">
              Add New Listing
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// ─── Guides Teaser ──────────────────────────────────────────────────────────
const PANORAMA_DEFAULT = "/manus-storage/SiestaKey_panorama_734eb779.webp";

function GuidesTeaser() {
  const { data: posts } = trpc.blog.list.useQuery({ publishedOnly: true, limit: 3 });

  if (!posts || posts.length === 0) return null;

  return (
    <section className="py-16 bg-[var(--color-white-sand)]">
      <div className="container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-xs font-semibold uppercase tracking-wider mb-3">
              <BookOpen className="w-3.5 h-3.5" /> Local Guides
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[var(--color-charcoal)]">
              Explore Siesta Key
            </h2>
            <p className="text-[var(--color-muted-foreground)] mt-2 max-w-lg">
              Insider tips and local guides to help you make the most of your visit.
            </p>
          </div>
          <a href="/guides" className="hidden md:flex items-center gap-1 text-sm font-semibold text-[var(--color-ocean)] hover:underline shrink-0">
            View All Guides <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <a key={post.id} href={`/guides/${post.slug}`} className="group block bg-white rounded-xl overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
              <div className="h-44 overflow-hidden">
                <img
                  src={post.coverImage ?? PANORAMA_DEFAULT}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <span className="text-xs font-semibold text-teal-600 uppercase tracking-wide">{post.category ?? "Guide"}</span>
                <h3 className="font-bold text-[var(--color-charcoal)] mt-1 mb-2 leading-snug line-clamp-2 group-hover:text-[var(--color-ocean)] transition-colors">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-sm text-[var(--color-muted-foreground)] line-clamp-2">{post.excerpt}</p>
                )}
                {post.publishedAt && (
                  <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>

        <div className="mt-6 text-center md:hidden">
          <a href="/guides" className="btn-ocean px-6 py-2.5 text-sm inline-flex items-center gap-2">
            View All Guides <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
