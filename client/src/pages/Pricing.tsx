import { Link } from "wouter";
import { Check, X, Crown, Star, Sparkles, Phone, Mail } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

// ── Feature rows ──────────────────────────────────────────────────────────────
// Each row: label, whether Free / Featured / Premium includes it, and optional note
type FeatureRow = {
  label: string;
  free: boolean | string;
  featured: boolean | string;
  premium: boolean | string;
  highlight?: boolean; // golden highlight row
};

const FEATURES: FeatureRow[] = [
  { label: "Business Name & Address",   free: true,  featured: true,  premium: true  },
  { label: "Phone Number",              free: true,  featured: true,  premium: true  },
  { label: "Website Link",             free: true,  featured: true,  premium: true  },
  { label: "Profile Photo",            free: true,  featured: true,  premium: true  },
  { label: "Business Category",        free: true,  featured: true,  premium: true  },
  { label: "Google Maps Pin",          free: true,  featured: true,  premium: true  },
  { label: "Email Address",            free: false, featured: true,  premium: true  },
  { label: "Social Media Links",       free: false, featured: true,  premium: true  },
  { label: "Business Description",     free: false, featured: true,  premium: true  },
  { label: "Business Hours",           free: false, featured: true,  premium: true  },
  { label: "Cover Image",              free: false, featured: true,  premium: true  },
  { label: "Photo Gallery (up to 10)", free: false, featured: true,  premium: true  },
  { label: "Video Embed",              free: false, featured: true,  premium: true  },
  { label: "Events & Announcements",   free: false, featured: true,  premium: true  },
  { label: "Customer Reviews",         free: false, featured: true,  premium: true  },
  { label: "Google Reviews Display",   free: false, featured: true,  premium: true  },
  { label: "Featured Badge",           free: false, featured: true,  premium: true  },
  { label: "Top Search Placement",     free: false, featured: true,  premium: true  },
  { label: "Homepage Featured Spot",   free: false, featured: false, premium: true  },
  { label: "Sponsored Badge",          free: false, featured: false, premium: true  },
  { label: "Priority Customer Support",free: false, featured: false, premium: true  },
  {
    label: "AI Search Audit ($299 Value)",
    free: false,
    featured: false,
    premium: true,
    highlight: true,
  },
];

// ── Plan definitions ──────────────────────────────────────────────────────────
const PLANS = [
  {
    id: "free",
    name: "Free Listing",
    tagline: "Get your business on the map at no cost",
    price: "$0",
    period: "forever",
    cta: "Add Your Business",
    ctaHref: "/submit-listing",
    ctaStyle: "outline",
    badge: null,
    accentClass: "border-[var(--color-border)]",
    headerClass: "bg-[var(--color-white-sand)]",
    priceClass: "text-[var(--color-charcoal)]",
  },
  {
    id: "featured",
    name: "Featured Listing",
    tagline: "Stand out with top placement and a complete profile",
    price: "$149",
    period: "per year",
    cta: "Get Featured",
    ctaHref: "/submit-listing",
    ctaStyle: "ocean",
    badge: "Most Popular",
    accentClass: "border-[var(--color-ocean)] ring-2 ring-[var(--color-ocean)]/20",
    headerClass: "bg-[var(--color-ocean)]",
    priceClass: "text-white",
  },
  {
    id: "premium",
    name: "Premium Listing",
    tagline: "Maximum visibility — homepage spotlight + AI Search Audit",
    price: "$299",
    period: "per year",
    cta: "Go Premium",
    ctaHref: "/submit-listing",
    ctaStyle: "coral",
    badge: "Best Value",
    accentClass: "border-[var(--color-gold)] ring-2 ring-[var(--color-gold)]/20",
    headerClass: "bg-gradient-to-br from-[var(--color-ocean-deep)] to-[#1a4a6b]",
    priceClass: "text-white",
  },
];

// ── Sub-components ────────────────────────────────────────────────────────────
function FeatureCell({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <div className="flex justify-center">
        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
        </div>
      </div>
    );
  }
  if (value === false) {
    return (
      <div className="flex justify-center">
        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
          <X className="w-3.5 h-3.5 text-gray-400 stroke-[2.5]" />
        </div>
      </div>
    );
  }
  return <span className="text-xs text-[var(--color-muted-foreground)] text-center block">{value}</span>;
}

export default function Pricing() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Listing Plans & Pricing — Shop in Siesta Key"
        description="Choose a free, featured, or premium listing plan for your Siesta Key business. Premium includes an AI Search Audit ($299 value) to boost your online visibility."
        canonical="/pricing"
      />
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section
        className="relative pt-28 pb-16 flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(/manus-storage/SiestaKey-hero_60f0f3c1.webp)`,
          backgroundSize: "cover",
          backgroundPosition: "center 40%",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        <div className="relative z-10 text-center px-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white/80 text-sm mb-5">
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-gold)]" />
            Listing Plans for Siesta Key Businesses
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Choose Your Perfect Plan
          </h1>
          <p className="text-white/75 text-lg max-w-xl mx-auto">
            From a free basic listing to a premium spotlight with an AI Search Audit — find the plan that fits your business.
          </p>
        </div>
      </section>

      {/* ── Plan Cards ────────────────────────────────────────────────────────── */}
      <section className="bg-[var(--color-white-sand)] py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border-2 overflow-hidden shadow-sm ${plan.accentClass} bg-white`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      plan.id === "featured"
                        ? "bg-[var(--color-ocean)] text-white"
                        : "bg-[var(--color-gold)] text-[var(--color-charcoal)]"
                    }`}>
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className={`${plan.headerClass} px-6 pt-8 pb-6`}>
                  <div className="flex items-center gap-2 mb-1">
                    {plan.id === "free" && <Star className="w-4 h-4 text-[var(--color-ocean)]" />}
                    {plan.id === "featured" && <Star className="w-4 h-4 text-white" />}
                    {plan.id === "premium" && <Crown className="w-4 h-4 text-[var(--color-gold)]" />}
                    <h2 className={`font-serif font-bold text-xl ${
                      plan.id === "free" ? "text-[var(--color-charcoal)]" : "text-white"
                    }`}>
                      {plan.name}
                    </h2>
                  </div>
                  <p className={`text-sm mb-5 ${
                    plan.id === "free" ? "text-[var(--color-muted-foreground)]" : "text-white/75"
                  }`}>
                    {plan.tagline}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className={`font-serif font-bold text-4xl ${plan.priceClass}`}>{plan.price}</span>
                    <span className={`text-sm ${
                      plan.id === "free" ? "text-[var(--color-muted-foreground)]" : "text-white/60"
                    }`}>
                      /{plan.period}
                    </span>
                  </div>
                </div>

                {/* Feature list */}
                <div className="flex-1 px-6 py-5">
                  <ul className="space-y-3">
                    {FEATURES.map((feature) => {
                      const val = plan.id === "free" ? feature.free : plan.id === "featured" ? feature.featured : feature.premium;
                      const included = val !== false;
                      return (
                        <li
                          key={feature.label}
                          className={`flex items-center gap-3 text-sm ${
                            feature.highlight && included
                              ? "font-semibold text-[var(--color-charcoal)]"
                              : included
                              ? "text-[var(--color-charcoal)]"
                              : "text-gray-400"
                          } ${feature.highlight && included ? "bg-[var(--color-gold)]/10 -mx-2 px-2 py-1 rounded-lg" : ""}`}
                        >
                          {included ? (
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                              feature.highlight ? "bg-[var(--color-gold)]/20" : "bg-emerald-100"
                            }`}>
                              <Check className={`w-3 h-3 stroke-[2.5] ${
                                feature.highlight ? "text-[var(--color-gold)]" : "text-emerald-600"
                              }`} />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                              <X className="w-3 h-3 text-gray-400 stroke-[2.5]" />
                            </div>
                          )}
                          <span>{feature.label}</span>
                          {feature.highlight && included && (
                            <span className="ml-auto text-xs font-normal text-[var(--color-gold)] bg-[var(--color-gold)]/10 px-1.5 py-0.5 rounded">
                              Included
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* CTA */}
                <div className="px-6 pb-7 pt-2">
                  <Link
                    href={plan.ctaHref}
                    className={`w-full flex items-center justify-center gap-2 font-semibold py-3 px-6 rounded-xl transition-all duration-200 active:scale-[0.97] ${
                      plan.ctaStyle === "outline"
                        ? "border-2 border-[var(--color-ocean)] text-[var(--color-ocean)] hover:bg-[var(--color-ocean)] hover:text-white"
                        : plan.ctaStyle === "ocean"
                        ? "bg-[var(--color-ocean)] text-white hover:bg-[var(--color-ocean-deep)]"
                        : "bg-[var(--color-coral)] text-white hover:bg-[var(--color-coral-dark,#c94a34)]"
                    }`}
                  >
                    {plan.id === "premium" && <Crown className="w-4 h-4" />}
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Full Feature Comparison Table ─────────────────────────────────────── */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl font-bold text-[var(--color-charcoal)] mb-2">
              Full Feature Comparison
            </h2>
            <p className="text-[var(--color-muted-foreground)]">
              See exactly what's included in each plan at a glance.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)] shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left px-6 py-4 font-semibold text-[var(--color-charcoal)] bg-[var(--color-white-sand)] w-1/2">
                    Feature
                  </th>
                  <th className="px-4 py-4 text-center font-semibold text-[var(--color-charcoal)] bg-[var(--color-white-sand)]">
                    Free
                  </th>
                  <th className="px-4 py-4 text-center font-semibold text-white bg-[var(--color-ocean)]">
                    Featured
                    <div className="text-xs font-normal text-white/70 mt-0.5">$149/yr</div>
                  </th>
                  <th className="px-4 py-4 text-center font-semibold text-white bg-[var(--color-ocean-deep)] rounded-tr-2xl">
                    Premium
                    <div className="text-xs font-normal text-white/70 mt-0.5">$299/yr</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((feature, i) => (
                  <tr
                    key={feature.label}
                    className={`border-b border-[var(--color-border)] last:border-0 ${
                      feature.highlight
                        ? "bg-[var(--color-gold)]/5"
                        : i % 2 === 0
                        ? "bg-white"
                        : "bg-[var(--color-white-sand)]/40"
                    }`}
                  >
                    <td className="px-6 py-3.5 text-[var(--color-charcoal)]">
                      <span className={feature.highlight ? "font-semibold" : ""}>{feature.label}</span>
                      {feature.highlight && (
                        <span className="ml-2 text-xs text-[var(--color-gold)] font-semibold bg-[var(--color-gold)]/10 px-1.5 py-0.5 rounded">
                          ★ Bonus
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <FeatureCell value={feature.free} />
                    </td>
                    <td className="px-4 py-3.5 text-center bg-[var(--color-ocean)]/5">
                      <FeatureCell value={feature.featured} />
                    </td>
                    <td className="px-4 py-3.5 text-center bg-[var(--color-ocean-deep)]/5">
                      <FeatureCell value={feature.premium} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── AI Search Audit Callout ───────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[var(--color-ocean-deep)] to-[#1a4a6b] py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[var(--color-gold)]/20 border border-[var(--color-gold)]/30 rounded-full px-4 py-1.5 text-[var(--color-gold)] text-sm font-semibold mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Exclusive Premium Bonus
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
            AI Search Audit — Included Free
          </h2>
          <p className="text-white/75 text-lg leading-relaxed mb-6">
            Normally priced at <span className="text-white font-semibold line-through">$299</span>, our AI Search Audit analyzes how your business appears across AI-powered search platforms like ChatGPT, Google AI Overviews, and Perplexity — and delivers a detailed report with actionable recommendations to improve your visibility where modern customers are searching.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-left">
            {[
              { title: "AI Visibility Score", desc: "See how your business ranks in AI-generated answers and recommendations." },
              { title: "Competitor Gap Analysis", desc: "Discover what your competitors are doing that you're not — and how to close the gap." },
              { title: "Action Plan", desc: "Receive a prioritized list of improvements to boost your AI search presence." },
            ].map((item) => (
              <div key={item.title} className="bg-white/10 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-[var(--color-gold)]/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-[var(--color-gold)] stroke-[2.5]" />
                  </div>
                  <h3 className="font-semibold text-white text-sm">{item.title}</h3>
                </div>
                <p className="text-white/60 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <Link
            href="/submit-listing"
            className="inline-flex items-center gap-2 bg-[var(--color-gold)] text-[var(--color-charcoal)] font-bold px-8 py-3.5 rounded-xl hover:bg-yellow-400 transition-all duration-200 active:scale-[0.97]"
          >
            <Crown className="w-4 h-4" />
            Get Premium — $299/yr
          </Link>
        </div>
      </section>

      {/* ── Questions CTA ─────────────────────────────────────────────────────── */}
      <section className="bg-[var(--color-white-sand)] py-14 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-2xl font-bold text-[var(--color-charcoal)] mb-3">
            Have questions before signing up?
          </h2>
          <p className="text-[var(--color-muted-foreground)] mb-8">
            We're happy to walk you through the options and help you choose the plan that's right for your business.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="tel:+19415551234"
              className="flex items-center gap-2 bg-[var(--color-ocean)] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[var(--color-ocean-deep)] transition-all duration-200 active:scale-[0.97]"
            >
              <Phone className="w-4 h-4" />
              Call Us
            </a>
            <a
              href="mailto:info@shopinsiestakey.com"
              className="flex items-center gap-2 border-2 border-[var(--color-ocean)] text-[var(--color-ocean)] font-semibold px-6 py-3 rounded-xl hover:bg-[var(--color-ocean)] hover:text-white transition-all duration-200 active:scale-[0.97]"
            >
              <Mail className="w-4 h-4" />
              Email Us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
