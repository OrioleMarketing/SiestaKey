import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Search, BookOpen } from "lucide-react";

const PANORAMA_DEFAULT = "https://siestakey.s3.us-east-2.amazonaws.com/manus-storage/SiestaKey_panorama_734eb779.webp";

const CATEGORIES = ["All", "Guide", "Dining", "Activities", "Shopping", "Beach Tips", "Events"];

function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function formatDate(d: Date | string | null): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function BlogIndex() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: posts, isLoading } = trpc.blog.list.useQuery({
    publishedOnly: true,
    limit: 50,
  });

  const filtered = (posts ?? []).filter((p) => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.excerpt ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.tags as string[]).some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <>
      <Navbar />
      <SEO
        title="Siesta Key Travel Guides & Local Tips | Shop in Siesta Key"
        description="Explore our guides to the best restaurants, beaches, activities, and shopping on Siesta Key, Florida. Local tips from people who know the island."
        canonical="/guides"
        image={PANORAMA_DEFAULT}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0d3b5e] to-[#1a6b8a] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4 text-teal-300 text-sm font-medium uppercase tracking-widest">
            <BookOpen className="w-4 h-4" />
            <span>Local Guides & Tips</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover Siesta Key
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8">
            Insider guides, local recommendations, and everything you need to make the most of your time on Florida's most beautiful island.
          </p>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search guides..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white text-gray-900 border-0 h-11"
            />
          </div>
        </div>
      </section>

      {/* Category pills */}
      <section className="border-b bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? "bg-[#0d3b5e] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-10">
        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden border">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No guides found</p>
            <p className="text-sm mt-1">Try a different search or category</p>
          </div>
        ) : (
          <>
            {/* Featured post */}
            {featured && (
              <Link href={`/guides/${featured.slug}`} className="block mb-10 group">
                <div className="rounded-2xl overflow-hidden border shadow-sm hover:shadow-md transition-shadow bg-white">
                  <div className="md:flex">
                    <div className="md:w-1/2 h-64 md:h-auto overflow-hidden">
                      <img
                        src={featured.coverImage ?? PANORAMA_DEFAULT}
                        alt={featured.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="md:w-1/2 p-8 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="text-xs">{featured.category ?? "Guide"}</Badge>
                        <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">Featured</span>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 group-hover:text-[#0d3b5e] transition-colors mb-3 leading-snug">
                        {featured.title}
                      </h2>
                      {featured.excerpt && (
                        <p className="text-gray-600 mb-4 line-clamp-3">{featured.excerpt}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(featured.publishedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {readingTime(featured.content)} min read
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Grid */}
            {rest.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((post) => (
                  <Link key={post.id} href={`/guides/${post.slug}`} className="block group">
                    <div className="rounded-xl overflow-hidden border shadow-sm hover:shadow-md transition-shadow bg-white h-full flex flex-col">
                      <div className="h-48 overflow-hidden">
                        <img
                          src={post.coverImage ?? PANORAMA_DEFAULT}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <Badge variant="secondary" className="text-xs w-fit mb-2">{post.category ?? "Guide"}</Badge>
                        <h3 className="font-bold text-gray-900 group-hover:text-[#0d3b5e] transition-colors mb-2 leading-snug line-clamp-2">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">{post.excerpt}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-auto pt-3 border-t">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(post.publishedAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {readingTime(post.content)} min read
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
