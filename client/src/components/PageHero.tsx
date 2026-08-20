interface PageHeroProps {
  title: string;
  subtitle?: string;
  breadcrumb?: string;
}

/**
 * Shared image-based page header banner used on all inner directory pages.
 * Uses the Siesta Key beach photo with a dark overlay for text legibility.
 */
export default function PageHero({ title, subtitle, breadcrumb }: PageHeroProps) {
  return (
    <section
      className="relative pt-24 pb-14 flex items-end overflow-hidden"
      style={{
        backgroundImage: `url(https://siestakey.s3.us-east-2.amazonaws.com/manus-storage/SiestaKey-hero_60f0f3c1.webp)`,
        backgroundSize: "cover",
        backgroundPosition: "center 40%",
        minHeight: "220px",
      }}
    >
      {/* Dark overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />

      <div className="relative z-10 container">
        {breadcrumb && (
          <div className="text-white/60 text-xs uppercase tracking-widest font-medium mb-2">
            {breadcrumb}
          </div>
        )}
        <h1 className="font-serif text-3xl md:text-5xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-white/80 text-sm md:text-base max-w-xl [text-shadow:0_1px_6px_rgba(0,0,0,0.5)]">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
