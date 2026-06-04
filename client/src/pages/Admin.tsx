import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import {
  AlertCircle,
  BarChart3,
  Building2,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  Lock,
  LogIn,
  Star,
  Users,
  XCircle,
} from "lucide-react";
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

// ─── Businesses Tab ─────────────────────────────────────────────────────────────
function BusinessesTab() {
  const { data: businesses, isLoading, refetch } = trpc.admin.listBusinesses.useQuery();
  const updateBusiness = trpc.admin.updateBusiness.useMutation({
    onSuccess: () => {
      toast.success("Listing updated");
      refetch();
    },
    onError: () => toast.error("Update failed"),
  });

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
                <Select
                  value={b.tier}
                  onValueChange={(v) => setTier(b.id, v as "free" | "featured" | "sponsored")}
                >
                  <SelectTrigger className="w-32 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="sponsored">Sponsored</SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => toggle(b.id, "isFeatured", b.isFeatured)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-colors ${
                    b.isFeatured
                      ? "bg-ocean text-white"
                      : "bg-muted text-muted-foreground hover:bg-ocean/20"
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
                    b.isSponsored
                      ? "bg-amber-500 text-white"
                      : "bg-muted text-muted-foreground hover:bg-amber-100"
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
                    b.isActive
                      ? "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground hover:bg-green-100"
                  }`}
                  title={b.isActive ? "Deactivate" : "Activate"}
                >
                  {b.isActive ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                </button>
              </td>
              <td className="px-4 py-3 text-center">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                    b.isClaimed
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {b.isClaimed ? "Claimed" : "Unclaimed"}
                </span>
              </td>
              <td className="px-4 py-3">
                <a
                  href={`/business/${b.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-ocean hover:underline"
                >
                  View <ExternalLink className="w-3 h-3" />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {businesses?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">No businesses found.</div>
      )}
    </div>
  );
}

// ─── Submissions Tab ────────────────────────────────────────────────────────────
function SubmissionsTab() {
  const { data: submissions, isLoading, refetch } = trpc.admin.listSubmissions.useQuery();
  const updateStatus = trpc.admin.updateSubmission.useMutation({
    onSuccess: () => {
      toast.success("Status updated");
      refetch();
    },
    onError: () => toast.error("Update failed"),
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
      {submissions?.map((s) => (
        <Card key={s.id} className="card-coastal">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-foreground">{s.businessName}</span>
                  <StatusBadge status={s.status} />
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
                  <div className="text-xs text-muted-foreground/70 mt-1">
                    Submitted {new Date(s.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-700 border-green-200 hover:bg-green-50 h-8 text-xs"
                  disabled={s.status === "approved" || updateStatus.isPending}
                  onClick={() => updateStatus.mutate({ id: s.id, status: "approved" })}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-700 border-red-200 hover:bg-red-50 h-8 text-xs"
                  disabled={s.status === "rejected" || updateStatus.isPending}
                  onClick={() => updateStatus.mutate({ id: s.id, status: "rejected" })}
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {submissions?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">No submissions yet.</div>
      )}
    </div>
  );
}

// ─── Claims Tab ─────────────────────────────────────────────────────────────────
function ClaimsTab() {
  const { data: claims, isLoading } = trpc.admin.listClaims.useQuery();

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
              <a
                href={`mailto:${c.email}`}
                className="inline-flex items-center gap-1 text-xs text-ocean hover:underline flex-shrink-0"
              >
                Reply <ExternalLink className="w-3 h-3" />
              </a>
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
        <Tabs defaultValue="businesses">
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
        </Tabs>
      </div>
    </div>
  );
}
