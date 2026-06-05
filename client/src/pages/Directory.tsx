import { useState, useEffect, useMemo } from "react";
import { useLocation, useParams } from "wouter";
import {
  Search, SlidersHorizontal, MapPin, Grid3X3, Map as MapIcon,
  UtensilsCrossed, ShoppingBag, Waves, Wrench, Music, Heart, Bed, Home as HomeIcon, Star, X
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BusinessCard from "@/components/BusinessCard";
import { MapView } from "@/components/Map";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  dining: <UtensilsCrossed className="w-4 h-4" />,
  shopping: <ShoppingBag className="w-4 h-4" />,
  activities: <Waves className="w-4 h-4" />,
  services: <Wrench className="w-4 h-4" />,
  nightlife: <Music className="w-4 h-4" />,
  wellness: <Heart className="w-4 h-4" />,
  accommodations: <Bed className="w-4 h-4" />,
  "real-estate": <HomeIcon className="w-4 h-4" />,
};

const AREAS = ["All Areas", "Siesta Key Village", "South Village", "Siesta Key Beach", "Near Siesta Key"];

export default function Directory() {
  const params = useParams<{ category?: string }>();
  const [location] = useLocation();

  // Parse query string for keyword
  const searchParams = useMemo(() => {
    const search = typeof window !== "undefined" ? window.location.search : "";
    return new URLSearchParams(search);
  }, [location]);

  const [keyword, setKeyword] = useState(searchParams.get("q") ?? "");
  const [inputValue, setInputValue] = useState(searchParams.get("q") ?? "");
  const [selectedCategory, setSelectedCategory] = useState(params.category ?? "all");
  const [selectedArea, setSelectedArea] = useState("All Areas");
  const [selectedTier, setSelectedTier] = useState<"" | "featured_sponsored" | "featured" | "sponsored">(
    (searchParams.get("tier") as "featured_sponsored" | "featured" | "sponsored") ?? ""
  );
  const [chamberOnly, setChamberOnly] = useState(searchParams.get("chamber") === "1");
  const [sortBy, setSortBy] = useState<"default" | "name" | "category" | "tags">("default");
  const [page, setPage] = useState(1);
  const [showMap, setShowMap] = useState(false);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

  const { data: categories } = trpc.categories.list.useQuery();
  const { data, isLoading } = trpc.businesses.list.useQuery({
    categorySlug: selectedCategory === "all" ? undefined : selectedCategory,
    keyword: keyword || undefined,
    area: selectedArea === "All Areas" ? undefined : selectedArea,
    tier: selectedTier || undefined,
    chamberMember: chamberOnly || undefined,
    sortBy: sortBy === "default" ? undefined : sortBy,
    page,
    limit: 12,
  });

  const businesses = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 12);

  // Category name map
  const catMap = useMemo(() => {
    const m: Record<number, string> = {};
    (categories ?? []).forEach((c) => (m[c.id] = c.name));
    return m;
  }, [categories]);

  // Update category when URL param changes
  useEffect(() => {
    setSelectedCategory(params.category ?? "all");
    setPage(1);
  }, [params.category]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(inputValue);
    setPage(1);
  };

  const clearSearch = () => {
    setInputValue("");
    setKeyword("");
    setPage(1);
  };

  // Place markers on map when businesses load
  useEffect(() => {
    if (!mapInstance || !showMap || businesses.length === 0) return;
    const bounds = new google.maps.LatLngBounds();
    businesses.forEach((biz) => {
      if (!biz.lat || !biz.lng) return;
      const lat = parseFloat(biz.lat);
      const lng = parseFloat(biz.lng);
      if (isNaN(lat) || isNaN(lng)) return;
      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: mapInstance,
        title: biz.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: biz.isSponsored ? 10 : biz.isFeatured ? 8 : 6,
          fillColor: biz.isSponsored ? "#D4A017" : biz.isFeatured ? "#2B6CB0" : "#4A90D9",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2,
        },
      });
      const infoWindow = new google.maps.InfoWindow({
        content: `<div style="font-family:Inter,sans-serif;max-width:200px"><strong style="font-size:13px">${biz.name}</strong><br/><span style="font-size:11px;color:#666">${biz.area ?? ""}</span><br/><a href="/business/${biz.slug}" style="font-size:11px;color:#2B6CB0">View Profile →</a></div>`,
      });
      marker.addListener("click", () => infoWindow.open(mapInstance, marker));
      bounds.extend({ lat, lng });
    });
    if (!bounds.isEmpty()) mapInstance.fitBounds(bounds);
  }, [mapInstance, businesses, showMap]);

  const currentCatName = categories?.find((c) => c.slug === selectedCategory)?.name;

  const seoTitle = currentCatName
    ? `${currentCatName} on Siesta Key — Restaurants, Shops & More`
    : "Siesta Key Business Directory — All Categories";
  const seoDesc = currentCatName
    ? `Browse the best ${currentCatName.toLowerCase()} on Siesta Key, Florida. Find top-rated local businesses, hours, locations, and more.`
    : "Browse 200+ local businesses on Siesta Key, Florida. Find dining, shopping, activities, nightlife, accommodations, and more.";
  const seoCanonical = selectedCategory && selectedCategory !== "all"
    ? `/directory/${selectedCategory}`
    : "/directory";

  const directorySchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `https://shopinsiestakey.com${seoCanonical}#collection`,
    "name": seoTitle,
    "description": seoDesc,
    "url": `https://shopinsiestakey.com${seoCanonical}`,
    "isPartOf": { "@id": "https://shopinsiestakey.com/#website" },
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": total,
      "itemListElement": businesses.slice(0, 20).map((b, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "url": `https://shopinsiestakey.com/business/${b.slug}`,
        "name": b.name,
      }))
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title={seoTitle} description={seoDesc} canonical={seoCanonical} jsonLd={directorySchema} />
      <Navbar />

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <PageHero
        title={currentCatName ? `${currentCatName} on Siesta Key` : "Siesta Key Business Directory"}
        subtitle={total > 0 ? `${total} business${total !== 1 ? "es" : ""} found` : "Discover local businesses, dining, activities, and more"}
        breadcrumb={currentCatName ? `Directory / ${currentCatName}` : "Directory"}
      />

      {/* ── Search & Filters ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[var(--color-border)] sticky top-16 z-30 shadow-sm">
        <div className="container py-4">
          {/* Search row */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <div className="flex-1 flex items-center gap-2 bg-[var(--color-white-sand)] border border-[var(--color-border)] rounded-xl px-4 py-2.5">
              <Search className="w-4 h-4 text-[var(--color-muted-foreground)] shrink-0" />
              <input
                type="text"
                placeholder="Search businesses, cuisine, activity…"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm text-[var(--color-charcoal)] placeholder:text-[var(--color-muted-foreground)]"
              />
              {inputValue && (
                <button type="button" onClick={clearSearch} className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button type="submit" className="btn-ocean px-5 py-2.5 text-sm rounded-xl">
              Search
            </button>
            {/* Sort dropdown */}
            <div className="relative shrink-0">
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value as typeof sortBy); setPage(1); }}
                className="appearance-none h-full pl-3 pr-8 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-foreground)] bg-white hover:border-[var(--color-ocean-light)] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-ocean)]/30"
              >
                <option value="default">Sort: Featured</option>
                <option value="name">Sort: Name A–Z</option>
                <option value="category">Sort: Category</option>
                <option value="tags">Sort: Tags</option>
              </select>
              <SlidersHorizontal className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-muted-foreground)]" />
            </div>
            <button
              type="button"
              onClick={() => setShowMap(!showMap)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                showMap
                  ? "bg-[var(--color-ocean)] text-white border-[var(--color-ocean)]"
                  : "bg-white text-[var(--color-foreground)] border-[var(--color-border)] hover:border-[var(--color-ocean-light)]"
              }`}
            >
              <MapIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Map</span>
            </button>
          </form>

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => { setSelectedCategory("all"); setPage(1); }}
              className={`category-pill shrink-0 ${selectedCategory === "all" ? "active" : ""}`}
            >
              All
            </button>
            {(categories ?? []).map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
                className={`category-pill shrink-0 ${selectedCategory === cat.slug ? "active" : ""}`}
              >
                {CATEGORY_ICONS[cat.slug]}
                {cat.name}
              </button>
            ))}
          </div>

          {/* Area filter */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
            {AREAS.map((area) => (
              <button
                key={area}
                onClick={() => { setSelectedArea(area); setPage(1); }}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  selectedArea === area
                    ? "bg-[var(--color-seafoam)] text-white border-[var(--color-seafoam)]"
                    : "bg-white text-[var(--color-muted-foreground)] border-[var(--color-border)] hover:border-[var(--color-ocean-light)]"
                }`}
              >
                <MapPin className="w-3 h-3 inline mr-1" />
                {area}
              </button>
            ))}
          </div>

          {/* Tier + Chamber filter pills */}
          <div className="flex gap-2 mt-2 overflow-x-auto pb-1 scrollbar-none">
            {([
              { value: "", label: "All Listings" },
              { value: "featured_sponsored", label: "⭐ Featured & Sponsored" },
              { value: "featured", label: "Gulf Breeze" },
              { value: "sponsored", label: "🏆 Sponsored" },
            ] as const).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => { setSelectedTier(value); setChamberOnly(false); setPage(1); }}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  selectedTier === value && !chamberOnly
                    ? "bg-[var(--color-gold)] text-white border-[var(--color-gold)]"
                    : "bg-white text-[var(--color-muted-foreground)] border-[var(--color-border)] hover:border-[var(--color-gold)]"
                }`}
              >
                {label}
              </button>
            ))}
            {/* Chamber Members pill */}
            <button
              onClick={() => { setChamberOnly((v) => !v); setSelectedTier(""); setPage(1); }}
              className={`shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                chamberOnly
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-white text-[var(--color-muted-foreground)] border-[var(--color-border)] hover:border-teal-500"
              }`}
            >
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663047046836/LgGdfsvMFzrUmENex4CRQA/chamber_badge-cnLf2FfXDVDZgysSz9HxLV.webp"
                alt=""
                className="w-3.5 h-3.5 rounded-full object-cover"
              />
              Chamber Members
            </button>
          </div>
        </div>
      </div>

      {/* ── Map View ─────────────────────────────────────────────────────────── */}
      {showMap && (
        <div className="h-72 md:h-96 border-b border-[var(--color-border)]">
          <MapView
            onMapReady={(map) => setMapInstance(map)}
            initialCenter={{ lat: 27.2671, lng: -82.5457 }}
            initialZoom={14}
            className="w-full h-full"
          />
        </div>
      )}

      {/* ── Results Grid ─────────────────────────────────────────────────────── */}
      <main className="flex-1 py-10 bg-[var(--color-white-sand)]">
        <div className="container">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden bg-white">
                  <div className="skeleton h-2 w-full" />
                  <div className="p-5 space-y-3">
                    <div className="skeleton h-5 w-3/4" />
                    <div className="skeleton h-4 w-full" />
                    <div className="skeleton h-4 w-2/3" />
                    <div className="skeleton h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : businesses.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🌊</div>
              <h3 className="font-serif text-xl font-bold text-[var(--color-charcoal)] mb-2">No businesses found</h3>
              <p className="text-[var(--color-muted-foreground)] mb-6">Try adjusting your search or filters.</p>
              <button onClick={clearSearch} className="btn-ocean">Clear Search</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {businesses.map((biz, i) => (
                  <div key={biz.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.04}s` }}>
                    <BusinessCard business={biz} categoryName={catMap[biz.categoryId]} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm font-medium disabled:opacity-40 hover:border-[var(--color-ocean-light)] transition-colors"
                  >
                    Previous
                  </button>
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const p = i + 1;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                          page === p
                            ? "bg-[var(--color-ocean)] text-white"
                            : "border border-[var(--color-border)] hover:border-[var(--color-ocean-light)]"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm font-medium disabled:opacity-40 hover:border-[var(--color-ocean-light)] transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ── Claim CTA ────────────────────────────────────────────────────────── */}
      <section className="py-10 bg-white border-t border-[var(--color-border)]">
        <div className="container text-center">
          <p className="text-[var(--color-muted-foreground)] text-sm mb-3">
            Don't see your business? Get listed for free today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/claim" className="btn-outline-ocean text-sm px-6 py-2.5">
              Claim Existing Listing
            </a>
            <a href="/submit-listing" className="btn-ocean text-sm px-6 py-2.5">
              Submit New Listing
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
