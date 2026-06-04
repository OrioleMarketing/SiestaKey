import { useState, useEffect } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import {
  Crown,
  Star,
  Waves,
  Building2,
  Phone,
  Globe,
  Mail,
  MapPin,
  Clock,
  Share2,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  LogIn,
  ExternalLink,
  ImagePlus,
  Trash2,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { useRef } from "react";

const PLAN_CONFIG = {
  free: {
    name: "Sandy Shores",
    label: "Free",
    color: "bg-slate-100 text-slate-700",
    icon: Waves,
    description: "Basic listing in the directory",
  },
  gulf_breeze: {
    name: "Gulf Breeze",
    label: "Gulf Breeze",
    color: "bg-sky-100 text-sky-700",
    icon: Star,
    description: "Featured listing with full profile",
  },
  island_premier: {
    name: "Island Premier",
    label: "Island Premier",
    color: "bg-amber-100 text-amber-700",
    icon: Crown,
    description: "Premium placement + AI Search Audit",
  },
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();

  const { data: profile, isLoading: profileLoading } = trpc.dashboard.getMyProfile.useQuery(
    undefined,
    { enabled: !!user }
  );

  const { data: listing, isLoading: listingLoading, refetch } = trpc.dashboard.getMyListing.useQuery(
    undefined,
    { enabled: !!user }
  );

  const uploadPhotoMutation = trpc.dashboard.uploadPhoto.useMutation({
    onSuccess: () => {
      toast.success("Photo uploaded!");
      refetch();
    },
    onError: (err) => toast.error(err.message || "Upload failed."),
  });

  const removePhotoMutation = trpc.dashboard.removePhoto.useMutation({
    onSuccess: () => {
      toast.success("Photo removed.");
      refetch();
    },
    onError: (err) => toast.error(err.message || "Remove failed."),
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmRemoveUrl, setConfirmRemoveUrl] = useState<string | null>(null);

  const handleConfirmRemove = () => {
    if (!confirmRemoveUrl) return;
    removePhotoMutation.mutate({ photoUrl: confirmRemoveUrl });
    setConfirmRemoveUrl(null);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // Strip the data URI prefix to get raw base64
      const base64Data = dataUrl.split(",")[1];
      if (!base64Data) return;
      uploadPhotoMutation.mutate({
        base64Data,
        mimeType: file.type as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
        fileName: file.name,
      });
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const updateMutation = trpc.dashboard.updateMyListing.useMutation({
    onSuccess: () => {
      toast.success("Listing updated successfully!");
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update listing.");
    },
  });

  // Form state
  const [form, setForm] = useState({
    name: "",
    shortDescription: "",
    description: "",
    phone: "",
    website: "",
    email: "",
    address: "",
    area: "",
    lat: "",
    lng: "",
  });
  const [hours, setHours] = useState<Record<string, string>>({});
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [googleReviewEmbedCode, setGoogleReviewEmbedCode] = useState("");

  // Populate form when listing loads
  useEffect(() => {
    if (listing) {
      setForm({
        name: listing.name ?? "",
        shortDescription: listing.shortDescription ?? "",
        description: listing.description ?? "",
        phone: listing.phone ?? "",
        website: listing.website ?? "",
        email: listing.email ?? "",
        address: listing.address ?? "",
        area: listing.area ?? "",
        lat: listing.lat ?? "",
        lng: listing.lng ?? "",
      });
      setHours((listing.hours as Record<string, string>) ?? {});
      setSocialLinks((listing.socialLinks as Record<string, string>) ?? {});
      setGoogleReviewEmbedCode(listing.googleReviewEmbedCode ?? "");
    }
  }, [listing]);

  const handleSave = () => {
    updateMutation.mutate({
      ...form,
      hours,
      socialLinks,
      googleReviewEmbedCode: googleReviewEmbedCode || null,
    });
  };

  // Auth gate
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6 px-4">
        <SEO title="My Dashboard — Shop in Siesta Key" description="Log in to manage your business listing." />
        <div className="text-center">
          <LogIn className="h-12 w-12 text-sky-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign In to Access Your Dashboard</h1>
          <p className="text-gray-500 mb-6">Manage your business listing and subscription plan.</p>
          <Button asChild size="lg" className="bg-sky-600 hover:bg-sky-700 text-white">
            <a href={getLoginUrl()}>
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </a>
          </Button>
        </div>
      </div>
    );
  }

  const planKey = (profile?.plan ?? "free") as keyof typeof PLAN_CONFIG;
  const planInfo = PLAN_CONFIG[planKey] ?? PLAN_CONFIG.free;
  const PlanIcon = planInfo.icon;
  const isLoading = profileLoading || listingLoading;

  return (
    <>
      <SEO
        title="My Dashboard — Shop in Siesta Key"
        description="Manage your business listing and subscription plan."
        noIndex
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-[#0a2342] text-white py-10 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-1">
              <Building2 className="h-6 w-6 text-sky-300" />
              <span className="text-sky-300 text-sm font-medium uppercase tracking-wide">Business Dashboard</span>
            </div>
            <h1 className="text-3xl font-bold">
              Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""}!
            </h1>
            <p className="text-sky-200 mt-1">Manage your listing and subscription from here.</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

          {/* Plan Status Card */}
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-sky-600 to-teal-600 p-1" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-amber-50">
                    <PlanIcon className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Your Plan</CardTitle>
                    <CardDescription>{planInfo.description}</CardDescription>
                  </div>
                </div>
                {isLoading ? (
                  <Skeleton className="h-7 w-28" />
                ) : (
                  <Badge className={`text-sm px-3 py-1 ${planInfo.color}`}>
                    {planInfo.name}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 items-center">
                {planKey === "free" && (
                  <div className="flex-1 min-w-[200px] bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-amber-800 mb-2">
                      Upgrade for more visibility
                    </p>
                    <p className="text-xs text-amber-700 mb-3">
                      Get a featured listing, photo gallery, social links, and top search placement.
                    </p>
                    <Button asChild size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                      <Link href="/pricing">
                        <Crown className="h-3.5 w-3.5 mr-1.5" />
                        View Plans
                        <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                      </Link>
                    </Button>
                  </div>
                )}
                {planKey === "gulf_breeze" && (
                  <div className="flex-1 min-w-[200px] bg-sky-50 border border-sky-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-sky-800 mb-2">
                      Upgrade to Island Premier
                    </p>
                    <p className="text-xs text-sky-700 mb-3">
                      Get homepage spotlight, sponsored badge, and a free AI Search Audit ($299 value).
                    </p>
                    <Button asChild size="sm" className="bg-sky-600 hover:bg-sky-700 text-white">
                      <Link href="/pricing">
                        <Crown className="h-3.5 w-3.5 mr-1.5" />
                        Upgrade Now
                        <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                      </Link>
                    </Button>
                  </div>
                )}
                {planKey === "island_premier" && (
                  <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span className="text-sm font-medium">You're on our top plan — thank you!</span>
                  </div>
                )}
                {listing && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/business/${listing.slug}`}>
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                      View My Listing
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Listing Edit Form */}
          {isLoading ? (
            <Card className="border-0 shadow-md">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
              </CardContent>
            </Card>
          ) : !listing ? (
            <Card className="border-0 shadow-md">
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-10 w-10 text-amber-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Claimed Listing Found</h3>
                <p className="text-gray-500 text-sm mb-5">
                  Your account isn't linked to a business listing yet. Claim your business or submit a new listing.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button asChild className="bg-sky-600 hover:bg-sky-700 text-white">
                    <Link href="/claim">Claim Your Business</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/submit-listing">Add New Listing</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-sky-600" />
                  Edit Your Business Listing
                </CardTitle>
                <CardDescription>
                  Changes are saved immediately and reflected on your public profile.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">

                {/* Basic Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Business Name</Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Your business name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="area">Area / Neighborhood</Label>
                      <Input
                        id="area"
                        value={form.area}
                        onChange={(e) => setForm({ ...form, area: e.target.value })}
                        placeholder="e.g. Siesta Village"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <Label htmlFor="shortDescription">Short Description (shown in directory cards)</Label>
                      <Input
                        id="shortDescription"
                        value={form.shortDescription}
                        onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                        placeholder="One-line summary of your business"
                        maxLength={300}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <Label htmlFor="description">Full Description</Label>
                      <Textarea
                        id="description"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Tell visitors about your business, history, offerings..."
                        rows={5}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Contact Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-sky-500" /> Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+1 (941) 555-0000"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="info@yourbusiness.com"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={form.website}
                        onChange={(e) => setForm({ ...form, website: e.target.value })}
                        placeholder="https://yourbusiness.com"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        placeholder="123 Ocean Blvd, Siesta Key, FL 34242"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Hours */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-sky-500" /> Hours of Operation
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {DAYS.map((day) => (
                      <div key={day} className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 w-24 shrink-0">{day}</span>
                        <Input
                          value={hours[day] ?? ""}
                          onChange={(e) => setHours({ ...hours, [day]: e.target.value })}
                          placeholder="e.g. 9am – 5pm or Closed"
                          className="text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Social Links */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-sky-500" /> Social Media Links
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {["facebook", "instagram", "twitter", "yelp", "tripadvisor"].map((platform) => (
                      <div key={platform} className="space-y-1.5">
                        <Label htmlFor={platform} className="capitalize">{platform}</Label>
                        <Input
                          id={platform}
                          value={socialLinks[platform] ?? ""}
                          onChange={(e) =>
                            setSocialLinks({ ...socialLinks, [platform]: e.target.value })
                          }
                          placeholder={`https://${platform}.com/yourbusiness`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Map Coordinates */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-sky-500" /> Map Coordinates (optional)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="lat">Latitude</Label>
                      <Input
                        id="lat"
                        value={form.lat}
                        onChange={(e) => setForm({ ...form, lat: e.target.value })}
                        placeholder="27.2683"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lng">Longitude</Label>
                      <Input
                        id="lng"
                        value={form.lng}
                        onChange={(e) => setForm({ ...form, lng: e.target.value })}
                        placeholder="-82.5454"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Photo Gallery */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <ImagePlus className="h-4 w-4 text-sky-500" /> Photo Gallery
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Upload up to 10 photos (JPEG, PNG, WebP — max 10MB each). Photos appear on your public business profile.
                  </p>

                  {/* Existing photos */}
                  {Array.isArray(listing.photos) && (listing.photos as string[]).length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                      {(listing.photos as string[]).map((url, idx) => (
                        <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square bg-gray-100">
                          <img
                            src={url}
                            alt={`Business photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => setConfirmRemoveUrl(url)}
                            disabled={removePhotoMutation.isPending}
                            className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-700 disabled:opacity-50"
                            title="Remove photo"
                          >
                            {removePhotoMutation.isPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center mb-4">
                      <ImagePlus className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">No photos yet — add your first one below.</p>
                    </div>
                  )}

                  {/* Upload button */}
                  {(!Array.isArray(listing.photos) || (listing.photos as string[]).length < 10) && (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadPhotoMutation.isPending}
                        className="border-sky-300 text-sky-700 hover:bg-sky-50"
                      >
                        {uploadPhotoMutation.isPending ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...</>
                        ) : (
                          <><ImagePlus className="h-4 w-4 mr-2" /> Add Photo</>
                        )}
                      </Button>
                    </>
                  )}
                </div>

                {/* Google Review Embed — Gulf Breeze & Island Premier only */}
                {(planKey === "gulf_breeze" || planKey === "island_premier") && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-sky-500" /> Google Reviews Widget
                      </h3>
                      <p className="text-xs text-gray-500 mb-3">
                        Paste your Google Review widget embed code below. It will appear on your public business profile page. Supported providers: Elfsight, EmbedSocial, Google Places widget, or any custom HTML snippet.
                      </p>
                      <Textarea
                        id="googleReviewEmbedCode"
                        value={googleReviewEmbedCode}
                        onChange={(e) => setGoogleReviewEmbedCode(e.target.value)}
                        placeholder={`Paste your Google Review widget embed code here...\n\nExample:\n<script src="https://..." async defer></script>\n<div class="google-reviews-widget" data-place-id="..."></div>`}
                        rows={6}
                        className="font-mono text-xs"
                      />
                      {googleReviewEmbedCode && (
                        <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                          <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                          Embed code saved — visible on your public profile.
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Save Button */}
                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="bg-sky-600 hover:bg-sky-700 text-white px-8"
                  >
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>

              </CardContent>
            </Card>
          )}

        </div>
      </div>

      {/* Photo removal confirmation dialog */}
      <AlertDialog open={!!confirmRemoveUrl} onOpenChange={(open) => !open && setConfirmRemoveUrl(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this photo?</AlertDialogTitle>
            <AlertDialogDescription>
              This photo will be permanently removed from your listing. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRemove}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Remove Photo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
