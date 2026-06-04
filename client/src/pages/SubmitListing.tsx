import { useState, useEffect } from "react";
import { CheckCircle, Crown, Building2, CreditCard, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { toast } from "sonner";

// Tier keys must match the backend enum: free | gulf_breeze | island_premier
const PLANS = [
  {
    id: "free",
    name: "Free Listing",
    price: "$0",
    period: "forever",
    features: [
      "Basic business profile",
      "Contact info & hours",
      "Category listing",
      "Google Maps pin",
    ],
    cta: "Submit Free Listing",
    highlight: false,
    color: "border-[var(--color-border)]",
  },
  {
    id: "gulf_breeze",
    name: "Gulf Breeze",
    price: "$49",
    period: "per month",
    features: [
      "Everything in Free",
      "Featured badge & top placement",
      "Priority in search results",
      "Enhanced profile card",
      "GoHighLevel automation",
      "Google Reviews widget",
    ],
    cta: "Get Gulf Breeze",
    highlight: true,
    color: "border-[var(--color-ocean)]",
  },
  {
    id: "island_premier",
    name: "Island Premier",
    price: "$79",
    period: "per month",
    features: [
      "Everything in Gulf Breeze",
      "Sponsored badge",
      "Homepage placement",
      "Category page hero",
      "Dedicated account support",
      "Google Reviews widget",
    ],
    cta: "Get Island Premier",
    highlight: false,
    color: "border-[var(--color-coral)]",
  },
];

const CATEGORIES = [
  "Dining", "Shopping", "Activities", "Services",
  "Nightlife", "Wellness", "Accommodations", "Real Estate",
];

const AREAS = [
  "Siesta Key Village", "South Village", "Siesta Key Beach", "Near Siesta Key",
];

export default function SubmitListing() {
  const [selectedPlan, setSelectedPlan] = useState<"free" | "gulf_breeze" | "island_premier">("free");
  const [submitted, setSubmitted] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"success" | "cancelled" | null>(null);
  const [submittedName, setSubmittedName] = useState("");
  const [form, setForm] = useState({
    businessName: "",
    category: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    area: "",
    description: "",
  });

  // Handle Stripe redirect-back query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    if (payment === "success") {
      setPaymentStatus("success");
      const plan = params.get("plan") ?? "";
      const planName = PLANS.find((p) => p.id === plan)?.name ?? "paid";
      toast.success(`Payment received for ${planName} plan! Your listing is under review.`);
    } else if (payment === "cancelled") {
      setPaymentStatus("cancelled");
      toast.info("Payment cancelled. You can re-submit or choose the free plan.");
    }
  }, []);

  const submitMutation = trpc.submissions.submit.useMutation({
    onError: (err: { message?: string }) => {
      toast.error(err.message || "Something went wrong. Please try again.");
    },
  });

  const checkoutMutation = trpc.submissions.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.info("Redirecting to secure payment…");
        window.open(data.url, "_blank");
      }
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message || "Could not create checkout session. Please try again.");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Save submission to DB
    const result = await submitMutation.mutateAsync({
      businessName: form.businessName,
      contactName: form.contactName,
      email: form.email,
      phone: form.phone || undefined,
      website: form.website || undefined,
      address: form.address || undefined,
      description: form.description
        ? `[Category: ${form.category}] [Area: ${form.area}] ${form.description}`
        : `[Category: ${form.category}] [Area: ${form.area}]`,
      tier: selectedPlan,
    });

    setSubmittedName(form.businessName);

    if (selectedPlan === "free") {
      // Free tier: show confirmation immediately
      setSubmitted(true);
      toast.success("Listing submitted! We'll review and publish it within 1–2 business days.");
    } else {
      // Paid tier: redirect to Stripe Checkout
      checkoutMutation.mutate({
        submissionId: result.id,
        tier: selectedPlan,
        interval: "monthly",
        contactName: form.contactName,
        email: form.email,
        origin: window.location.origin,
      });
      setSubmitted(true);
    }
  };

  const update = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const isPending = submitMutation.isPending || checkoutMutation.isPending;
  const selectedPlanData = PLANS.find((p) => p.id === selectedPlan)!;

  // ── Payment success state ─────────────────────────────────────────────────────
  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20 bg-[var(--color-white-sand)]">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-20 h-20 rounded-full bg-[var(--color-seafoam-light)] flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-[var(--color-seafoam)]" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-[var(--color-charcoal)] mb-3">
              Payment Received!
            </h2>
            <p className="text-[var(--color-muted-foreground)] mb-2 leading-relaxed">
              Your listing is now under review. We'll activate your profile within 1–2 business days and send you a confirmation email.
            </p>
            <p className="text-sm text-[var(--color-ocean)] mb-6">
              If your submission is not approved, your payment will be fully refunded.
            </p>
            <a href="/directory" className="btn-ocean">
              Browse the Directory
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Payment cancelled state ───────────────────────────────────────────────────
  if (paymentStatus === "cancelled") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20 bg-[var(--color-white-sand)]">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-orange-500" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-[var(--color-charcoal)] mb-3">
              Payment Cancelled
            </h2>
            <p className="text-[var(--color-muted-foreground)] mb-6 leading-relaxed">
              No charge was made. You can try again or choose the free listing option.
            </p>
            <button
              onClick={() => {
                setPaymentStatus(null);
                window.history.replaceState({}, "", "/submit-listing");
              }}
              className="btn-ocean"
            >
              Return to Form
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Free-tier submission success state ────────────────────────────────────────
  if (submitted && selectedPlan === "free") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20 bg-[var(--color-white-sand)]">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-20 h-20 rounded-full bg-[var(--color-seafoam-light)] flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-[var(--color-seafoam)]" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-[var(--color-charcoal)] mb-3">
              Listing Submitted!
            </h2>
            <p className="text-[var(--color-muted-foreground)] mb-6 leading-relaxed">
              Thank you for submitting <strong>{submittedName}</strong>. We'll review your listing and publish it within 1–2 business days.
            </p>
            <a href="/directory" className="btn-ocean">
              Browse the Directory
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Paid-tier: redirecting to Stripe ─────────────────────────────────────────
  if (submitted && selectedPlan !== "free") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20 bg-[var(--color-white-sand)]">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-20 h-20 rounded-full bg-[var(--color-ocean-pale)] flex items-center justify-center mx-auto mb-6">
              <CreditCard className="w-10 h-10 text-[var(--color-ocean)]" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-[var(--color-charcoal)] mb-3">
              Redirecting to Payment…
            </h2>
            <p className="text-[var(--color-muted-foreground)] mb-2 leading-relaxed">
              Your listing for <strong>{submittedName}</strong> has been saved. Opening secure checkout for the <strong>{selectedPlanData.name}</strong> plan in a new tab.
            </p>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              If the checkout tab didn't open,{" "}
              <button
                className="text-[var(--color-ocean)] underline"
                onClick={() =>
                  checkoutMutation.mutate({
                    submissionId: 0,
                    tier: selectedPlan as "gulf_breeze" | "island_premier",
                    interval: "monthly",
                    contactName: form.contactName,
                    email: form.email,
                    origin: window.location.origin,
                  })
                }
              >
                click here to retry
              </button>
              .
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Add Your Business Listing — Siesta Key Directory"
        description="List your Siesta Key business for free or upgrade to a featured placement for maximum visibility. Reach thousands of visitors every month."
        canonical="/submit-listing"
      />
      <Navbar />

      <PageHero
        title="Submit Your Business"
        subtitle="Get your business in front of thousands of Siesta Key visitors and residents. Choose a plan that works for you."
        breadcrumb="Directory / Submit Your Business"
      />

      <main className="flex-1 py-12 bg-[var(--color-white-sand)]">
        <div className="container max-w-5xl">
          {/* Plan selector */}
          <div className="mb-10">
            <h2 className="font-serif text-2xl font-bold text-[var(--color-charcoal)] mb-6 text-center">
              Choose Your Plan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {PLANS.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlan(plan.id as typeof selectedPlan)}
                  className={`text-left rounded-2xl p-6 border-2 transition-all duration-200 relative ${
                    selectedPlan === plan.id
                      ? `${plan.color} bg-white shadow-lg`
                      : "border-[var(--color-border)] bg-white hover:border-[var(--color-ocean-light)]"
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="badge-featured flex items-center gap-1 px-3 py-1 text-xs whitespace-nowrap">
                        ★ Most Popular
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-serif font-bold text-lg text-[var(--color-charcoal)]">{plan.name}</div>
                    {selectedPlan === plan.id && (
                      <div className="w-5 h-5 rounded-full bg-[var(--color-ocean)] flex items-center justify-center shrink-0">
                        <CheckCircle className="w-3.5 h-3.5 text-white fill-white" />
                      </div>
                    )}
                  </div>
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-[var(--color-charcoal)]">{plan.price}</span>
                    <span className="text-sm text-[var(--color-muted-foreground)] ml-1">{plan.period}</span>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-[var(--color-muted-foreground)]">
                        <CheckCircle className="w-4 h-4 text-[var(--color-seafoam)] shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-ocean-pale)] flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[var(--color-ocean)]" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-semibold text-[var(--color-charcoal)]">Business Details</h2>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  Plan selected: <strong className="text-[var(--color-ocean)]">{selectedPlanData.name}</strong>
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.businessName}
                    onChange={update("businessName")}
                    placeholder="Your business name"
                    className="search-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={form.category}
                    onChange={update("category")}
                    className="search-input"
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">
                    Contact Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.contactName}
                    onChange={update("contactName")}
                    placeholder="Your name"
                    className="search-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={update("email")}
                    placeholder="you@business.com"
                    className="search-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={update("phone")}
                    placeholder="(941) 555-0000"
                    className="search-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">Website</label>
                  <input
                    type="url"
                    value={form.website}
                    onChange={update("website")}
                    placeholder="https://yourbusiness.com"
                    className="search-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">Address</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={update("address")}
                    placeholder="123 Ocean Blvd, Siesta Key, FL"
                    className="search-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">Area</label>
                  <select value={form.area} onChange={update("area")} className="search-input">
                    <option value="">Select area</option>
                    {AREAS.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">
                  Business Description
                </label>
                <textarea
                  value={form.description}
                  onChange={update("description")}
                  placeholder="Describe your business, what makes it special, and what customers can expect…"
                  rows={4}
                  className="search-input resize-none"
                />
              </div>

              {/* Paid tier note */}
              {selectedPlan !== "free" && (
                <div className="bg-[var(--color-ocean-pale)] border border-[var(--color-ocean-light)] rounded-xl p-4 flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-[var(--color-ocean)] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-[var(--color-ocean-deep)] mb-1">
                      Secure Payment via Stripe
                    </div>
                    <p className="text-xs text-[var(--color-muted-foreground)]">
                      After submitting your details, you'll be redirected to a secure Stripe checkout page to complete payment for the <strong>{selectedPlanData.name}</strong> plan ({selectedPlanData.price}/mo). If your listing is not approved, your payment will be fully refunded.
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="btn-coral w-full justify-center py-3.5 text-base"
              >
                {isPending
                  ? selectedPlan === "free" ? "Submitting…" : "Preparing checkout…"
                  : selectedPlanData.cta}
              </button>

              <p className="text-xs text-center text-[var(--color-muted-foreground)]">
                By submitting, you confirm this is a real Siesta Key business and agree to our listing guidelines.
              </p>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
