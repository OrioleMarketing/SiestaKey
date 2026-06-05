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
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FileSpreadsheet,
  Lock,
  LogIn,
  MessageSquare,
  Pencil,
  Plus,
  Star,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { CsvImportTab } from "./AdminCsvImport";
import { useState, useEffect } from "react";
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
  });

  const updateBusiness = trpc.admin.updateBusiness.useMutation({
    onSuccess: () => { toast.success("Listing saved"); onSaved(); onClose(); },
    onError: () => toast.error("Save failed"),
  });

  const set = (field: string, value: unknown) => setForm(f => ({ ...f, [field]: value }));
  const setHour = (day: string, val: string) => setForm(f => ({ ...f, hours: { ...f.hours, [day]: val } }));
  const setSocial = (key: string, val: string) => setForm(f => ({ ...f, socialLinks: { ...f.socialLinks, [key]: val } }));

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

  const toggle = (id: number, field: "isFeatured" | "isSponsored" | "isActive", current: boolean) => {
    updateBusiness.mutate({ id, [field]: !current });
  };

  const setTier = (id: number, tier: "free" | "featured" | "sponsored") => {
    updateBusiness.mutate({ id, tier });
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
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{businesses?.length ?? 0} listings</p>
        <Button className="btn-ocean h-8 text-xs gap-1" onClick={() => setShowAdd(true)}>
          <Plus className="w-3.5 h-3.5" /> Add Listing
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Business</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Tier</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Featured</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Sponsored</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Active</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Claimed</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {businesses?.map((b, i) => (
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
                  <div title="Admin override — changes tier in DB only, no payment triggered">
                    <Select
                      value={b.tier}
                      onValueChange={(v) => setTier(b.id, v as "free" | "featured" | "sponsored")}
                    >
                      <SelectTrigger className="w-36 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free (no charge)</SelectItem>
                        <SelectItem value="featured">Gulf Breeze (no charge)</SelectItem>
                        <SelectItem value="sponsored">Island Premier (no charge)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">Admin override</p>
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
                  onClick={() => updateStatus.mutate({ id: s.id, status: "rejected", origin: window.location.origin })}
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" />
                  Reject
                </Button>
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
    </div>
  );
}

// ─── Claims Tab ─────────────────────────────────────────────────────────────────
function ClaimsTab() {
  const utils = trpc.useUtils();
  const { data: claims, isLoading } = trpc.admin.listClaims.useQuery();
  const approveMutation = trpc.admin.approveClaim.useMutation({
    onSuccess: () => utils.admin.listClaims.invalidate(),
  });
  const rejectMutation = trpc.admin.rejectClaim.useMutation({
    onSuccess: () => utils.admin.listClaims.invalidate(),
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

  return (
    <div className="space-y-3">
      {claims?.map((c) => (
        <Card key={c.id} className="card-coastal">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-foreground">{c.businessName}</span>
                  {c.ghlWebhookSent && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                      <CheckCircle2 className="w-3 h-3" /> GHL Sent
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
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <a
                  href={`mailto:${c.email}`}
                  className="inline-flex items-center gap-1 text-xs text-ocean hover:underline"
                >
                  Reply <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  onClick={() =>
                    approveMutation.mutate({
                      claimId: c.id,
                      businessId: c.businessId ?? undefined,
                      claimEmail: c.email,
                    })
                  }
                  disabled={approveMutation.isPending}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <CheckCircle2 className="w-3 h-3" /> Approve
                </button>
                <button
                  onClick={() =>
                    rejectMutation.mutate({ claimId: c.id })
                  }
                  disabled={rejectMutation.isPending}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {claims?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">No claim leads yet.</div>
      )}
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
        </Tabs>
      </div>
    </div>
  );
}
