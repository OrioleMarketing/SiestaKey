import { useState, useEffect, useRef } from "react";
import {
  CheckCircle, Crown, Building2, CreditCard, AlertCircle,
  Clock, Globe, Facebook, Instagram, Star, Video, Image, Plus, X, Upload
} from "lucide-react";
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
    name: "Sandy Shores",
    price: "$0",
    period: "forever",
    features: [
      "Business name, address & phone",
      "Website link",
      "Business category",
      "Business hours",
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
      "Everything in Sandy Shores",
      "Cover image & photo gallery (up to 5)",
      "Social media links",
      "Google Reviews widget",
      "Featured badge & top placement",
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
      "Photo gallery up to 10",
      "Video embed (YouTube / Vimeo)",
      "Sponsored badge & homepage spotlight",
      "Priority support",
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

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DAY_LABELS: Record<string, string> = {
  monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu",
  friday: "Fri", saturday: "Sat", sunday: "Sun",
};

// ── Upload helper ─────────────────────────────────────────────────────────────
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function SubmitListing() {
  const [selectedPlan, setSelectedPlan] = useState<"free" | "gulf_breeze" | "island_premier">("free");
  const [submitted, setSubmitted] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"success" | "cancelled" | null>(null);
  const [submittedName, setSubmittedName] = useState("");

  // Core fields
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

  // Hours (all tiers)
  const [hours, setHours] = useState<Record<string, string>>(
    Object.fromEntries(DAYS.map((d) => [d, ""]))
  );

  // Gulf Breeze+ fields
  const [socialLinks, setSocialLinks] = useState({ facebook: "", instagram: "", tripadvisor: "", yelp: "" });
  const [googleReviewEmbedCode, setGoogleReviewEmbedCode] = useState("");

  // Photo uploads
  const [coverPhotoFile, setCoverPhotoFile] = useState<File | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  // Island Premier fields
  const [videoEmbed, setVideoEmbed] = useState("");

  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const maxPhotos = selectedPlan === "island_premier" ? 10 : 5;

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

  const uploadPhotoMutation = trpc.dashboard.uploadPhoto.useMutation();

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

  const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverPhotoFile(file);
    setCoverPhotoPreview(URL.createObjectURL(file));
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = maxPhotos - galleryFiles.length;
    const toAdd = files.slice(0, remaining);
    setGalleryFiles((prev) => [...prev, ...toAdd]);
    setGalleryPreviews((prev) => [...prev, ...toAdd.map((f) => URL.createObjectURL(f))]);
  };

  const removeGalleryPhoto = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Upload photos to S3 first (if any)
    let coverPhotoUrl: string | undefined;
    let photoUrls: string[] = [];

    if (selectedPlan !== "free" && (coverPhotoFile || galleryFiles.length > 0)) {
      setUploadingPhotos(true);
      try {
        if (coverPhotoFile) {
          const base64 = await fileToBase64(coverPhotoFile);
          const result = await uploadPhotoMutation.mutateAsync({
            base64Data: base64,
            mimeType: coverPhotoFile.type as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
            fileName: coverPhotoFile.name,
          });
          coverPhotoUrl = result.url;
        }
        for (const file of galleryFiles) {
          const base64 = await fileToBase64(file);
          const result = await uploadPhotoMutation.mutateAsync({
            base64Data: base64,
            mimeType: file.type as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
            fileName: file.name,
          });
          photoUrls.push(result.url);
        }
      } catch {
        toast.error("Photo upload failed. Please try again.");
        setUploadingPhotos(false);
        return;
      }
      setUploadingPhotos(false);
    }

    // Build hours object — only include days with a value
    const hoursData = Object.fromEntries(
      Object.entries(hours).filter(([, v]) => v.trim() !== "")
    );

    // Build social links — only include non-empty
    const socialData = Object.fromEntries(
      Object.entries(socialLinks).filter(([, v]) => v.trim() !== "")
    );

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
      hours: Object.keys(hoursData).length > 0 ? hoursData : undefined,
      ...(selectedPlan !== "free" && {
        socialLinks: Object.keys(socialData).length > 0 ? socialData : undefined,
        coverPhoto: coverPhotoUrl,
        photos: photoUrls.length > 0 ? photoUrls : undefined,
        googleReviewEmbedCode: googleReviewEmbedCode || undefined,
      }),
      ...(selectedPlan === "island_premier" && {
        videoEmbed: videoEmbed || undefined,
      }),
    });

    setSubmittedName(form.businessName);

    if (selectedPlan === "free") {
      setSubmitted(true);
      toast.success("Listing submitted! We'll review and publish it within 1–2 business days.");
    } else {
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

  const isPending = submitMutation.isPending || checkoutMutation.isPending || uploadingPhotos;
  const selectedPlanData = PLANS.find((p) => p.id === selectedPlan)!;
  const isGulfBreezePlus = selectedPlan === "gulf_breeze" || selectedPlan === "island_premier";
  const isIslandPremier = selectedPlan === "island_premier";

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
            <h2 className="font-serif text-3xl font-bold text-[var(--color-charcoal)] mb-3">Payment Received!</h2>
            <p className="text-[var(--color-muted-foreground)] mb-2 leading-relaxed">
              Your listing is now under review. We'll activate your profile within 1–2 business days and send you a confirmation email.
            </p>
            <p className="text-sm text-[var(--color-ocean)] mb-6">
              If your submission is not approved, your payment will be fully refunded.
            </p>
            <a href="/directory" className="btn-ocean">Browse the Directory</a>
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
            <h2 className="font-serif text-3xl font-bold text-[var(--color-charcoal)] mb-3">Payment Cancelled</h2>
            <p className="text-[var(--color-muted-foreground)] mb-6 leading-relaxed">
              No charge was made. You can try again or choose the free listing option.
            </p>
            <button
              onClick={() => { setPaymentStatus(null); window.history.replaceState({}, "", "/submit-listing"); }}
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
            <h2 className="font-serif text-3xl font-bold text-[var(--color-charcoal)] mb-3">Listing Submitted!</h2>
            <p className="text-[var(--color-muted-foreground)] mb-6 leading-relaxed">
              Thank you for submitting <strong>{submittedName}</strong>. We'll review your listing and publish it within 1–2 business days.
            </p>
            <a href="/directory" className="btn-ocean">Browse the Directory</a>
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
            <h2 className="font-serif text-3xl font-bold text-[var(--color-charcoal)] mb-3">Redirecting to Payment…</h2>
            <p className="text-[var(--color-muted-foreground)] mb-2 leading-relaxed">
              Your listing for <strong>{submittedName}</strong> has been saved. Opening secure checkout for the <strong>{selectedPlanData.name}</strong> plan in a new tab.
            </p>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              If the checkout tab didn't open,{" "}
              <button
                className="text-[var(--color-ocean)] underline"
                onClick={() => checkoutMutation.mutate({
                  submissionId: 0,
                  tier: selectedPlan as "gulf_breeze" | "island_premier",
                  interval: "monthly",
                  contactName: form.contactName,
                  email: form.email,
                  origin: window.location.origin,
                })}
              >
                click here to retry
              </button>.
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
            <h2 className="font-serif text-2xl font-bold text-[var(--color-charcoal)] mb-6 text-center">Choose Your Plan</h2>
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
                      <span className="badge-featured flex items-center gap-1 px-3 py-1 text-xs whitespace-nowrap">★ Most Popular</span>
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
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-ocean-pale)] flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[var(--color-ocean)]" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-semibold text-[var(--color-charcoal)]">Business Information</h2>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  Plan: <strong className="text-[var(--color-ocean)]">{selectedPlanData.name}</strong>
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

              {/* ── Section 1: Core Info ─────────────────────────────────────── */}
              <section>
                <h3 className="text-sm font-semibold text-[var(--color-charcoal)] uppercase tracking-wide mb-4 pb-2 border-b border-[var(--color-border)]">
                  Basic Details
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">
                        Business Name <span className="text-red-500">*</span>
                      </label>
                      <input type="text" required value={form.businessName} onChange={update("businessName")}
                        placeholder="Your business name" className="search-input" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select required value={form.category} onChange={update("category")} className="search-input">
                        <option value="">Select a category</option>
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">
                        Contact Name <span className="text-red-500">*</span>
                      </label>
                      <input type="text" required value={form.contactName} onChange={update("contactName")}
                        placeholder="Your name" className="search-input" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input type="email" required value={form.email} onChange={update("email")}
                        placeholder="you@business.com" className="search-input" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">Phone</label>
                      <input type="tel" value={form.phone} onChange={update("phone")}
                        placeholder="(941) 555-0000" className="search-input" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">Website</label>
                      <input type="url" value={form.website} onChange={update("website")}
                        placeholder="https://yourbusiness.com" className="search-input" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">Address</label>
                      <input type="text" value={form.address} onChange={update("address")}
                        placeholder="123 Ocean Blvd, Siesta Key, FL" className="search-input" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">Area</label>
                      <select value={form.area} onChange={update("area")} className="search-input">
                        <option value="">Select area</option>
                        {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5">Business Description</label>
                    <textarea value={form.description} onChange={update("description")}
                      placeholder="Describe your business, what makes it special, and what customers can expect…"
                      rows={4} className="search-input resize-none" />
                  </div>
                </div>
              </section>

              {/* ── Section 2: Business Hours (all tiers) ───────────────────── */}
              <section>
                <h3 className="text-sm font-semibold text-[var(--color-charcoal)] uppercase tracking-wide mb-4 pb-2 border-b border-[var(--color-border)] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[var(--color-ocean)]" /> Business Hours
                </h3>
                <p className="text-xs text-[var(--color-muted-foreground)] mb-4">
                  Enter hours for each day (e.g. "9am – 5pm" or "Closed"). Leave blank to omit a day.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {DAYS.map((day) => (
                    <div key={day}>
                      <label className="block text-xs font-medium text-[var(--color-charcoal)] mb-1 capitalize">
                        {DAY_LABELS[day]}
                      </label>
                      <input
                        type="text"
                        value={hours[day]}
                        onChange={(e) => setHours((h) => ({ ...h, [day]: e.target.value }))}
                        placeholder="9am – 5pm"
                        className="search-input text-sm py-2"
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* ── Section 3: Gulf Breeze+ fields ──────────────────────────── */}
              {isGulfBreezePlus && (
                <>
                  {/* Cover Image */}
                  <section>
                    <h3 className="text-sm font-semibold text-[var(--color-charcoal)] uppercase tracking-wide mb-4 pb-2 border-b border-[var(--color-border)] flex items-center gap-2">
                      <Image className="w-4 h-4 text-[var(--color-ocean)]" /> Cover Image
                    </h3>
                    <p className="text-xs text-[var(--color-muted-foreground)] mb-4">
                      Upload a high-quality image that represents your business. This will be the main photo shown in search results.
                    </p>
                    <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverPhotoChange} />
                    {coverPhotoPreview ? (
                      <div className="relative w-full max-w-sm">
                        <img src={coverPhotoPreview} alt="Cover preview" className="w-full h-48 object-cover rounded-xl border border-[var(--color-border)]" />
                        <button
                          type="button"
                          onClick={() => { setCoverPhotoFile(null); setCoverPhotoPreview(null); }}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-red-50"
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => coverInputRef.current?.click()}
                        className="flex items-center gap-3 px-5 py-3 rounded-xl border-2 border-dashed border-[var(--color-ocean-light)] text-[var(--color-ocean)] hover:bg-[var(--color-ocean-pale)] transition-colors text-sm font-medium"
                      >
                        <Upload className="w-4 h-4" /> Upload Cover Image
                      </button>
                    )}
                  </section>

                  {/* Photo Gallery */}
                  <section>
                    <h3 className="text-sm font-semibold text-[var(--color-charcoal)] uppercase tracking-wide mb-4 pb-2 border-b border-[var(--color-border)] flex items-center gap-2">
                      <Image className="w-4 h-4 text-[var(--color-ocean)]" /> Photo Gallery
                      <span className="text-xs font-normal text-[var(--color-muted-foreground)] normal-case ml-1">
                        ({galleryFiles.length}/{maxPhotos} photos)
                      </span>
                    </h3>
                    <p className="text-xs text-[var(--color-muted-foreground)] mb-4">
                      Add up to {maxPhotos} photos showcasing your business, products, or atmosphere.
                    </p>
                    <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryChange} />
                    <div className="flex flex-wrap gap-3">
                      {galleryPreviews.map((src, i) => (
                        <div key={i} className="relative w-24 h-24">
                          <img src={src} alt={`Gallery ${i + 1}`} className="w-24 h-24 object-cover rounded-lg border border-[var(--color-border)]" />
                          <button
                            type="button"
                            onClick={() => removeGalleryPhoto(i)}
                            className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white shadow flex items-center justify-center hover:bg-red-50"
                          >
                            <X className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        </div>
                      ))}
                      {galleryFiles.length < maxPhotos && (
                        <button
                          type="button"
                          onClick={() => galleryInputRef.current?.click()}
                          className="w-24 h-24 rounded-lg border-2 border-dashed border-[var(--color-ocean-light)] flex flex-col items-center justify-center gap-1 text-[var(--color-ocean)] hover:bg-[var(--color-ocean-pale)] transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                          <span className="text-xs">Add Photo</span>
                        </button>
                      )}
                    </div>
                  </section>

                  {/* Social Media Links */}
                  <section>
                    <h3 className="text-sm font-semibold text-[var(--color-charcoal)] uppercase tracking-wide mb-4 pb-2 border-b border-[var(--color-border)] flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[var(--color-ocean)]" /> Social Media Links
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5 flex items-center gap-1.5">
                          <Facebook className="w-4 h-4 text-blue-600" /> Facebook
                        </label>
                        <input type="url" value={socialLinks.facebook}
                          onChange={(e) => setSocialLinks((s) => ({ ...s, facebook: e.target.value }))}
                          placeholder="https://facebook.com/yourbusiness" className="search-input" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5 flex items-center gap-1.5">
                          <Instagram className="w-4 h-4 text-pink-500" /> Instagram
                        </label>
                        <input type="url" value={socialLinks.instagram}
                          onChange={(e) => setSocialLinks((s) => ({ ...s, instagram: e.target.value }))}
                          placeholder="https://instagram.com/yourbusiness" className="search-input" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5 flex items-center gap-1.5">
                          <Star className="w-4 h-4 text-green-600" /> TripAdvisor
                        </label>
                        <input type="url" value={socialLinks.tripadvisor}
                          onChange={(e) => setSocialLinks((s) => ({ ...s, tripadvisor: e.target.value }))}
                          placeholder="https://tripadvisor.com/…" className="search-input" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1.5 flex items-center gap-1.5">
                          <Star className="w-4 h-4 text-red-500" /> Yelp
                        </label>
                        <input type="url" value={socialLinks.yelp}
                          onChange={(e) => setSocialLinks((s) => ({ ...s, yelp: e.target.value }))}
                          placeholder="https://yelp.com/biz/…" className="search-input" />
                      </div>
                    </div>
                  </section>

                  {/* Google Review Embed */}
                  <section>
                    <h3 className="text-sm font-semibold text-[var(--color-charcoal)] uppercase tracking-wide mb-4 pb-2 border-b border-[var(--color-border)] flex items-center gap-2">
                      <Star className="w-4 h-4 text-[var(--color-ocean)]" /> Google Reviews Widget
                    </h3>
                    <p className="text-xs text-[var(--color-muted-foreground)] mb-3">
                      Paste your Google Reviews embed code here (optional). You can add or update this later from your dashboard.
                    </p>
                    <textarea
                      value={googleReviewEmbedCode}
                      onChange={(e) => setGoogleReviewEmbedCode(e.target.value)}
                      placeholder='<script src="https://…" async defer></script>'
                      rows={3}
                      className="search-input resize-none font-mono text-xs"
                    />
                  </section>
                </>
              )}

              {/* ── Section 4: Island Premier only ──────────────────────────── */}
              {isIslandPremier && (
                <section>
                  <h3 className="text-sm font-semibold text-[var(--color-charcoal)] uppercase tracking-wide mb-4 pb-2 border-b border-[var(--color-border)] flex items-center gap-2">
                    <Video className="w-4 h-4 text-[var(--color-coral)]" /> Video Embed
                    <span className="text-xs font-normal text-[var(--color-coral)] normal-case ml-1">Island Premier</span>
                  </h3>
                  <p className="text-xs text-[var(--color-muted-foreground)] mb-3">
                    Add a YouTube or Vimeo video URL to showcase your business (optional).
                  </p>
                  <input
                    type="url"
                    value={videoEmbed}
                    onChange={(e) => setVideoEmbed(e.target.value)}
                    placeholder="https://youtube.com/watch?v=… or https://vimeo.com/…"
                    className="search-input"
                  />
                </section>
              )}

              {/* ── Payment note for paid tiers ──────────────────────────────── */}
              {selectedPlan !== "free" && (
                <div className="bg-[var(--color-ocean-pale)] border border-[var(--color-ocean-light)] rounded-xl p-4 flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-[var(--color-ocean)] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-[var(--color-ocean-deep)] mb-1">Secure Payment via Stripe</div>
                    <p className="text-xs text-[var(--color-muted-foreground)]">
                      After submitting your details, you'll be redirected to a secure Stripe checkout page to complete payment for the{" "}
                      <strong>{selectedPlanData.name}</strong> plan ({selectedPlanData.price}/mo). If your listing is not approved, your payment will be fully refunded.
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
                  ? uploadingPhotos ? "Uploading photos…"
                    : selectedPlan === "free" ? "Submitting…" : "Preparing checkout…"
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
