import { useState } from "react";
import { CheckCircle, MapPin, Star, Zap, Crown, Building2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";

const PLANS = [
  {
    id: "free",
    name: "Free Listing",
    price: "$0",
    period: "forever",
    features: ["Basic business profile", "Contact info & hours", "Category listing", "Google Maps pin"],
    cta: "Submit Free",
    highlight: false,
  },
  {
    id: "featured",
    name: "Featured",
    price: "$49",
    period: "per month",
    features: ["Everything in Free", "Featured badge & top placement", "Priority in search results", "Enhanced profile card", "GoHighLevel automation"],
    cta: "Get Featured",
    highlight: true,
  },
  {
    id: "sponsored",
    name: "Sponsored",
    price: "$99",
    period: "per month",
    features: ["Everything in Featured", "Sponsored badge", "Homepage placement", "Category page hero", "Dedicated account support"],
    cta: "Go Sponsored",
    highlight: false,
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
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [submitted, setSubmitted] = useState(false);
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
    plan: "free",
  });

  const submitMutation = trpc.submissions.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Listing submitted successfully!");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message || "Something went wrong. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate({
      businessName: form.businessName,
      contactName: form.contactName,
      email: form.email,
      phone: form.phone || undefined,
      website: form.website || undefined,
      address: form.address || undefined,
      description: form.description
        ? `[Plan: ${selectedPlan}] [Category: ${form.category}] [Area: ${form.area}] ${form.description}`
        : `[Plan: ${selectedPlan}] [Category: ${form.category}] [Area: ${form.area}]`,
    });
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  if (submitted) {
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
            <p className="text-[var(--color-muted-foreground)] mb-2 leading-relaxed">
              Thank you for submitting <strong>{form.businessName}</strong>. We'll review your listing and publish it within 1–2 business days.
            </p>
            {selectedPlan !== "free" && (
              <p className="text-sm text-[var(--color-ocean)] mb-6">
                Our team will reach out to set up your {selectedPlan} plan and GoHighLevel automation.
              </p>
            )}
            <a href="/directory" className="btn-ocean">
              Browse the Directory
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="bg-ocean-gradient pt-24 pb-10 text-white">
        <div className="container max-w-5xl">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-white/70" />
            <span className="text-sm text-white/70">Siesta Key Directory</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">Submit Your Business</h1>
          <p className="text-white/75 max-w-xl">
            Get your business in front of thousands of Siesta Key visitors and residents. Choose a plan that works for you.
          </p>
        </div>
      </div>

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
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`text-left rounded-2xl p-6 border-2 transition-all duration-200 ${
                    selectedPlan === plan.id
                      ? plan.highlight
                        ? "border-[var(--color-ocean)] bg-[var(--color-ocean-pale)] shadow-lg"
                        : "border-[var(--color-ocean)] bg-white shadow-lg"
                      : "border-[var(--color-border)] bg-white hover:border-[var(--color-ocean-light)]"
                  } ${plan.highlight ? "relative" : ""}`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="badge-featured flex items-center gap-1 px-3 py-1">
                        <Star className="w-3 h-3" /> Most Popular
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-serif font-bold text-lg text-[var(--color-charcoal)]">{plan.name}</div>
                    {selectedPlan === plan.id && (
                      <div className="w-5 h-5 rounded-full bg-[var(--color-ocean)] flex items-center justify-center">
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
                  Plan selected: <strong className="text-[var(--color-ocean)]">{PLANS.find((p) => p.id === selectedPlan)?.name}</strong>
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

              {/* Premium note */}
              {selectedPlan !== "free" && (
                <div className="bg-[var(--color-ocean-pale)] border border-[var(--color-ocean-light)] rounded-xl p-4 flex items-start gap-3">
                  <Crown className="w-5 h-5 text-[var(--color-ocean)] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-[var(--color-ocean-deep)] mb-1">
                      {selectedPlan === "featured" ? "Featured Plan Selected" : "Sponsored Plan Selected"}
                    </div>
                    <p className="text-xs text-[var(--color-muted-foreground)]">
                      After submission, our team will contact you to complete payment via GoHighLevel and activate your {selectedPlan} listing. You'll receive an automated onboarding email with next steps.
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitMutation.isPending}
                className="btn-ocean w-full justify-center py-3.5 text-base"
              >
                {submitMutation.isPending
                  ? "Submitting…"
                  : selectedPlan === "free"
                  ? "Submit Free Listing"
                  : `Submit & Get ${PLANS.find((p) => p.id === selectedPlan)?.name}`}
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
