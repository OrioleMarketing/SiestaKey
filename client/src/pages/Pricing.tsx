import { useState } from "react";
import { Link } from "wouter";
import { Check, X, Crown, Star, Sparkles, Zap, Shield, BarChart3, MapPin, LogIn, Loader2, Phone, Mail } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

// ── Feature rows ──────────────────────────────────────────────────────────────
type FeatureRow = {
  label: string;
  free: boolean | string;
  featured: boolean | string;
  premium: boolean | string;
  highlight?: boolean;
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
  { label: "Top Search Placement",     free: false, featured: false, premium: true  },
  { label: "Homepage Featured Spot",   free: false, featured: false, premium: true  },
  { label: "Sponsored Badge",          free: false, featured: false, premium: true  },
  { label: "Priority Customer Support",free: false, featured: false, premium: true  },
  {
    label: "AI Visibility Report ($299 Value)",
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
    name: "Sandy Shores",
    tagline: "Get your business on the map at no cost",
    monthlyPrice: "$0",
    annualPrice: "$0",
    annualNote: "forever free",
    cta: "Add Your Business",
    ctaHref: "/submit-listing",
    ctaStyle: "outline",
    badge: null,
    accentClass: "border-[var(--color-border)]",
    headerClass: "bg-[var(--color-white-sand)]",
    priceClass: "text-[var(--color-charcoal)]",
    periodClass: "text-[var(--color-muted-foreground)]",
  },
  {
    id: "featured",
    name: "Gulf Breeze",
    tagline: "Stand out with top placement and a complete profile",
    monthlyPrice: "$49",
    annualPrice: "$490",
    annualNote: "2 months free",
    cta: "Get Gulf Breeze",
    ctaHref: "/submit-listing",
    ctaStyle: "ocean",
    badge: "Most Popular",
    accentClass: "border-[var(--color-ocean)] ring-2 ring-[var(--color-ocean)]/20 shadow-sm",
    headerClass: "bg-[var(--color-ocean)]",
    priceClass: "text-white",
    periodClass: "text-white/60",
  },
  {
    id: "premium",
    name: "Island Premier",
    tagline: "Maximum visibility + AI Visibility Report included free",
    monthlyPrice: "$79",
    annualPrice: "$790",
    annualNote: "2 months free",
    cta: "Go Island Premier",
    ctaHref: "/submit-listing",
    ctaStyle: "coral",
    badge: "⭐ Recommended",
    accentClass: "border-[var(--color-gold)] ring-4 ring-[var(--color-gold)]/40 scale-[1.03] shadow-2xl",
    headerClass: "bg-gradient-to-br from-[var(--color-ocean-deep)] to-[#1a4a6b]",
    priceClass: "text-white",
    periodClass: "text-white/60",
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
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");
  const { user } = useAuth();
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  const checkout = trpc.stripe.createCheckout.useMutation({
    onSuccess: ({ url }) => {
      if (url) window.open(url, "_blank");
      else toast.error("Could not create checkout session. Please try again.");
      setCheckingOut(null);
    },
    onError: (err) => {
      toast.error(err.message ?? "Checkout failed. Please try again.");
      setCheckingOut(null);
    },
  });

  function handlePaidPlan(planId: string) {
    if (!user) {
      window.location.href = getLoginUrl();
      return;
    }
    const planKey = planId === "featured" ? "gulf_breeze" : "island_premier";
    const interval = billing === "monthly" ? "monthly" : "yearly";
    setCheckingOut(planId);
    checkout.mutate({ planKey, interval, origin: window.location.origin });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Listing Plans & Pricing — Shop in Siesta Key"
        description="Choose Sandy Shores (free), Gulf Breeze ($49/mo), or Island Premier ($79/mo) for your Siesta Key business listing. Island Premier includes a $299 AI Visibility Report at no extra cost."
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
            From a free listing to a premium spotlight with a complimentary AI Visibility Report — find the plan that fits your business.
          </p>
        </div>
      </section>

      {/* ── Billing Toggle ────────────────────────────────────────────────────── */}
      <section className="bg-[var(--color-white-sand)] pt-12 pb-2 px-4">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-3">
          <div className="flex items-center gap-1 bg-white border border-[var(--color-border)] rounded-full p-1 shadow-sm">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                billing === "monthly"
                  ? "bg-[var(--color-ocean)] text-white shadow-sm"
                  : "text-[var(--color-muted-foreground)] hover:text-[var(--color-charcoal)]"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("annual")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                billing === "annual"
                  ? "bg-[var(--color-ocean)] text-white shadow-sm"
                  : "text-[var(--color-muted-foreground)] hover:text-[var(--color-charcoal)]"
              }`}
            >
              Annual
            </button>
          </div>
          {billing === "annual" && (
            <p className="text-sm text-emerald-600 font-semibold">
              🎉 Pay for 10 months, get 2 free — save up to $158/year
            </p>
          )}
        </div>
      </section>

      {/* ── Plan Cards ────────────────────────────────────────────────────────── */}
      <section className="bg-[var(--color-white-sand)] py-8 px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {PLANS.map((plan) => {
              const displayPrice = billing === "monthly" ? plan.monthlyPrice : plan.annualPrice;
              const displayPeriod = billing === "monthly" ? "per month" : "per year";
              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-2xl border-2 overflow-hidden shadow-sm ${plan.accentClass} bg-white`}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute top-4 right-4 z-10">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                      plan.id === "featured"
                        ? "bg-[var(--color-ocean)] text-white"
                        : "bg-[var(--color-gold)] text-[var(--color-charcoal)] shadow-md"
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
                      <span className={`font-serif font-bold text-4xl ${plan.priceClass}`}>{displayPrice}</span>
                      {plan.id !== "free" && (
                        <span className={`text-sm ${plan.periodClass}`}>/{displayPeriod}</span>
                      )}
                    </div>
                    {plan.id !== "free" && billing === "annual" && (
                      <p className={`text-xs mt-1 ${plan.id === "free" ? "text-[var(--color-muted-foreground)]" : "text-white/60"}`}>
                        {plan.annualNote} · billed annually
                      </p>
                    )}
                    {plan.id !== "free" && billing === "monthly" && (
                      <p className={`text-xs mt-1 ${plan.periodClass}`}>
                        or {plan.annualPrice}/yr — save 2 months
                      </p>
                    )}
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
                    {plan.id === "free" ? (
                      <Link
                        href={plan.ctaHref}
                        className="w-full flex items-center justify-center gap-2 font-semibold py-3 px-6 rounded-xl transition-all duration-200 active:scale-[0.97] border-2 border-[var(--color-ocean)] text-[var(--color-ocean)] hover:bg-[var(--color-ocean)] hover:text-white"
                      >
                        {plan.cta}
                      </Link>
                    ) : (
                      <button
                        onClick={() => handlePaidPlan(plan.id)}
                        disabled={checkingOut === plan.id}
                        className={`w-full flex items-center justify-center gap-2 font-semibold py-3 px-6 rounded-xl transition-all duration-200 active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed ${
                          plan.ctaStyle === "ocean"
                            ? "bg-[var(--color-ocean)] text-white hover:bg-[var(--color-ocean-deep)]"
                            : "bg-[var(--color-coral)] text-white hover:bg-[var(--color-coral-dark,#c94a34)]"
                        }`}
                      >
                        {checkingOut === plan.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : plan.id === "premium" ? (
                          <Crown className="w-4 h-4" />
                        ) : !user ? (
                          <LogIn className="w-4 h-4" />
                        ) : null}
                        {checkingOut === plan.id ? "Redirecting..." : !user ? `Sign in to ${plan.cta}` : plan.cta}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── AI Visibility Report Feature Section ──────────────────────────────── */}
      <section className="bg-gradient-to-br from-[var(--color-ocean-deep)] to-[#0d2f45] py-20 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[var(--color-gold)]/20 border border-[var(--color-gold)]/30 rounded-full px-4 py-1.5 text-[var(--color-gold)] text-sm font-semibold mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              Exclusive Island Premier Bonus — $299 Value, Included Free
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
              AI Search Is Replacing Google.<br />
              <span className="text-[var(--color-gold)]">Is Your Business Invisible?</span>
            </h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">
              When a customer asks ChatGPT, Google Gemini, or Perplexity for a recommendation in Siesta Key, your business either shows up — or it doesn't. Our AI Visibility Report tells you exactly where you stand and what to fix.
            </p>
          </div>

          {/* Stat row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            {[
              { stat: "1 in 3", label: "local searches now go through AI assistants", sub: "Growing 40%+ year over year" },
              { stat: "87%", label: "of local businesses have zero AI optimization", sub: "Invisible to ChatGPT & Perplexity" },
              { stat: "1", label: "business gets recommended — everyone else loses", sub: "AI has no page 2" },
            ].map((item) => (
              <div key={item.stat} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                <div className="font-serif text-4xl font-bold text-[var(--color-gold)] mb-2">{item.stat}</div>
                <p className="text-white text-sm font-medium mb-1">{item.label}</p>
                <p className="text-white/50 text-xs">{item.sub}</p>
              </div>
            ))}
          </div>

          {/* 4-Pillar audit */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-10">
            <h3 className="font-serif text-xl font-bold text-white mb-2 text-center">
              The 4-Pillar AI Readiness Audit
            </h3>
            <p className="text-white/60 text-sm text-center mb-8">
              We analyze the four critical signals that ChatGPT, Gemini, and Perplexity use to decide which businesses to recommend. Most businesses score below 50.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: <Zap className="w-5 h-5 text-[var(--color-gold)]" />,
                  title: "AI Data Signals",
                  weight: "30%",
                  desc: "Structured schema markup that helps AI engines understand and recommend your business.",
                },
                {
                  icon: <Shield className="w-5 h-5 text-[var(--color-gold)]" />,
                  title: "AI Access & Indexing",
                  weight: "25%",
                  desc: "Can AI bots access, read, and index your website content?",
                },
                {
                  icon: <BarChart3 className="w-5 h-5 text-[var(--color-gold)]" />,
                  title: "Reputation Strength",
                  weight: "25%",
                  desc: "Review quality and trust signals that AI engines use to rank local businesses.",
                },
                {
                  icon: <MapPin className="w-5 h-5 text-[var(--color-gold)]" />,
                  title: "Business Info Accuracy",
                  weight: "20%",
                  desc: "Name, address, and phone number consistency across the web.",
                },
              ].map((pillar) => (
                <div key={pillar.title} className="flex gap-4 bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-gold)]/15 flex items-center justify-center shrink-0">
                    {pillar.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-semibold text-sm">{pillar.title}</h4>
                      <span className="text-xs text-[var(--color-gold)] bg-[var(--color-gold)]/10 px-1.5 py-0.5 rounded font-medium">{pillar.weight}</span>
                    </div>
                    <p className="text-white/55 text-xs leading-relaxed">{pillar.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What you get */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              { title: "AI Visibility Score", desc: "See exactly how your business ranks in AI-generated answers across ChatGPT, Gemini, and Perplexity." },
              { title: "Competitor Gap Analysis", desc: "Find out which competitors AI is recommending instead of you — and why." },
              { title: "Prioritized Action Plan", desc: "Get a step-by-step list of fixes to become the AI-recommended business in Siesta Key." },
            ].map((item) => (
              <div key={item.title} className="bg-white/8 rounded-xl p-5 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-[var(--color-gold)]/20 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-[var(--color-gold)] stroke-[2.5]" />
                  </div>
                  <h3 className="font-semibold text-white text-sm">{item.title}</h3>
                </div>
                <p className="text-white/55 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <p className="text-white/60 text-sm mb-5">
              Powered by{" "}
              <a href="https://mybizreport.com/OrioleMarketing/aeo" target="_blank" rel="noopener noreferrer" className="text-[var(--color-gold)] hover:underline">
                Oriole Marketing's AI Visibility Report
              </a>{" "}
              — normally $299, included free with Island Premier.
            </p>
            <Link
              href="/submit-listing"
              className="inline-flex items-center gap-2 bg-[var(--color-gold)] text-[var(--color-charcoal)] font-bold px-8 py-3.5 rounded-xl hover:bg-yellow-400 transition-all duration-200 active:scale-[0.97]"
            >
              <Crown className="w-4 h-4" />
              Get Island Premier — {billing === "annual" ? "$790/yr" : "$79/mo"}
            </Link>
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
                    Sandy Shores
                    <div className="text-xs font-normal text-[var(--color-muted-foreground)] mt-0.5">Free</div>
                  </th>
                  <th className="px-4 py-4 text-center font-semibold text-white bg-[var(--color-ocean)]">
                    Gulf Breeze
                    <div className="text-xs font-normal text-white/70 mt-0.5">$49/mo · $490/yr</div>
                  </th>
                  <th className="px-4 py-4 text-center font-semibold text-white bg-[var(--color-ocean-deep)] rounded-tr-2xl">
                    Island Premier
                    <div className="text-xs font-normal text-white/70 mt-0.5">$79/mo · $790/yr</div>
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
              href="tel:+19419572639"
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

      {/* Trust / Powered By Section */}
      <section className="py-8 bg-[var(--color-white-sand)] border-t border-border">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-5">
            Powered by a verified, accredited local marketing agency
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            <a
              href="https://oriolemarketing.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 group"
            >
              <span className="text-sm font-semibold text-[var(--color-ocean)] group-hover:underline">
                Oriole Marketing
              </span>
              <span className="text-xs text-muted-foreground">Local Directory Partner</span>
            </a>
            <span className="text-border text-lg hidden sm:block">|</span>
            <a
              href="https://www.siestakey.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 group opacity-70 hover:opacity-100 transition-opacity"
            >
              <img
                src="/manus-storage/SiestaKeyChamber-logo_6b0fdfdd.svg"
                alt="Siesta Key Chamber of Commerce"
                className="h-8 w-auto object-contain"
              />
              <span className="text-xs text-muted-foreground group-hover:text-[var(--color-ocean)] transition-colors leading-tight text-left">
                Siesta Key Chamber<br />of Commerce
              </span>
            </a>
            <span className="text-border text-lg hidden sm:block">|</span>
            <a
              href="https://www.bbb.org/us/in/plainfield/profile/digital-marketing/oriole-marketing-llc-0382-90038569/#sealclick"
              target="_blank"
              rel="nofollow"
              className="flex items-center gap-2 group opacity-70 hover:opacity-100 transition-opacity"
            >
              <img
                src="https://seal-indy.bbb.org/seals/blue-seal-200-42-bbb-90038569.png"
                alt="Oriole Marketing LLC BBB Business Review"
                style={{ border: 0 }}
                className="h-8 w-auto object-contain"
              />
              <span className="text-xs text-muted-foreground group-hover:text-[var(--color-ocean)] transition-colors leading-tight text-left">
                BBB Accredited<br />Business
              </span>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
