import { useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle, MapPin, Shield, Zap, BarChart3, Crown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";

const BENEFITS = [
  { icon: <Shield className="w-5 h-5" />, title: "Verified Badge", desc: "Show customers your listing is verified and up to date." },
  { icon: <Zap className="w-5 h-5" />, title: "Instant Updates", desc: "Edit your hours, photos, and description anytime." },
  { icon: <BarChart3 className="w-5 h-5" />, title: "Analytics", desc: "See how many people view and click your listing." },
  { icon: <Crown className="w-5 h-5" />, title: "Premium Options", desc: "Unlock featured placement and sponsored spots." },
];

export default function ClaimBusiness() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const prefillBusiness = searchParams.get("business") ?? "";
  const prefillId = searchParams.get("id") ? parseInt(searchParams.get("id")!) : undefined;

  const [form, setForm] = useState({
    businessName: prefillBusiness,
    contactName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const claimMutation = trpc.claims.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Claim submitted! We'll be in touch shortly.");
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    claimMutation.mutate({
      businessId: prefillId,
      businessName: form.businessName,
      contactName: form.contactName,
      email: form.email,
      phone: form.phone || undefined,
      message: form.message || undefined,
    });
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
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
              Claim Submitted!
            </h2>
            <p className="text-[var(--color-muted-foreground)] mb-6 leading-relaxed">
              Thank you! We've received your claim for <strong>{form.businessName}</strong>. Our team will review your request and reach out to <strong>{form.email}</strong> within 1–2 business days.
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="bg-ocean-gradient pt-24 pb-10 text-white">
        <div className="container max-w-4xl">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-white/70" />
            <span className="text-sm text-white/70">Siesta Key Directory</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">Claim Your Business</h1>
          <p className="text-white/75 max-w-xl">
            Take control of your listing, keep your information accurate, and connect with more customers on Siesta Key.
          </p>
        </div>
      </div>

      <main className="flex-1 py-12 bg-[var(--color-white-sand)]">
        <div className="container max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Benefits sidebar */}
            <div className="lg:col-span-2">
              <h2 className="font-serif text-xl font-semibold text-[var(--color-charcoal)] mb-5">
                Why Claim Your Listing?
              </h2>
              <div className="space-y-4">
                {BENEFITS.map((b) => (
                  <div key={b.title} className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm">
                    <div className="w-9 h-9 rounded-lg bg-[var(--color-ocean-pale)] flex items-center justify-center text-[var(--color-ocean)] shrink-0">
                      {b.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-[var(--color-charcoal)]">{b.title}</div>
                      <div className="text-xs text-[var(--color-muted-foreground)] mt-0.5">{b.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Premium upgrade teaser */}
              <div className="premium-banner mt-6">
                <div className="relative z-10">
                  <Crown className="w-6 h-6 text-[var(--color-gold)] mb-2" />
                  <h3 className="font-serif font-bold text-lg mb-1">Go Premium</h3>
                  <p className="text-sm text-white/75 mb-3">
                    After claiming, upgrade to a featured listing for top placement in search results.
                  </p>
                  <a
                    href={import.meta.env.VITE_GHL_PAYMENT_LINK ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-gold)] hover:text-white transition-colors"
                  >
                    Learn about Premium →
                  </a>
                </div>
              </div>
            </div>

            {/* Claim form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
                <h2 className="font-serif text-xl font-semibold text-[var(--color-charcoal)] mb-6">
                  Submit Your Claim
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.contactName}
                        onChange={update("contactName")}
                        placeholder="First and last name"
                        className="search-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={update("phone")}
                        placeholder="(941) 555-0000"
                        className="search-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={update("email")}
                      placeholder="you@yourbusiness.com"
                      className="search-input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">
                      Message (optional)
                    </label>
                    <textarea
                      value={form.message}
                      onChange={update("message")}
                      placeholder="Tell us anything relevant about your claim…"
                      rows={3}
                      className="search-input resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={claimMutation.isPending}
                    className="btn-coral w-full justify-center py-3 text-base"
                  >
                    {claimMutation.isPending ? "Submitting…" : "Submit Claim"}
                  </button>

                  <p className="text-xs text-center text-[var(--color-muted-foreground)]">
                    By submitting, you agree to our terms of service. We'll verify your ownership and respond within 1–2 business days.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
