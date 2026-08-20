import { Link } from "wouter";
import { MapPin, Phone, Star, ExternalLink, Crown, Sparkles, BadgeCheck } from "lucide-react";

interface BusinessCardProps {
  business: {
    id: number;
    slug: string;
    name: string;
    categoryId: number;
    shortDescription?: string | null;
    description?: string | null;
    address?: string | null;
    area?: string | null;
    phone?: string | null;
    website?: string | null;
    tier: string;
    isFeatured: boolean;
    isSponsored: boolean;
    isClaimed?: boolean | null;
    isChamberMember?: boolean | null;
    rating?: string | null;
    reviewCount?: number | null;
    tags?: string[] | null;
  };
  categoryName?: string;
}

function StarRating({ rating, count }: { rating: string; count: number }) {
  const r = parseFloat(rating);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${i <= Math.round(r) ? "fill-[var(--color-gold)] text-[var(--color-gold)]" : "text-[var(--color-border)]"}`}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-[var(--color-foreground)]">{r.toFixed(1)}</span>
      <span className="text-xs text-[var(--color-muted-foreground)]">({count.toLocaleString()})</span>
    </div>
  );
}

const LIFEGUARD_DEFAULT = "https://siestakey.s3.us-east-2.amazonaws.com/manus-storage/LifeguardStand_453b6dda.png";

export default function BusinessCard({ business, categoryName }: BusinessCardProps) {
  const tags = Array.isArray(business.tags) ? business.tags : [];
  const desc = business.shortDescription || (business.description ? business.description.slice(0, 120) + "…" : "");
  const photos = Array.isArray((business as any).photos) ? (business as any).photos as string[] : [];
  const coverImage = (business as any).coverPhoto
    ? (business as any).coverPhoto
    : photos.length > 0
      ? photos[0]
      : LIFEGUARD_DEFAULT;

  return (
    <Link href={`/business/${business.slug}`} className="block group">
      <div className={`card-coastal h-full flex flex-col ${business.isSponsored ? "ring-2 ring-[var(--color-gold)]/30" : ""}`}>
        {/* Cover image with badge overlays */}
        {coverImage && (
          <div className="relative overflow-hidden">
            <img
              src={coverImage}
              alt={business.name}
              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="absolute top-2 left-2 flex gap-1.5">
              {business.isSponsored && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[var(--color-gold)] text-white shadow">
                  <Crown className="w-3 h-3" /> SPONSORED
                </span>
              )}
              {!business.isSponsored && business.isFeatured && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[var(--color-ocean)] text-white shadow">
                  <Sparkles className="w-3 h-3" /> FEATURED
                </span>
              )}
            </div>
            {business.isClaimed && (
              <div className="absolute top-2 right-2">
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-600 text-white shadow">
                  <BadgeCheck className="w-3 h-3" /> CLAIMED
                </span>
              </div>
            )}
            {(business as any).isChamberMember && (
              <div className="absolute bottom-2 left-2 group/chamber">
                <img
                  src="https://siestakey.s3.us-east-2.amazonaws.com/manus-storage/chamber_badge-cnLf2FfXDVDZgysSz9HxLV.webp"
                  alt="Chamber Member"
                  className="w-10 h-10 rounded-full shadow-lg border-2 border-white/60"
                />
                <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded-md bg-gray-900/90 px-2 py-1 text-[11px] font-medium text-white opacity-0 group-hover/chamber:opacity-100 transition-opacity duration-150 shadow">
                  Chamber Member
                </span>
              </div>
            )}
          </div>
        )}

        {/* Color header band — only when no cover image */}
        {!coverImage && (
          <div
            className={`h-2 w-full ${
              business.isSponsored
                ? "bg-gradient-to-r from-[var(--color-gold)] to-[oklch(0.68_0.18_55)]"
                : business.isFeatured
                ? "bg-ocean-gradient"
                : "bg-gradient-to-r from-[var(--color-seafoam)] to-[var(--color-ocean-pale)]"
            }`}
          />
        )}

        <div className="p-5 flex flex-col flex-1">
          {/* Category label only — tier badge shown on image overlay */}
          {categoryName && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
                {categoryName}
              </span>
            </div>
          )}

          {/* Name */}
          <h3 className="font-serif font-semibold text-lg leading-snug text-[var(--color-charcoal)] group-hover:text-[var(--color-ocean)] transition-colors mb-2">
            {business.name}
          </h3>

          {/* Description */}
          {desc && (
            <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed mb-3 flex-1">
              {desc}
            </p>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-ocean-pale)] text-[var(--color-ocean)] font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Rating */}
          {business.rating && business.reviewCount != null && business.reviewCount > 0 && (
            <div className="mb-3">
              <StarRating rating={business.rating} count={business.reviewCount} />
            </div>
          )}

          {/* Meta */}
          <div className="space-y-1.5 mt-auto pt-3 border-t border-[var(--color-border)]">
            {business.area && (
              <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)]">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{business.area}</span>
              </div>
            )}
            {business.phone && (
              <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)]">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <span>{business.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
