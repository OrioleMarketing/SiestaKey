import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  CheckCircle2,
  Download,
  FileSpreadsheet,
  RefreshCw,
  Upload,
  XCircle,
} from "lucide-react";

// ─── CSV Template ──────────────────────────────────────────────────────────────
const CSV_COLUMNS = [
  "name",
  "slug",
  "category",
  "area",
  "phone",
  "email",
  "website",
  "address",
  "shortDescription",
  "description",
  "tier",
  "lat",
  "lng",
  "tags",
  "facebook",
  "instagram",
  "twitter",
  "yelp",
  "tripadvisor",
  "rating",
  "reviewCount",
  "mondayHours",
  "tuesdayHours",
  "wednesdayHours",
  "thursdayHours",
  "fridayHours",
  "saturdayHours",
  "sundayHours",
] as const;

const EXAMPLE_ROW = [
  "The Beach Shack",
  "", // slug auto-generated from name if blank
  "Dining",
  "Siesta Key Village",
  "(941) 555-0100",
  "info@beachshack.com",
  "https://beachshack.com",
  "1234 Ocean Blvd, Siesta Key, FL 34242",
  "Casual beachside dining with fresh seafood.",
  "Full description of the business goes here.",
  "free", // free | featured | sponsored
  "27.2683",
  "-82.5455",
  "seafood,casual,outdoor seating",
  "https://facebook.com/beachshack",
  "https://instagram.com/beachshack",
  "",
  "https://yelp.com/biz/beach-shack",
  "",
  "4.5",
  "120",
  "11am-9pm",
  "11am-9pm",
  "11am-9pm",
  "11am-9pm",
  "11am-10pm",
  "10am-10pm",
  "10am-9pm",
];

const VALID_CATEGORIES = [
  "Dining",
  "Shopping",
  "Activities",
  "Services",
  "Nightlife",
  "Wellness",
  "Accommodations",
  "Real Estate",
];

const VALID_TIERS = ["free", "featured", "sponsored"];

type ParsedRow = Record<string, string>;

interface ValidationError {
  row: number;
  col: string;
  message: string;
}

interface ImportResult {
  row: number;
  action: "created" | "updated" | "error";
  name: string;
  error?: string;
}

// ─── CSV Parser ────────────────────────────────────────────────────────────────
function parseCsv(text: string): { headers: string[]; rows: ParsedRow[] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseRow(lines[0]).map((h) => h.trim());
  const rows: ParsedRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseRow(lines[i]);
    const row: ParsedRow = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? "";
    });
    rows.push(row);
  }
  return { headers, rows };
}

// ─── Validate rows ─────────────────────────────────────────────────────────────
function validateRows(headers: string[], rows: ParsedRow[]): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check required columns exist
  const missing = ["name", "category"].filter((c) => !headers.includes(c));
  if (missing.length > 0) {
    errors.push({
      row: 0,
      col: "headers",
      message: `Missing required columns: ${missing.join(", ")}`,
    });
    return errors;
  }

  rows.forEach((row, i) => {
    const rowNum = i + 2; // 1-indexed + header row
    if (!row.name?.trim()) {
      errors.push({ row: rowNum, col: "name", message: "Name is required" });
    }
    if (!row.category?.trim()) {
      errors.push({ row: rowNum, col: "category", message: "Category is required" });
    } else {
      const valid = VALID_CATEGORIES.some(
        (c) => c.toLowerCase() === row.category.toLowerCase()
      );
      if (!valid) {
        errors.push({
          row: rowNum,
          col: "category",
          message: `Invalid category "${row.category}". Must be one of: ${VALID_CATEGORIES.join(", ")}`,
        });
      }
    }
    if (row.tier && !VALID_TIERS.includes(row.tier)) {
      errors.push({
        row: rowNum,
        col: "tier",
        message: `Invalid tier "${row.tier}". Must be: free, featured, or sponsored`,
      });
    }
    if (row.rating && isNaN(parseFloat(row.rating))) {
      errors.push({ row: rowNum, col: "rating", message: "Rating must be a number" });
    }
    if (row.reviewCount && isNaN(parseInt(row.reviewCount, 10))) {
      errors.push({ row: rowNum, col: "reviewCount", message: "Review count must be an integer" });
    }
  });

  return errors;
}

// ─── Download Template ─────────────────────────────────────────────────────────
function downloadTemplate() {
  const header = CSV_COLUMNS.join(",");
  const example = EXAMPLE_ROW.map((v) => (v.includes(",") ? `"${v}"` : v)).join(",");
  const csv = `${header}\n${example}\n`;
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "siesta_key_directory_import_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ─── CsvImportTab Component ────────────────────────────────────────────────────
export function CsvImportTab() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [importResults, setImportResults] = useState<ImportResult[] | null>(null);
  const [importSummary, setImportSummary] = useState<{
    created: number;
    updated: number;
    errors: number;
  } | null>(null);

  const utils = trpc.useUtils();
  const importMutation = trpc.admin.bulkImportBusinesses.useMutation({
    onSuccess: (data) => {
      setImportResults(data.results);
      setImportSummary({ created: data.created, updated: data.updated, errors: data.errors });
      // Refresh the Listings tab so newly imported businesses appear immediately
      utils.admin.listBusinesses.invalidate();
      utils.admin.stats.invalidate();
      if (data.errors === 0) {
        toast.success(
          `Import complete: ${data.created} created, ${data.updated} updated`
        );
      } else {
        toast.warning(
          `Import finished with ${data.errors} error(s): ${data.created} created, ${data.updated} updated`
        );
      }
    },
    onError: (err) => {
      toast.error(`Import failed: ${err.message}`);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setImportResults(null);
    setImportSummary(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const { headers: h, rows } = parseCsv(text);
      setHeaders(h);
      setParsedRows(rows);
      setValidationErrors(validateRows(h, rows));
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (parsedRows.length === 0) return;
    const rows = parsedRows.map((row) => ({
      name: row.name ?? "",
      slug: row.slug || undefined,
      category: row.category ?? "",
      area: row.area || undefined,
      phone: row.phone || undefined,
      email: row.email || undefined,
      website: row.website || undefined,
      address: row.address || undefined,
      shortDescription: row.shortDescription || undefined,
      description: row.description || undefined,
      tier: (row.tier as "free" | "featured" | "sponsored") || undefined,
      lat: row.lat || undefined,
      lng: row.lng || undefined,
      tags: row.tags || undefined,
      facebook: row.facebook || undefined,
      instagram: row.instagram || undefined,
      twitter: row.twitter || undefined,
      yelp: row.yelp || undefined,
      tripadvisor: row.tripadvisor || undefined,
      rating: row.rating || undefined,
      reviewCount: row.reviewCount || undefined,
      mondayHours: row.mondayHours || undefined,
      tuesdayHours: row.tuesdayHours || undefined,
      wednesdayHours: row.wednesdayHours || undefined,
      thursdayHours: row.thursdayHours || undefined,
      fridayHours: row.fridayHours || undefined,
      saturdayHours: row.saturdayHours || undefined,
      sundayHours: row.sundayHours || undefined,
    }));
    importMutation.mutate({ rows });
  };

  const handleReset = () => {
    setFileName(null);
    setHeaders([]);
    setParsedRows([]);
    setValidationErrors([]);
    setImportResults(null);
    setImportSummary(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const hasErrors = validationErrors.length > 0;
  const previewCols = headers.slice(0, 8); // show first 8 columns in preview

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-semibold text-foreground">Bulk CSV Import</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Upload a CSV to create or update multiple listings at once. Existing slugs are
            updated; new slugs are created.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-2">
          <Download className="w-4 h-4" />
          Download Template
        </Button>
      </div>

      {/* File picker */}
      <div
        className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-ocean/50 hover:bg-ocean/5 transition-colors"
        onClick={() => fileRef.current?.click()}
      >
        <FileSpreadsheet className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        {fileName ? (
          <p className="font-medium text-foreground">{fileName}</p>
        ) : (
          <p className="text-muted-foreground">
            Click to select a <span className="font-semibold text-ocean">.csv</span> file
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {parsedRows.length > 0
            ? `${parsedRows.length} row${parsedRows.length !== 1 ? "s" : ""} detected`
            : "Supports create and update (matched by slug)"}
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Validation errors */}
      {hasErrors && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-2">
          <div className="flex items-center gap-2 text-red-700 font-medium text-sm">
            <XCircle className="w-4 h-4" />
            {validationErrors.length} validation error{validationErrors.length !== 1 ? "s" : ""} found
          </div>
          <ul className="space-y-1">
            {validationErrors.map((e, i) => (
              <li key={i} className="text-xs text-red-600">
                {e.row === 0 ? "Header" : `Row ${e.row}`} — <span className="font-mono">{e.col}</span>: {e.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Preview table */}
      {parsedRows.length > 0 && !hasErrors && !importResults && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              Preview — {parsedRows.length} row{parsedRows.length !== 1 ? "s" : ""}
              {parsedRows.length > 5 && (
                <span className="text-muted-foreground font-normal ml-1">(showing first 5)</span>
              )}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={handleImport}
                disabled={importMutation.isPending}
                className="gap-1.5 bg-ocean hover:bg-ocean/90 text-white"
              >
                {importMutation.isPending ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                {importMutation.isPending ? "Importing…" : `Import ${parsedRows.length} Rows`}
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-3 py-2 text-left text-muted-foreground font-medium">#</th>
                  {previewCols.map((col) => (
                    <th key={col} className="px-3 py-2 text-left text-muted-foreground font-medium whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                  {headers.length > 8 && (
                    <th className="px-3 py-2 text-left text-muted-foreground font-medium">
                      +{headers.length - 8} more
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {parsedRows.slice(0, 5).map((row, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-3 py-2 text-muted-foreground">{i + 2}</td>
                    {previewCols.map((col) => (
                      <td key={col} className="px-3 py-2 max-w-[180px] truncate" title={row[col]}>
                        {row[col] || <span className="text-muted-foreground/50">—</span>}
                      </td>
                    ))}
                    {headers.length > 8 && <td className="px-3 py-2 text-muted-foreground">…</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Import results */}
      {importResults && importSummary && (
        <div className="space-y-4">
          {/* Summary badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Import complete
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              {importSummary.created} created
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              {importSummary.updated} updated
            </Badge>
            {importSummary.errors > 0 && (
              <Badge className="bg-red-100 text-red-800 border-red-200">
                {importSummary.errors} errors
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={handleReset} className="ml-auto gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              Import Another
            </Button>
          </div>

          {/* Per-row results */}
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-3 py-2 text-left text-muted-foreground font-medium">Row</th>
                  <th className="px-3 py-2 text-left text-muted-foreground font-medium">Business Name</th>
                  <th className="px-3 py-2 text-left text-muted-foreground font-medium">Result</th>
                  <th className="px-3 py-2 text-left text-muted-foreground font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {importResults.map((r, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 text-muted-foreground">{r.row}</td>
                    <td className="px-3 py-2 font-medium">{r.name}</td>
                    <td className="px-3 py-2">
                      {r.action === "created" && (
                        <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Created</Badge>
                      )}
                      {r.action === "updated" && (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">Updated</Badge>
                      )}
                      {r.action === "error" && (
                        <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">Error</Badge>
                      )}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {r.error || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Category reference */}
      <div className="rounded-xl bg-muted/40 border border-border p-4 text-xs text-muted-foreground space-y-1">
        <p className="font-medium text-foreground text-sm mb-2">Quick Reference</p>
        <p><span className="font-medium">Required columns:</span> name, category</p>
        <p><span className="font-medium">Valid categories:</span> {VALID_CATEGORIES.join(" · ")}</p>
        <p><span className="font-medium">Valid tiers:</span> free · featured · sponsored</p>
        <p><span className="font-medium">Upsert logic:</span> If a row's slug matches an existing listing, it is updated. Otherwise a new listing is created.</p>
        <p><span className="font-medium">Tags:</span> Comma-separated values in the tags column (e.g. <span className="font-mono">seafood,outdoor,casual</span>)</p>
        <p><span className="font-medium">Hours:</span> Use mondayHours through sundayHours columns (e.g. <span className="font-mono">11am-9pm</span> or <span className="font-mono">Closed</span>)</p>
      </div>
    </div>
  );
}
