import { useAuth } from "@/_core/hooks/useAuth";
import type { Business } from "../../../drizzle/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import {
  AlertCircle,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FileSpreadsheet,
  Lock,
  LogIn,
  Megaphone,
  MessageSquare,
  Pencil,
  Plus,
  Star,
  Trash2,
  Upload,
  Users,
  XCircle,
} from "lucide-react";
import { CsvImportTab } from "./AdminCsvImport";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import PageHero from "@/components/PageHero";

// ─── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | undefined;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card className="card-coastal">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{label}</p>
            <div className="text-3xl font-bold mt-1 text-foreground">
              {value ?? <Skeleton className="h-8 w-12" />}
            </div>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Tier Badge ─────────────────────────────────────────────────────────────────
function TierBadge({ tier }: { tier: string }) {
  const map: Record<string, { label: string; className: string }> = {
    sponsored: { label: "Sponsored", className: "bg-amber-100 text-amber-800 border-amber-200" },
    featured:  { label: "Featured",  className: "bg-ocean-pale text-ocean border-ocean-light" },
    free:      { label: "Free",      className: "bg-gray-100 text-gray-600 border-gray-200" },
  };
  const { label, className } = map[tier] ?? map.free;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${className}`}>
      {label}
    </span>
  );
}

// ─── Status Badge ───────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string; icon: React.ElementType }> = {
    pending:  { label: "Pending",  className: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: AlertCircle },
    approved: { label: "Approved", className: "bg-green-100 text-green-800 border-green-200",   icon: CheckCircle2 },
    rejected: { label: "Rejected", className: "bg-red-100 text-red-800 border-red-200",         icon: XCircle },
  };
  const { label, className, icon: Icon } = map[status] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

// ─── Add Listing Dialog ─────────────────────────────────────────────────────────
const ADMIN_CATEGORIES = [
  { id: 1, name: "Dining" },
  { id: 2, name: "Shopping" },
  { id: 3, name: "Activities" },
  { id: 4, name: "Services" },
  { id: 5, name: "Nightlife" },
  { id: 6, name: "Wellness" },
  { id: 7, name: "Accommodations" },
  { id: 8, name: "Real Estate" },
];

const ADMIN_AREAS = [
  "Siesta Key Village",
  "Crescent Beach",
  "Midnight Pass",
];

function AddListingDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    name: "",
    categoryId: 1,
    area: "Siesta Key Village",
    address: "",
    phone: "",
    website: "",
    email: "",
    shortDescription: "",
    description: "",
  });

  const createBusiness = trpc.admin.createBusiness.useMutation({
    onSuccess: () => {
      toast.success("Listing created successfully");
      onCreated();
      onClose();
      setForm({ name: "", categoryId: 1, area: "Siesta Key Village", address: "", phone: "", website: "", email: "", shortDescription: "", description: "" });
    },
    onError: (e) => toast.error(`Failed to create listing: ${e.message}`),
  });

  const set = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg">Add New Listing</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="al-name">Business Name *</Label>
            <Input id="al-name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Siesta Key Oyster Bar" className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="al-cat">Category *</Label>
              <Select value={String(form.categoryId)} onValueChange={(v) => set("categoryId", Number(v))}>
                <SelectTrigger id="al-cat" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ADMIN_CATEGORIES.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="al-area">Area</Label>
              <Select value={form.area} onValueChange={(v) => set("area", v)}>
                <SelectTrigger id="al-area" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ADMIN_AREAS.map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="al-addr">Address</Label>
            <Input id="al-addr" value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="123 Ocean Blvd, Siesta Key, FL" className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="al-phone">Phone</Label>
              <Input id="al-phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="(941) 555-0000" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="al-email">Email</Label>
              <Input id="al-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="info@business.com" className="mt-1" />
            </div>
          </div>
          <div>
            <Label htmlFor="al-web">Website</Label>
            <Input id="al-web" value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="al-short">Short Description</Label>
            <Input id="al-short" value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} placeholder="One-line summary (max 300 chars)" maxLength={300} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="al-desc">Full Description</Label>
            <Textarea id="al-desc" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Detailed description..." rows={4} className="mt-1" />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={createBusiness.isPending}>Cancel</Button>
          <Button
            className="btn-ocean"
            onClick={() => createBusiness.mutate({ ...form, categoryId: Number(form.categoryId) })}
            disabled={!form.name.trim() || createBusiness.isPending}
          >
            {createBusiness.isPending ? "Creating…" : "Create Listing"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Businesses Tab ─────────────────────────────────────────────────────────────
type BusinessRow = Business;

const DAYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

function EditListingDialog({ biz, onClose, onSaved }: { biz: BusinessRow; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: biz.name ?? "",
    slug: biz.slug ?? "",
    categoryId: biz.categoryId ?? 1,
    shortDescription: biz.shortDescription ?? "",
    description: biz.description ?? "",
    address: biz.address ?? "",
    area: biz.area ?? "Siesta Key Village",
    phone: biz.phone ?? "",
    website: biz.website ?? "",
    email: biz.email ?? "",
    lat: biz.lat ?? "",
    lng: biz.lng ?? "",
    rating: biz.rating ?? "4.5",
    reviewCount: biz.reviewCount ?? 0,
    tags: (biz.tags ?? []).join(", "),
    hours: DAYS.reduce((acc, d) => ({ ...acc, [d]: (biz.hours as Record<string,string>)?.[d] ?? "" }), {} as Record<string,string>),
    socialLinks: {
      facebook: (biz.socialLinks as Record<string,string>)?.facebook ?? "",
      instagram: (biz.socialLinks as Record<string,string>)?.instagram ?? "",
      twitter: (biz.socialLinks as Record<string,string>)?.twitter ?? "",
      yelp: (biz.socialLinks as Record<string,string>)?.yelp ?? "",
      tripadvisor: (biz.socialLinks as Record<string,string>)?.tripadvisor ?? "",
    },
    googleReviewEmbedCode: biz.googleReviewEmbedCode ?? "",
    videoEmbed: biz.videoEmbed ?? "",
    coverPhoto: (biz as any).coverPhoto ?? "",
  });

  const updateBusiness = trpc.admin.updateBusiness.useMutation({
    onSuccess: () => { toast.success("Listing saved"); onSaved(); onClose(); },
    onError: () => toast.error("Save failed"),
  });

  const set = (field: string, value: unknown) => setForm(f => ({ ...f, [field]: value }));
  const setHour = (day: string, val: string) => setForm(f => ({ ...f, hours: { ...f.hours, [day]: val } }));
  const setSocial = (key: string, val: string) => setForm(f => ({ ...f, socialLinks: { ...f.socialLinks, [key]: val } }));

  const photos = Array.isArray((biz as any).photos) ? (biz as any).photos as string[] : [];

  const handleSave = () => {
    const hours: Record<string,string> = {};
    for (const d of DAYS) { if (form.hours[d]) hours[d] = form.hours[d]; }
    const socialLinks: Record<string,string> = {};
    for (const [k,v] of Object.entries(form.socialLinks)) { if (v) socialLinks[k] = v; }
    const tags = form.tags.split(",").map((t: string) => t.trim()).filter(Boolean);
    updateBusiness.mutate({
      id: biz.id,
      name: form.name || undefined,
      slug: form.slug || undefined,
      categoryId: form.categoryId,
      shortDescription: form.shortDescription || null,
      description: form.description || null,
      address: form.address || null,
      area: form.area || null,
      phone: form.phone || null,
      website: form.website || null,
      email: form.email || null,
      lat: form.lat || null,
      lng: form.lng || null,
      rating: form.rating || null,
      reviewCount: form.reviewCount || 0,
      tags,
      hours: Object.keys(hours).length ? hours : null,
      socialLinks: Object.keys(socialLinks).length ? socialLinks : null,
      googleReviewEmbedCode: form.googleReviewEmbedCode || null,
      videoEmbed: form.videoEmbed || null,
      coverPhoto: form.coverPhoto || null,
    });
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg">Edit Listing — {biz.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2">
          {/* Core */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Business Name</Label>
              <Input value={form.name} onChange={e => set("name", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>URL Slug</Label>
              <Input value={form.slug} onChange={e => set("slug", e.target.value)} className="mt-1 font-mono text-xs" />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={String(form.categoryId)} onValueChange={v => set("categoryId", Number(v))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ADMIN_CATEGORIES.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Area</Label>
              <Select value={form.area} onValueChange={v => set("area", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ADMIN_AREAS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={e => set("phone", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => set("email", e.target.value)} className="mt-1" />
            </div>
            <div className="col-span-2">
              <Label>Website</Label>
              <Input value={form.website} onChange={e => set("website", e.target.value)} className="mt-1" placeholder="https://" />
            </div>
            <div className="col-span-2">
              <Label>Address</Label>
              <Input value={form.address} onChange={e => set("address", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Latitude</Label>
              <Input value={form.lat} onChange={e => set("lat", e.target.value)} className="mt-1 font-mono text-xs" />
            </div>
            <div>
              <Label>Longitude</Label>
              <Input value={form.lng} onChange={e => set("lng", e.target.value)} className="mt-1 font-mono text-xs" />
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-3">
            <div>
              <Label>Short Description <span className="text-muted-foreground text-xs">(max 300 chars)</span></Label>
              <Input value={form.shortDescription} onChange={e => set("shortDescription", e.target.value)} maxLength={300} className="mt-1" />
            </div>
            <div>
              <Label>Full Description</Label>
              <Textarea value={form.description} onChange={e => set("description", e.target.value)} rows={4} className="mt-1" />
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags <span className="text-muted-foreground text-xs">(comma-separated)</span></Label>
            <Input value={form.tags} onChange={e => set("tags", e.target.value)} className="mt-1" placeholder="beach, family-friendly, outdoor" />
          </div>

          {/* Hours */}
          <div>
            <Label className="mb-2 block">Hours of Operation</Label>
            <div className="grid grid-cols-2 gap-2">
              {DAYS.map(d => (
                <div key={d} className="flex items-center gap-2">
                  <span className="w-24 text-xs capitalize text-muted-foreground">{d}</span>
                  <Input
                    value={form.hours[d]}
                    onChange={e => setHour(d, e.target.value)}
                    placeholder="9am–5pm or Closed"
                    className="h-7 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div>
            <Label className="mb-2 block">Social Links</Label>
            <div className="grid grid-cols-2 gap-2">
              {["facebook","instagram","twitter","yelp","tripadvisor"].map(k => (
                <div key={k}>
                  <Label className="text-xs capitalize">{k}</Label>
                  <Input
                    value={(form.socialLinks as Record<string,string>)[k]}
                    onChange={e => setSocial(k, e.target.value)}
                    placeholder={`https://${k}.com/...`}
                    className="mt-0.5 h-7 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Ratings */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Rating <span className="text-muted-foreground text-xs">(e.g. 4.5)</span></Label>
              <Input value={form.rating} onChange={e => set("rating", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Review Count</Label>
              <Input type="number" value={form.reviewCount} onChange={e => set("reviewCount", Number(e.target.value))} className="mt-1" />
            </div>
          </div>

          {/* Cover Photo Picker */}
          {photos.length > 0 && (
            <div>
              <Label className="mb-2 block">Cover Photo <span className="text-muted-foreground text-xs">(shown on listing card and profile hero)</span></Label>
              <div className="grid grid-cols-4 gap-2">
                {photos.map((url: string, idx: number) => {
                  const isCover = form.coverPhoto === url || (!form.coverPhoto && idx === 0);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => set("coverPhoto", url)}
                      className={`relative rounded-lg overflow-hidden aspect-square border-2 transition-all ${
                        isCover ? "border-sky-500 ring-2 ring-sky-300" : "border-gray-200 hover:border-sky-300"
                      }`}
                    >
                      <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                      {isCover && (
                        <div className="absolute inset-0 bg-sky-600/20 flex items-end justify-center pb-1">
                          <span className="bg-sky-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">COVER</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Click a photo to set it as the cover image.</p>
            </div>
          )}

          {/* Video Embed */}
          <div>
            <Label>Video Embed URL <span className="text-muted-foreground text-xs">(YouTube or Vimeo — Island Premier only)</span></Label>
            <Input
              value={form.videoEmbed}
              onChange={e => set("videoEmbed", e.target.value)}
              className="mt-1"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          {/* Google Review Embed */}
          <div>
            <Label>Google Review Embed Code <span className="text-muted-foreground text-xs">(Gulf Breeze &amp; Island Premier only)</span></Label>
            <Textarea
              value={form.googleReviewEmbedCode}
              onChange={e => set("googleReviewEmbedCode", e.target.value)}
              rows={4}
              className="mt-1 font-mono text-xs"
              placeholder="Paste widget HTML here..."
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={updateBusiness.isPending}>Cancel</Button>
          <Button className="btn-ocean" onClick={handleSave} disabled={updateBusiness.isPending}>
            {updateBusiness.isPending ? "Saving…" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BusinessesTab() {
  const { data: businesses, isLoading, refetch } = trpc.admin.listBusinesses.useQuery();
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<BusinessRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [reviewTarget, setReviewTarget] = useState<{ id: number; name: string; tier: string; embedCode: string | null } | null>(null);
  const [reviewEmbed, setReviewEmbed] = useState("");

  const updateBusiness = trpc.admin.updateBusiness.useMutation({
    onSuccess: () => { toast.success("Listing updated"); refetch(); },
    onError: () => toast.error("Update failed"),
  });

  const deleteBusiness = trpc.admin.deleteBusiness.useMutation({
    onSuccess: () => { toast.success("Listing deleted"); refetch(); setDeleteTarget(null); },
    onError: () => toast.error("Delete failed"),
  });

  const updateGoogleReview = trpc.admin.updateGoogleReview.useMutation({
    onSuccess: () => { toast.success("Google Review embed saved"); refetch(); setReviewTarget(null); },
    onError: () => toast.error("Failed to save embed code"),
  });

  const openReviewDialog = (b: { id: number; name: string; tier: string; googleReviewEmbedCode?: string | null }) => {
    setReviewTarget({ id: b.id, name: b.name, tier: b.tier, embedCode: b.googleReviewEmbedCode ?? null });
    setReviewEmbed(b.googleReviewEmbedCode ?? "");
  };

  const toggle = (id: number, field: "isFeatured" | "isSponsored" | "isActive" | "isChamberMember", current: boolean) => {
    updateBusiness.mutate({ id, [field]: !current });
  };

  const setTier = (id: number, tier: "free" | "featured" | "sponsored") => {
    updateBusiness.mutate({ id, tier });
  };

  const [sortBy, setSortBy] = useState<"name" | "category">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const CATEGORY_NAMES: Record<number, string> = {
    1: "Dining", 2: "Shopping", 3: "Activities", 4: "Services",
    5: "Nightlife", 6: "Wellness", 7: "Accommodations", 8: "Real Estate",
  };

  const sortedBusinesses = [...(businesses ?? [])].sort((a, b) => {
    let valA = sortBy === "category" ? (CATEGORY_NAMES[a.categoryId] ?? "") : a.name;
    let valB = sortBy === "category" ? (CATEGORY_NAMES[b.categoryId] ?? "") : b.name;
    const cmp = valA.localeCompare(valB);
    return sortDir === "asc" ? cmp : -cmp;
  });

  const toggleSort = (field: "name" | "category") => {
    if (sortBy === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">{businesses?.length ?? 0} listings</p>
          <span className="text-muted-foreground/40">·</span>
          <span className="text-xs text-muted-foreground">Sort by:</span>
          <button
            onClick={() => toggleSort("name")}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              sortBy === "name" ? "bg-ocean text-white border-ocean" : "bg-white text-muted-foreground border-border hover:border-ocean/50"
            }`}
          >
            A–Z {sortBy === "name" ? (sortDir === "asc" ? "↑" : "↓") : ""}
          </button>
          <button
            onClick={() => toggleSort("category")}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              sortBy === "category" ? "bg-ocean text-white border-ocean" : "bg-white text-muted-foreground border-border hover:border-ocean/50"
            }`}
          >
            Category {sortBy === "category" ? (sortDir === "asc" ? "↑" : "↓") : ""}
          </button>
        </div>
        <Button className="btn-ocean h-8 text-xs gap-1" onClick={() => setShowAdd(true)}>
          <Plus className="w-3.5 h-3.5" /> Add Listing
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th
                className="text-left px-4 py-3 font-semibold text-muted-foreground cursor-pointer hover:text-foreground select-none"
                onClick={() => toggleSort("name")}
              >
                Business {sortBy === "name" ? (sortDir === "asc" ? "↑" : "↓") : <span className="opacity-30">↕</span>}
              </th>
              <th
                className="text-left px-4 py-3 font-semibold text-muted-foreground cursor-pointer hover:text-foreground select-none"
                onClick={() => toggleSort("category")}
              >
                Category {sortBy === "category" ? (sortDir === "asc" ? "↑" : "↓") : <span className="opacity-30">↕</span>}
              </th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Tier</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Featured</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Sponsored</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Active</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Claimed</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Chamber</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedBusinesses.map((b, i) => (
              <tr
                key={b.id}
                className={`border-b border-border last:border-0 transition-colors hover:bg-muted/30 ${
                  i % 2 === 0 ? "bg-white" : "bg-muted/10"
                }`}
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{b.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{b.area}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-muted-foreground">{CATEGORY_NAMES[b.categoryId] ?? "—"}</span>
                </td>
                <td className="px-4 py-3">
                  <div title="Admin override — changes tier in DB only, no Stripe charge triggered">
                    <Select
                      value={b.tier}
                      onValueChange={(v) => setTier(b.id, v as "free" | "featured" | "sponsored")}
                    >
                      <SelectTrigger className="w-44 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Sandy Shores — Free</SelectItem>
                        <SelectItem value="featured">Gulf Breeze — Paid ★</SelectItem>
                        <SelectItem value="sponsored">Island Premier — Paid ★★</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">Admin override (no Stripe charge)</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggle(b.id, "isFeatured", b.isFeatured)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-colors ${
                      b.isFeatured ? "bg-ocean text-white" : "bg-muted text-muted-foreground hover:bg-ocean/20"
                    }`}
                    title={b.isFeatured ? "Remove featured" : "Set featured"}
                  >
                    <Star className="w-4 h-4" />
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggle(b.id, "isSponsored", b.isSponsored)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-colors ${
                      b.isSponsored ? "bg-amber-500 text-white" : "bg-muted text-muted-foreground hover:bg-amber-100"
                    }`}
                    title={b.isSponsored ? "Remove sponsored" : "Set sponsored"}
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggle(b.id, "isActive", b.isActive)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-colors ${
                      b.isActive ? "bg-green-500 text-white" : "bg-muted text-muted-foreground hover:bg-green-100"
                    }`}
                    title={b.isActive ? "Deactivate" : "Activate"}
                  >
                    {b.isActive ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                    b.isClaimed ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {b.isClaimed ? "Claimed" : "Unclaimed"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggle(b.id, "isChamberMember", (b as any).isChamberMember ?? false)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-colors ${
                      (b as any).isChamberMember ? "bg-teal-600 text-white" : "bg-muted text-muted-foreground hover:bg-teal-100"
                    }`}
                    title={(b as any).isChamberMember ? "Remove Chamber Member" : "Mark as Chamber Member"}
                  >
                    <img
                      src="https://d2xsxph8kpxj0f.cloudfront.net/310519663047046836/LgGdfsvMFzrUmENex4CRQA/chamber_badge-cnLf2FfXDVDZgysSz9HxLV.webp"
                      alt="Chamber"
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <a
                      href={`/business/${b.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-ocean hover:underline"
                    >
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      onClick={() => setEditTarget(b)}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-ocean hover:bg-ocean/10 transition-colors"
                      title="Edit all fields"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {(b.tier === "featured" || b.tier === "sponsored") && (
                      <button
                        onClick={() => openReviewDialog(b)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                          b.googleReviewEmbedCode
                            ? "bg-green-100 text-green-600 hover:bg-green-200"
                            : "text-muted-foreground hover:bg-muted"
                        }`}
                        title={b.googleReviewEmbedCode ? "Edit Google Review embed" : "Add Google Review embed"}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteTarget({ id: b.id, name: b.name })}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Delete listing"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {businesses?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No businesses found.</div>
        )}
      </div>

      {/* Add Listing Dialog */}
      <AddListingDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onCreated={refetch}
      />

      {/* Full Edit Dialog */}
      {editTarget && (
        <EditListingDialog
          biz={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={refetch}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Listing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => deleteTarget && deleteBusiness.mutate({ id: deleteTarget.id })}
              disabled={deleteBusiness.isPending}
            >
              {deleteBusiness.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Google Review Embed Dialog */}
      <Dialog open={!!reviewTarget} onOpenChange={(v) => !v && setReviewTarget(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-ocean" />
              Google Review Embed
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-ocean/5 border border-ocean/20 p-3 text-sm text-ocean-dark">
              <p className="font-semibold mb-1">For: {reviewTarget?.name}</p>
              <p className="text-xs text-muted-foreground">
                Tier: <span className="capitalize font-medium">{reviewTarget?.tier}</span> — Google Review widgets are available for Gulf Breeze and Island Premier listings.
              </p>
            </div>
            <div>
              <Label htmlFor="gr-embed" className="text-sm font-medium">
                Embed Code or Widget HTML
              </Label>
              <Textarea
                id="gr-embed"
                value={reviewEmbed}
                onChange={(e) => setReviewEmbed(e.target.value)}
                placeholder={`Paste your Google Review widget embed code here...\n\nExample:\n<script src="https://..." async defer></script>\n<div class="google-reviews-widget" data-place-id="..."></div>`}
                rows={8}
                className="mt-1 font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Paste any Google Review widget embed code (Elfsight, EmbedSocial, Places API widget, etc.). Leave blank to remove.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReviewTarget(null)} disabled={updateGoogleReview.isPending}>
              Cancel
            </Button>
            {reviewEmbed && (
              <Button
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => reviewTarget && updateGoogleReview.mutate({ id: reviewTarget.id, googleReviewEmbedCode: null })}
                disabled={updateGoogleReview.isPending}
              >
                Remove Embed
              </Button>
            )}
            <Button
              className="btn-ocean"
              onClick={() => reviewTarget && updateGoogleReview.mutate({ id: reviewTarget.id, googleReviewEmbedCode: reviewEmbed || null })}
              disabled={updateGoogleReview.isPending}
            >
              {updateGoogleReview.isPending ? "Saving…" : "Save Embed"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Submissions Tab ────────────────────────────────────────────────────────────
function SubmissionsTab() {
  const utils = trpc.useUtils();
  const { data: submissions, isLoading, refetch } = trpc.admin.listSubmissions.useQuery();
  const updateStatus = trpc.admin.updateSubmission.useMutation({
    onSuccess: (_data, variables) => {
      if (variables.status === "approved") {
        toast.success("Submission approved — business listing created and added to the directory!");
        utils.admin.listBusinesses.invalidate();
      } else if (variables.status === "rejected") {
        toast.success("Submission rejected. Stripe refund initiated and rejection email sent.");
      } else {
        toast.success("Status updated.");
      }
      refetch();
    },
    onError: () => toast.error("Update failed"),
  });

  const resendPayment = trpc.admin.resendPaymentLink.useMutation({
    onSuccess: (data) => {
      window.open(data.checkoutUrl, "_blank");
      toast.success("Fresh payment link opened — copy it and send to the submitter.");
    },
    onError: (err) => toast.error(`Resend failed: ${err.message}`),
  });

  const [showResolved, setShowResolved] = useState(false);

  // Rejection dialog state
  const [subRejectDialogOpen, setSubRejectDialogOpen] = useState(false);
  const [subRejectTarget, setSubRejectTarget] = useState<{ id: number; businessName: string } | null>(null);
  const [subRejectReason, setSubRejectReason] = useState("");
  const [subRejectNotes, setSubRejectNotes] = useState("");

  const TIER_LABELS: Record<string, string> = {
    free: "Free",
    gulf_breeze: "Gulf Breeze",
    island_premier: "Island Premier",
  };

  const pendingSubmissions = submissions?.filter((s) => s.status === "pending") ?? [];
  const resolvedSubmissions = submissions?.filter((s) => s.status !== "pending") ?? [];
  const visibleSubmissions = showResolved ? (submissions ?? []) : pendingSubmissions;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filter toolbar */}
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm text-muted-foreground">
          {pendingSubmissions.length} pending
          {resolvedSubmissions.length > 0 && (
            <span className="ml-2 text-muted-foreground/60">
              · {resolvedSubmissions.length} resolved
            </span>
          )}
        </p>
        {resolvedSubmissions.length > 0 && (
          <button
            onClick={() => setShowResolved((v) => !v)}
            className="text-xs text-ocean hover:underline"
          >
            {showResolved ? "Hide resolved" : `Show resolved (${resolvedSubmissions.length})`}
          </button>
        )}
      </div>

      {visibleSubmissions.length === 0 && pendingSubmissions.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">No submissions yet.</div>
      )}
      {visibleSubmissions.length === 0 && pendingSubmissions.length === 0 ? null : visibleSubmissions.map((s) => (
        <Card key={s.id} className="card-coastal">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-foreground">{s.businessName}</span>
                  <StatusBadge status={s.status} />
                  {s.tier && s.tier !== "free" && (
                    <Badge variant="outline" className="text-xs border-ocean/30 text-ocean">
                      {TIER_LABELS[s.tier] ?? s.tier}
                    </Badge>
                  )}
                  {s.tier && s.tier !== "free" && (
                    s.stripeSubscriptionId
                      ? <Badge className="text-xs bg-green-100 text-green-800 border-green-200">Paid</Badge>
                      : <Badge className="text-xs bg-amber-100 text-amber-800 border-amber-200">Unpaid</Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
                  <div>
                    <span className="font-medium">Contact:</span> {s.contactName} — {s.email}
                    {s.phone && ` · ${s.phone}`}
                  </div>
                  {s.address && (
                    <div>
                      <span className="font-medium">Address:</span> {s.address}
                    </div>
                  )}
                  {s.website && (
                    <div>
                      <span className="font-medium">Website:</span>{" "}
                      <a
                        href={s.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-ocean hover:underline"
                      >
                        {s.website}
                      </a>
                    </div>
                  )}
                  {s.description && (
                    <div className="mt-1 text-xs bg-muted/50 rounded-lg p-2 max-w-xl">
                      {s.description}
                    </div>
                  )}
                  {s.status === "rejected" && (s as any).rejectionReason && (
                    <div className="mt-2 flex items-start gap-2 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2 max-w-xl">
                      <XCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-red-700">Rejection reason: </span>
                        <span className="text-red-700">{(s as any).rejectionReason}</span>
                        {(s as any).rejectionNotes && (
                          <p className="mt-1 text-red-600/80">{(s as any).rejectionNotes}</p>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground/70 mt-1 flex items-center gap-3 flex-wrap">
                    <span>Submitted {new Date(s.createdAt).toLocaleDateString()}</span>
                    {s.status === "approved" && s.createdBusinessId && (
                      <a
                        href={`/admin#businesses-${s.createdBusinessId}`}
                        className="inline-flex items-center gap-1 text-ocean hover:underline font-medium"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Edit Listing
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0 flex-wrap">
                {/* Resend Payment Link — only for pending paid-tier submissions without confirmed payment */}
                {s.status === "pending" && s.tier && s.tier !== "free" && !s.stripeSubscriptionId && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-1 text-amber-700 border-amber-200 hover:bg-amber-50"
                    disabled={resendPayment.isPending}
                    onClick={() => resendPayment.mutate({ submissionId: s.id, origin: window.location.origin })}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Resend Payment Link
                  </Button>
                )}
                {s.status === "approved" && s.createdBusinessSlug && (
                  <a
                    href={`/business/${s.createdBusinessSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
                      <ExternalLink className="w-3.5 h-3.5" />
                      View Listing
                    </Button>
                  </a>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-700 border-green-200 hover:bg-green-50 h-8 text-xs"
                  disabled={s.status === "approved" || updateStatus.isPending}
                  onClick={() => updateStatus.mutate({ id: s.id, status: "approved", origin: window.location.origin })}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-700 border-red-200 hover:bg-red-50 h-8 text-xs"
                  disabled={s.status === "rejected" || updateStatus.isPending}
                  onClick={() => {
                    setSubRejectTarget({ id: s.id, businessName: s.businessName });
                    setSubRejectReason("");
                    setSubRejectNotes("");
                    setSubRejectDialogOpen(true);
                  }}
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" />
                  Reject
                </Button>
                {s.status === "rejected" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-red-700 h-8 text-xs px-2"
                    disabled={updateStatus.isPending}
                    onClick={() => {
                      setSubRejectTarget({ id: s.id, businessName: s.businessName });
                      setSubRejectReason("");
                      setSubRejectNotes("");
                      setSubRejectDialogOpen(true);
                    }}
                  >
                    <Pencil className="w-3 h-3 mr-1" />
                    Edit reason
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {visibleSubmissions.length === 0 && pendingSubmissions.length > 0 && (
        <div className="text-center py-10 text-muted-foreground text-sm">
          All caught up — no pending submissions.
          <button onClick={() => setShowResolved(true)} className="ml-2 text-ocean hover:underline">
            View resolved ({resolvedSubmissions.length})
          </button>
        </div>
      )}

      {/* Submission Rejection Reason Dialog */}
      <Dialog open={subRejectDialogOpen} onOpenChange={(v) => { if (!v) setSubRejectDialogOpen(false); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              Reject Submission — {subRejectTarget?.businessName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="sub-reject-reason" className="text-sm font-medium">
                Rejection Reason <span className="text-red-500">*</span>
              </Label>
              <Select value={subRejectReason} onValueChange={setSubRejectReason}>
                <SelectTrigger id="sub-reject-reason" className="mt-1">
                  <SelectValue placeholder="Select a reason…" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {SUBMISSION_REJECTION_REASONS.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sub-reject-notes" className="text-sm font-medium">
                Additional Notes <span className="text-xs text-muted-foreground font-normal">(optional — included in rejection email)</span>
              </Label>
              <Textarea
                id="sub-reject-notes"
                value={subRejectNotes}
                onChange={(e) => setSubRejectNotes(e.target.value)}
                placeholder="Add any specific details or instructions for the submitter…"
                rows={4}
                className="mt-1"
              />
            </div>
            <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-xs text-red-700">
              The submitter will be notified via GHL with the selected reason and notes.
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSubRejectDialogOpen(false)} disabled={updateStatus.isPending}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={!subRejectReason || updateStatus.isPending}
              onClick={() => {
                if (!subRejectTarget) return;
                updateStatus.mutate(
                  { id: subRejectTarget.id, status: "rejected", origin: window.location.origin, rejectionReason: subRejectReason, rejectionNotes: subRejectNotes || undefined },
                  {
                    onSuccess: () => {
                      setSubRejectDialogOpen(false);
                    },
                  }
                );
              }}
            >
              {updateStatus.isPending ? "Rejecting…" : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const REJECTION_REASONS = [
  "Claimant cannot prove ownership or authorized representation",
  "A different person has already claimed this listing",
  "Name provided does not match the registered business owner",
  "Email domain does not match the business website domain",
  "Business name submitted does not match the listing",
  "Phone number provided does not match the business on record",
  "Address provided does not match the listing address",
  "Business appears to be permanently closed",
  "Suspected fraudulent claim — information appears fabricated",
  "Duplicate claim submitted for the same business",
  "Claimant has previously had a claim rejected for this listing",
  "Business is not located in the Siesta Key service area",
  "Business category is not eligible for directory listing",
  "Suspected competitor attempting to claim a rival's listing",
  "Insufficient information provided to verify ownership",
  "Claimant did not respond to verification request in time",
  "Other (see notes below)",
];

const SUBMISSION_REJECTION_REASONS = [
  "Business is not located in the Siesta Key service area",
  "Business category is not eligible for directory listing",
  "Business name or information appears to be inaccurate",
  "Business appears to be permanently closed",
  "Duplicate listing already exists in the directory",
  "Insufficient information provided to verify the business",
  "Website URL is invalid or does not match the business",
  "Address provided is not a valid Siesta Key business address",
  "Suspected spam or fraudulent submission",
  "Business does not meet directory content guidelines",
  "Submitted photos do not meet quality standards",
  "Other (see notes below)",
];

// ─── Claims Tab ─────────────────────────────────────────────────────────────────
function ClaimsTab() {
  const utils = trpc.useUtils();
  const { data: claims, isLoading } = trpc.admin.listClaims.useQuery();
  const [showResolved, setShowResolved] = useState(false);
  // Track slugs returned from approveClaim so we can show View/Edit links immediately
  const [approvedSlugs, setApprovedSlugs] = useState<Record<number, string>>({});
  // IDs of claims just resolved in this session — keep them visible so links are accessible
  const [justResolved, setJustResolved] = useState<Set<number>>(new Set());
  // Rejection dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<{ claimId: number; contactId?: string; businessName: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectNotes, setRejectNotes] = useState("");

  const approveMutation = trpc.admin.approveClaim.useMutation({
    onSuccess: (data, variables) => {
      utils.admin.listClaims.invalidate();
      utils.admin.stats.invalidate();
      if (data.businessSlug) {
        setApprovedSlugs((prev) => ({ ...prev, [variables.claimId]: data.businessSlug! }));
      }
      setJustResolved((prev) => new Set(Array.from(prev).concat(variables.claimId)));
      toast.success("Claim approved — business linked to owner account");
    },
    onError: (err) => toast.error(`Approval failed: ${err.message}`),
  });
  const rejectMutation = trpc.admin.rejectClaim.useMutation({
    onSuccess: () => {
      utils.admin.listClaims.invalidate();
      toast.success("Claim rejected");
    },
    onError: (err) => toast.error(`Rejection failed: ${err.message}`),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const pending = claims?.filter((c) => (c as any).status === "pending" || !(c as any).status) ?? [];
  const resolved = claims?.filter((c) => (c as any).status === "approved" || (c as any).status === "rejected") ?? [];
  // Always show claims just resolved in this session so View/Edit links are accessible
  const visible = showResolved
    ? Array.from(new Set([...pending, ...resolved]))
    : [...pending, ...resolved.filter((c) => justResolved.has(c.id))];

  return (
    <div className="space-y-3">
      {/* Filter toggle */}
      {resolved.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowResolved((v) => !v)}
            className="text-xs text-ocean hover:underline"
          >
            {showResolved ? "Hide resolved" : `Show resolved (${resolved.length})`}
          </button>
        </div>
      )}

      {visible.map((c) => {
        const status = (c as any).status ?? "pending";
        const isApproved = status === "approved";
        const isRejected = status === "rejected";
        const isResolved = isApproved || isRejected;
        const slug = approvedSlugs[c.id] ?? null;

        return (
          <Card key={c.id} className={`card-coastal ${isResolved ? "opacity-70" : ""}`}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground">{c.businessName}</span>
                    {/* Status badge */}
                    {isApproved && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                        <CheckCircle2 className="w-3 h-3" /> Approved
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                        <XCircle className="w-3 h-3" /> Rejected
                      </span>
                    )}
                    {!isResolved && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                        Pending
                      </span>
                    )}
                    {c.ghlWebhookSent && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                        GHL Sent
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
                    <div>
                      <span className="font-medium">Contact:</span> {c.contactName} — {c.email}
                      {c.phone && ` · ${c.phone}`}
                    </div>
                    {c.message && (
                      <div className="mt-1 text-xs bg-muted/50 rounded-lg p-2 max-w-xl">
                        {c.message}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground/70 mt-1">
                      Received {new Date(c.createdAt).toLocaleDateString()}
                    </div>
                    {/* Post-approval links */}
                    {isApproved && slug && (
                      <div className="flex items-center gap-3 mt-2">
                        <a
                          href={`/business/${slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-ocean font-medium hover:underline"
                        >
                          View Listing <ExternalLink className="w-3 h-3" />
                        </a>
                        <a
                          href={`/admin#businesses`}
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-ocean hover:underline"
                        >
                          Edit in Admin <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                    {isApproved && !slug && (
                      <div className="flex items-center gap-3 mt-2">
                        <a
                          href="/admin#businesses"
                          className="inline-flex items-center gap-1 text-xs text-ocean font-medium hover:underline"
                        >
                          Edit Listing in Admin <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <a
                    href={`mailto:${c.email}`}
                    className="inline-flex items-center gap-1 text-xs text-ocean hover:underline"
                  >
                    Reply <ExternalLink className="w-3 h-3" />
                  </a>
                  {!isResolved && (
                    <>
                      <button
                        onClick={() =>
                          approveMutation.mutate({
                            claimId: c.id,
                            businessId: c.businessId ?? undefined,
                            businessName: c.businessName, // fallback name match if businessId is null
                            claimEmail: c.email,
                            contactId: (c as any).ghlContactId ?? undefined,
                          })
                        }
                        disabled={approveMutation.isPending}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Approve
                      </button>
                      <button
                        onClick={() => {
                          setRejectTarget({ claimId: c.id, contactId: (c as any).ghlContactId ?? undefined, businessName: c.businessName });
                          setRejectReason("");
                          setRejectNotes("");
                          setRejectDialogOpen(true);
                        }}
                        disabled={rejectMutation.isPending}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 transition-colors"
                      >
                        <XCircle className="w-3 h-3" /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Rejection Reason Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={(v) => { if (!v) setRejectDialogOpen(false); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              Reject Claim — {rejectTarget?.businessName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="reject-reason" className="text-sm font-medium">
                Rejection Reason <span className="text-red-500">*</span>
              </Label>
              <Select value={rejectReason} onValueChange={setRejectReason}>
                <SelectTrigger id="reject-reason" className="mt-1">
                  <SelectValue placeholder="Select a reason…" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {REJECTION_REASONS.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reject-notes" className="text-sm font-medium">
                Additional Notes <span className="text-xs text-muted-foreground font-normal">(optional — included in rejection email)</span>
              </Label>
              <Textarea
                id="reject-notes"
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Add any specific details or instructions for the claimant…"
                rows={4}
                className="mt-1"
              />
            </div>
            <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-xs text-red-700">
              The claimant will be notified via GHL with the selected reason and notes.
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)} disabled={rejectMutation.isPending}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={!rejectReason || rejectMutation.isPending}
              onClick={() => {
                if (!rejectTarget) return;
                rejectMutation.mutate(
                  { claimId: rejectTarget.claimId, contactId: rejectTarget.contactId, rejectionReason: rejectReason, rejectionNotes: rejectNotes || undefined },
                  {
                    onSuccess: () => {
                      setRejectDialogOpen(false);
                      setJustResolved((prev) => new Set(Array.from(prev).concat(rejectTarget.claimId)));
                    },
                  }
                );
              }}
            >
              {rejectMutation.isPending ? "Rejecting…" : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {pending.length === 0 && !showResolved && (
        <div className="text-center py-12 text-muted-foreground">
          <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
          All caught up!{" "}
          {resolved.length > 0 && (
            <button onClick={() => setShowResolved(true)} className="text-ocean hover:underline">
              View {resolved.length} resolved claim{resolved.length !== 1 ? "s" : ""}
            </button>
          )}
        </div>
      )}
      {claims?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">No claim leads yet.</div>
      )}
    </div>
  );
}

// ─── Events Tab ─────────────────────────────────────────────────────────────────
type EventRow = {
  id: number;
  businessId: number;
  businessName: string;
  type: "event" | "announcement";
  title: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  location: string | null;
  imageUrl: string | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const EMPTY_EVENT_FORM = {
  id: undefined as number | undefined,
  businessId: 0,
  type: "event" as "event" | "announcement",
  title: "",
  description: "",
  startDate: "",
  endDate: "",
  location: "",
  imageUrl: "",
  isPublished: true,
};

function EventsTab() {
  const utils = trpc.useUtils();
  const { data: events, isLoading } = trpc.events.listAll.useQuery();
  const { data: allBusinesses } = trpc.admin.listBusinesses.useQuery();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EventRow | null>(null);
  const [form, setForm] = useState({ ...EMPTY_EVENT_FORM });
  const [imageUploading, setImageUploading] = useState(false);
  const eventImageInputRef = useRef<HTMLInputElement>(null);

  const uploadEventImageMutation = trpc.dashboard.uploadPhoto.useMutation({
    onSuccess: (data) => {
      setForm((f) => ({ ...f, imageUrl: data.url }));
      setImageUploading(false);
      toast.success("Image uploaded!");
    },
    onError: (e) => {
      setImageUploading(false);
      toast.error(`Image upload failed: ${e.message}`);
    },
  });

  const handleEventImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Image must be under 10MB."); return; }
    setImageUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64Data = dataUrl.split(",")[1];
      if (!base64Data) { setImageUploading(false); return; }
      uploadEventImageMutation.mutate({
        base64Data,
        mimeType: file.type as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
        fileName: file.name,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Only Island Premier (sponsored) businesses can have events
  const islandPremierBizList = (allBusinesses ?? []).filter((b: any) => b.tier === "sponsored");

  const upsert = trpc.events.upsert.useMutation({
    onSuccess: () => {
      utils.events.listAll.invalidate();
      toast.success(form.id ? "Event updated" : "Event created");
      setDialogOpen(false);
      setForm({ ...EMPTY_EVENT_FORM });
    },
    onError: (e) => toast.error(`Failed to save event: ${e.message}`),
  });

  const deleteMutation = trpc.events.delete.useMutation({
    onSuccess: () => {
      utils.events.listAll.invalidate();
      toast.success("Event deleted");
      setDeleteTarget(null);
    },
    onError: (e) => toast.error(`Delete failed: ${e.message}`),
  });

  const openCreate = () => {
    setForm({
      ...EMPTY_EVENT_FORM,
      businessId: islandPremierBizList[0]?.id ?? 0,
    });
    setDialogOpen(true);
  };

  const openEdit = (ev: EventRow) => {
    setForm({
      id: ev.id,
      businessId: ev.businessId,
      type: ev.type,
      title: ev.title,
      description: ev.description ?? "",
      startDate: ev.startDate ?? "",
      endDate: ev.endDate ?? "",
      location: ev.location ?? "",
      imageUrl: ev.imageUrl ?? "",
      isPublished: ev.isPublished,
    });
    setDialogOpen(true);
  };

  const set = (field: string, value: string | number | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {events?.length ?? 0} event{(events?.length ?? 0) !== 1 ? "s" : ""} across all Island Premier listings
        </p>
        <Button
          className="btn-ocean gap-2"
          onClick={openCreate}
          disabled={islandPremierBizList.length === 0}
        >
          <Plus className="w-4 h-4" /> Add Event
        </Button>
      </div>

      {islandPremierBizList.length === 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          No Island Premier listings found. Events & Announcements are exclusive to the Island Premier tier.
        </div>
      )}

      {/* Events table */}
      {(events?.length ?? 0) > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Business</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(events as EventRow[]).map((ev) => (
                <tr key={ev.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-medium text-charcoal">{ev.businessName}</span>
                  </td>
                  <td className="px-4 py-3">
                    {ev.type === "announcement" ? (
                      <Badge className="bg-purple-100 text-purple-700 border-purple-200 gap-1">
                        <Megaphone className="w-3 h-3" /> Announcement
                      </Badge>
                    ) : (
                      <Badge className="bg-ocean/10 text-ocean border-ocean/20 gap-1">
                        <Calendar className="w-3 h-3" /> Event
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{ev.title}</span>
                    {ev.location && <div className="text-xs text-muted-foreground mt-0.5">{ev.location}</div>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {ev.startDate ? (
                      <span>{new Date(ev.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={ev.isPublished ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}>
                      {ev.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEdit(ev)}
                        className="p-1.5 rounded-lg hover:bg-ocean/10 text-ocean transition-colors"
                        title="Edit event"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(ev)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                        title="Delete event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
          No events yet. Click "Add Event" to create the first one.
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(v) => { if (!v) { setDialogOpen(false); setForm({ ...EMPTY_EVENT_FORM }); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">
              {form.id ? "Edit Event / Announcement" : "Add Event / Announcement"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Business selector */}
            <div>
              <Label htmlFor="ev-biz">Business (Island Premier only) *</Label>
              <Select
                value={String(form.businessId || "")}
                onValueChange={(v) => set("businessId", Number(v))}
              >
                <SelectTrigger id="ev-biz" className="mt-1">
                  <SelectValue placeholder="Select a business…" />
                </SelectTrigger>
                <SelectContent>
                  {islandPremierBizList.map((b: any) => (
                    <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type */}
            <div>
              <Label htmlFor="ev-type">Type *</Label>
              <Select value={form.type} onValueChange={(v) => set("type", v as "event" | "announcement")}>
                <SelectTrigger id="ev-type" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="event">📅 Event (has a date)</SelectItem>
                  <SelectItem value="announcement">📣 Announcement (timeless)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="ev-title">Title *</Label>
              <Input
                id="ev-title"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Summer Beach Party"
                maxLength={300}
                className="mt-1"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="ev-desc">Description</Label>
              <Textarea
                id="ev-desc"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Details about the event or announcement…"
                rows={3}
                className="mt-1"
              />
            </div>

            {/* Dates — only for events */}
            {form.type === "event" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="ev-start">Start Date / Time</Label>
                  <Input
                    id="ev-start"
                    type="datetime-local"
                    value={form.startDate}
                    onChange={(e) => set("startDate", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="ev-end">End Date / Time</Label>
                  <Input
                    id="ev-end"
                    type="datetime-local"
                    value={form.endDate}
                    onChange={(e) => set("endDate", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {/* Location */}
            <div>
              <Label htmlFor="ev-loc">Location</Label>
              <Input
                id="ev-loc"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="e.g. Siesta Key Beach Pavilion"
                className="mt-1"
              />
            </div>

            {/* Image Upload */}
            <div>
              <Label className="text-sm font-medium">Cover Image <span className="text-xs text-muted-foreground font-normal">(optional)</span></Label>
              <input
                ref={eventImageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleEventImageUpload}
              />
              {form.imageUrl ? (
                <div className="mt-2 relative group w-full h-32 rounded-lg overflow-hidden border border-border">
                  <img src={form.imageUrl} alt="Event cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="sm" variant="outline" className="bg-white/90 text-black hover:bg-white" onClick={() => eventImageInputRef.current?.click()} disabled={imageUploading}>
                      <Upload className="h-3 w-3 mr-1" /> Replace
                    </Button>
                    <Button size="sm" variant="outline" className="bg-white/90 text-red-600 hover:bg-white" onClick={() => set("imageUrl", "")}>
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => eventImageInputRef.current?.click()}
                  disabled={imageUploading}
                  className="mt-2 w-full h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                >
                  {imageUploading ? (
                    <><div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" /><span className="text-xs">Uploading…</span></>
                  ) : (
                    <><Upload className="h-5 w-5" /><span className="text-xs font-medium">Click to upload image</span><span className="text-xs">JPEG, PNG, WebP, GIF · max 10MB</span></>
                  )}
                </button>
              )}
            </div>

            {/* Published toggle */}
            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <input
                id="ev-published"
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => set("isPublished", e.target.checked)}
                className="w-4 h-4 accent-ocean"
              />
              <Label htmlFor="ev-published" className="cursor-pointer">
                Published <span className="text-xs text-muted-foreground font-normal">(visible on the business profile)</span>
              </Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setDialogOpen(false); setForm({ ...EMPTY_EVENT_FORM }); }} disabled={upsert.isPending}>
              Cancel
            </Button>
            <Button
              className="btn-ocean"
              disabled={!form.title.trim() || !form.businessId || upsert.isPending}
              onClick={() => upsert.mutate({
                ...form,
                description: form.description || undefined,
                startDate: form.startDate || undefined,
                endDate: form.endDate || undefined,
                location: form.location || undefined,
                imageUrl: form.imageUrl || undefined,
              })}
            >
              {upsert.isPending ? "Saving…" : form.id ? "Save Changes" : "Create Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this event?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.title}" will be permanently removed and will no longer appear on the business profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => deleteTarget && deleteMutation.mutate({ id: deleteTarget.id })}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Main Admin Page ─────────────────────────────────────────────────────────────
export default function Admin() {
  const { user, loading } = useAuth();
  const { data: stats } = trpc.admin.stats.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  // Hash-based tab switching: #businesses-{id} switches to Businesses tab
  const [activeTab, setActiveTab] = useState<string>("businesses");
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#businesses")) {
      setActiveTab("businesses");
    } else if (hash.startsWith("#submissions")) {
      setActiveTab("submissions");
    } else if (hash.startsWith("#claims")) {
      setActiveTab("claims");
    }
  }, []);

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-ocean border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <Card className="card-coastal max-w-sm w-full text-center p-8">
          <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-serif text-xl font-bold mb-2">Sign In Required</h2>
          <p className="text-muted-foreground text-sm mb-6">
            You must be signed in as an admin to access this panel.
          </p>
          <Button
            className="btn-ocean w-full"
            onClick={() => (window.location.href = getLoginUrl())}
          >
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  // Not admin
  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <Card className="card-coastal max-w-sm w-full text-center p-8">
          <Lock className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="font-serif text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground text-sm mb-6">
            This area is restricted to administrators only.
          </p>
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Back to Directory
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <div className="relative">
        <PageHero
          title="Admin Dashboard"
          subtitle={`Shop in Siesta Key — Directory Management · Signed in as ${user.name ?? user.email}`}
          breadcrumb="Admin"
        />
        <a
          href="/"
          className="absolute top-6 right-4 md:right-8 z-20 text-white/80 hover:text-white text-sm underline underline-offset-2"
        >
          ← Back to Site
        </a>
      </div>

      <div className="container py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Listings"
            value={stats?.totalBusinesses}
            icon={Building2}
            color="bg-ocean"
          />
          <StatCard
            label="Featured"
            value={stats?.featuredBusinesses}
            icon={Star}
            color="bg-amber-500"
          />
          <StatCard
            label="Claim Leads"
            value={stats?.totalClaims}
            icon={Users}
            color="bg-coral"
          />
          <StatCard
            label="Pending Reviews"
            value={stats?.pendingSubmissions}
            icon={ClipboardList}
            color="bg-seafoam"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-white border border-border shadow-sm rounded-xl p-1 h-auto gap-1">
            <TabsTrigger
              value="businesses"
              className="rounded-lg data-[state=active]:bg-ocean data-[state=active]:text-white px-4 py-2 text-sm font-medium"
            >
              <Building2 className="w-4 h-4 mr-2 inline" />
              Listings
            </TabsTrigger>
            <TabsTrigger
              value="submissions"
              className="rounded-lg data-[state=active]:bg-ocean data-[state=active]:text-white px-4 py-2 text-sm font-medium"
            >
              <ClipboardList className="w-4 h-4 mr-2 inline" />
              Submissions
              {(stats?.pendingSubmissions ?? 0) > 0 && (
                <span className="ml-1.5 bg-coral text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                  {stats?.pendingSubmissions}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="claims"
              className="rounded-lg data-[state=active]:bg-ocean data-[state=active]:text-white px-4 py-2 text-sm font-medium"
            >
              <Users className="w-4 h-4 mr-2 inline" />
              Claim Leads
            </TabsTrigger>
            <TabsTrigger
              value="csv-import"
              className="rounded-lg data-[state=active]:bg-ocean data-[state=active]:text-white px-4 py-2 text-sm font-medium"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2 inline" />
              CSV Import
            </TabsTrigger>
            <TabsTrigger
              value="blog"
              className="rounded-lg data-[state=active]:bg-ocean data-[state=active]:text-white px-4 py-2 text-sm font-medium"
            >
              <MessageSquare className="w-4 h-4 mr-2 inline" />
              Blog / Guides
            </TabsTrigger>
            <TabsTrigger
              value="events"
              className="rounded-lg data-[state=active]:bg-ocean data-[state=active]:text-white px-4 py-2 text-sm font-medium"
            >
              <Calendar className="w-4 h-4 mr-2 inline" />
              Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="businesses">
            <Card className="card-coastal">
              <CardHeader className="pb-4">
                <CardTitle className="font-serif text-lg">
                  Business Listings
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Toggle Featured, Sponsored, and Active status. Change tier to control placement.
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <BusinessesTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submissions">
            <Card className="card-coastal">
              <CardHeader className="pb-4">
                <CardTitle className="font-serif text-lg">New Listing Submissions</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Review and approve or reject new business listing requests.
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <SubmissionsTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="claims">
            <Card className="card-coastal">
              <CardHeader className="pb-4">
                <CardTitle className="font-serif text-lg">Claim Leads</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Business owners who submitted a claim request. GHL webhook status shown.
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <ClaimsTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="csv-import">
            <Card className="card-coastal">
              <CardHeader className="pb-4">
                <CardTitle className="font-serif text-lg">Bulk CSV Import</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Upload a CSV file to create or update multiple business listings at once.
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <CsvImportTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blog">
            <Card className="card-coastal">
              <CardHeader className="pb-4">
                <CardTitle className="font-serif text-lg">Blog &amp; Guides</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Create, edit, and publish guides and articles for the Guides section.
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <BlogTab />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="events">
            <Card className="card-coastal">
              <CardHeader className="pb-4">
                <CardTitle className="font-serif text-lg">Events &amp; Announcements</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage events and announcements for Island Premier listings. These appear on the business profile page.
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <EventsTab />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ─── Blog Tab ────────────────────────────────────────────────────────────────
const BLOG_CATEGORIES = ["Guide", "Dining", "Activities", "Shopping", "Beach Tips", "Events"];

function BlogTab() {
  const utils = trpc.useUtils();
  const { data: posts, isLoading } = trpc.blog.list.useQuery({ publishedOnly: false, limit: 100 });

  const [editPost, setEditPost] = useState<{
    id?: number; title: string; slug: string; excerpt: string; content: string;
    coverImage: string; author: string; category: string; tags: string; isPublished: boolean;
  } | null>(null);

  const createMutation = trpc.blog.create.useMutation({
    onSuccess: () => { utils.blog.list.invalidate(); setEditPost(null); toast.success("Article created!"); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.blog.update.useMutation({
    onSuccess: () => { utils.blog.list.invalidate(); setEditPost(null); toast.success("Article updated!"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.blog.delete.useMutation({
    onSuccess: () => { utils.blog.list.invalidate(); toast.success("Article deleted."); },
    onError: (e) => toast.error(e.message),
  });

  const blankPost = { title: "", slug: "", excerpt: "", content: "", coverImage: "", author: "Shop in Siesta Key", category: "Guide", tags: "", isPublished: false };

  const handleSave = () => {
    if (!editPost) return;
    const payload = {
      title: editPost.title,
      slug: editPost.slug || undefined,
      excerpt: editPost.excerpt || undefined,
      content: editPost.content,
      coverImage: editPost.coverImage || undefined,
      author: editPost.author || undefined,
      category: editPost.category || undefined,
      tags: editPost.tags ? editPost.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      isPublished: editPost.isPublished,
    };
    if (editPost.id) {
      updateMutation.mutate({ id: editPost.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{posts?.length ?? 0} articles</p>
        <Button size="sm" onClick={() => setEditPost(blankPost)}>
          <Plus className="w-4 h-4 mr-1" /> New Article
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : (posts ?? []).length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p>No articles yet. Create your first guide!</p>
        </div>
      ) : (
        <div className="divide-y">
          {(posts ?? []).map((post) => (
            <div key={post.id} className="flex items-center justify-between py-3 gap-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">{post.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant={post.isPublished ? "default" : "secondary"} className="text-xs">
                    {post.isPublished ? "Published" : "Draft"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{post.category}</span>
                  <span className="text-xs text-muted-foreground">/guides/{post.slug}</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => setEditPost({
                  id: post.id, title: post.title, slug: post.slug,
                  excerpt: post.excerpt ?? "", content: post.content,
                  coverImage: post.coverImage ?? "", author: post.author ?? "Shop in Siesta Key",
                  category: post.category ?? "Guide",
                  tags: (post.tags as string[]).join(", "),
                  isPublished: post.isPublished ?? false,
                })}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600"
                  onClick={() => { if (confirm("Delete this article?")) deleteMutation.mutate({ id: post.id }); }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create dialog */}
      <Dialog open={!!editPost} onOpenChange={(o) => !o && setEditPost(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editPost?.id ? "Edit Article" : "New Article"}</DialogTitle>
          </DialogHeader>
          {editPost && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Title *</Label>
                  <Input value={editPost.title} onChange={e => setEditPost({ ...editPost, title: e.target.value })} placeholder="Best Restaurants on Siesta Key" />
                </div>
                <div>
                  <Label>Slug (auto-generated if blank)</Label>
                  <Input value={editPost.slug} onChange={e => setEditPost({ ...editPost, slug: e.target.value })} placeholder="best-restaurants-siesta-key" />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={editPost.category} onValueChange={v => setEditPost({ ...editPost, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BLOG_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Excerpt (shown in listing cards)</Label>
                  <Textarea rows={2} value={editPost.excerpt} onChange={e => setEditPost({ ...editPost, excerpt: e.target.value })} placeholder="A short summary of the article..." />
                </div>
                <div className="col-span-2">
                  <Label>Content * (Markdown supported)</Label>
                  <Textarea rows={12} value={editPost.content} onChange={e => setEditPost({ ...editPost, content: e.target.value })} placeholder="Write your article in Markdown..." className="font-mono text-sm" />
                </div>
                <div>
                  <Label>Cover Image URL</Label>
                  <Input value={editPost.coverImage} onChange={e => setEditPost({ ...editPost, coverImage: e.target.value })} placeholder="https://..." />
                </div>
                <div>
                  <Label>Author</Label>
                  <Input value={editPost.author} onChange={e => setEditPost({ ...editPost, author: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <Label>Tags (comma-separated)</Label>
                  <Input value={editPost.tags} onChange={e => setEditPost({ ...editPost, tags: e.target.value })} placeholder="restaurants, dining, siesta key" />
                </div>
                <div className="col-span-2 flex items-center gap-3">
                  <input type="checkbox" id="isPublished" checked={editPost.isPublished}
                    onChange={e => setEditPost({ ...editPost, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded" />
                  <Label htmlFor="isPublished" className="cursor-pointer">Publish immediately (visible to all visitors)</Label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPost(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Article"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
