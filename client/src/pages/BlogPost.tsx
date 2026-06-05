import { useEffect } from "react";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const PANORAMA_DEFAULT = "/manus-storage/SiestaKey_panorama_734eb779.webp";
const BASE_URL = "https://shopinsiestakey.com";

function readingTime(content: string): number {
  return Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200));
}

function formatDate(d: Date | string | null): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, error } = trpc.blog.bySlug.useQuery(
    { slug: slug ?? "" },
    { enabled: !!slug }
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const handleShare = async () => {
    const url = `${window.location.origin}/guides/${slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: post?.title, url });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Skeleton className="h-8 w-1/3 mb-6" />
        <Skeleton className="h-64 w-full rounded-xl mb-8" />
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Article not found</h2>
        <p className="text-gray-500 mb-6">This guide may have been moved or removed.</p>
        <Link href="/guides" className="text-[#0d3b5e] font-medium hover:underline">
          ← Back to all guides
        </Link>
      </div>
    );
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.coverImage ?? PANORAMA_DEFAULT,
    author: {
      "@type": "Organization",
      name: post.author ?? "Shop in Siesta Key",
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Shop in Siesta Key",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo.png`,
      },
    },
    datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
    dateModified: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/guides/${post.slug}`,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Guides", item: `${BASE_URL}/guides` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${BASE_URL}/guides/${post.slug}` },
    ],
  };

  return (
    <>
      <Navbar />
      <SEO
        title={`${post.title} | Shop in Siesta Key`}
        description={post.excerpt ?? `Read our guide: ${post.title}`}
        canonical={`/guides/${post.slug}`}
        image={post.coverImage ?? PANORAMA_DEFAULT}
        ogType="article"
        jsonLd={[articleSchema, breadcrumbSchema]}
      />

      {/* Cover image */}
      <div className="w-full h-64 md:h-96 overflow-hidden">
        <img
          src={post.coverImage ?? PANORAMA_DEFAULT}
          alt={post.title}
          className="w-full h-full object-cover"
        />
      </div>

      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Back link */}
        <Link href="/guides" className="inline-flex items-center gap-1.5 text-sm text-[#0d3b5e] hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          All Guides
        </Link>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Badge variant="secondary">{post.category ?? "Guide"}</Badge>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Calendar className="w-3 h-3" />
            {formatDate(post.publishedAt)}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            {readingTime(post.content)} min read
          </span>
          <span className="text-xs text-gray-400">By {post.author ?? "Shop in Siesta Key"}</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-lg text-gray-600 border-l-4 border-teal-400 pl-4 mb-8 italic">
            {post.excerpt}
          </p>
        )}

        {/* Tags */}
        {(post.tags as string[]).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {(post.tags as string[]).map((tag) => (
              <span key={tag} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Content */}
        <article className="prose prose-slate prose-lg max-w-none prose-headings:text-[#0d3b5e] prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-p:mb-8 prose-p:leading-[1.85] prose-headings:mt-12 prose-headings:mb-4 prose-h2:text-2xl prose-h3:text-xl prose-li:mb-2 prose-ul:my-6 prose-ol:my-6">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </article>

        {/* Share */}
        <div className="mt-12 pt-8 border-t flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Found this helpful?</p>
            <p className="text-xs text-gray-400">Share it with friends planning a Siesta Key trip</p>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-[#0d3b5e] text-white text-sm rounded-lg hover:bg-[#1a5a8a] transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>

        {/* Back to directory CTA */}
        <div className="mt-8 p-6 bg-gradient-to-r from-[#0d3b5e] to-[#1a6b8a] rounded-xl text-white text-center">
          <h3 className="font-bold text-lg mb-2">Ready to explore Siesta Key?</h3>
          <p className="text-blue-100 text-sm mb-4">Browse 200+ local businesses, restaurants, and activities.</p>
          <Link
            href="/directory"
            className="inline-block px-6 py-2.5 bg-white text-[#0d3b5e] font-semibold rounded-lg text-sm hover:bg-blue-50 transition-colors"
          >
            Browse the Directory →
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
