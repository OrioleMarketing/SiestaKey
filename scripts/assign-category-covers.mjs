import { createConnection } from "mysql2/promise";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const DATABASE_URL = process.env.DATABASE_URL;
const match = DATABASE_URL.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
const [, user, password, host, port, database] = match;
const conn = await createConnection({ host, port: parseInt(port), user, password, database, ssl: { rejectUnauthorized: false } });

// CDN URLs for each category cover image (compressed webp for performance)
const COVERS = {
  // Dining sub-themes
  dining_seafood: "https://d2xsxph8kpxj0f.cloudfront.net/310519663047046836/LgGdfsvMFzrUmENex4CRQA/cat_dining_seafood-7wUpchgMcaLAnuBZcKFCJy.webp",
  dining_cafe: "https://d2xsxph8kpxj0f.cloudfront.net/310519663047046836/LgGdfsvMFzrUmENex4CRQA/cat_dining_cafe-6ZowQz8x7RTYoXctA95Tz7.webp",
  dining_pizza: "https://d2xsxph8kpxj0f.cloudfront.net/310519663047046836/LgGdfsvMFzrUmENex4CRQA/cat_dining_pizza-hhgVdTRJTgXcYVLBmNNtku.webp",
  dining_finedining: "https://d2xsxph8kpxj0f.cloudfront.net/310519663047046836/LgGdfsvMFzrUmENex4CRQA/cat_dining_finedining-moMhaxmAGkDKy43Lgyx4Hq.webp",
  dining_mexican: "https://d2xsxph8kpxj0f.cloudfront.net/310519663047046836/LgGdfsvMFzrUmENex4CRQA/cat_dining_mexican-ZWjgRtwscEYj6vTPXsQrZo.webp",
  dining_bargrill: "https://d2xsxph8kpxj0f.cloudfront.net/310519663047046836/LgGdfsvMFzrUmENex4CRQA/cat_dining_bargrill-NmGX2CaidSREynp2wPRT75.webp",
  dining_coffee: "https://d2xsxph8kpxj0f.cloudfront.net/310519663047046836/LgGdfsvMFzrUmENex4CRQA/cat_dining_coffee-PHMJGDt5jxkiMcMm8BxuwX.webp",
  dining_waterfront: "https://d2xsxph8kpxj0f.cloudfront.net/310519663047046836/LgGdfsvMFzrUmENex4CRQA/cat_dining_waterfront-EZAdrs8PNFrVwZEHnEK9Bq.webp",
  // Accommodations sub-themes
  accom_beachcondo: "https://d2xsxph8kpxj0f.cloudfront.net/310519663047046836/LgGdfsvMFzrUmENex4CRQA/cat_accom_beachcondo-5EuxHuRNLB4NdDNhbgunb5.webp",
  accom_vacationhome: "https://d2xsxph8kpxj0f.cloudfront.net/310519663047046836/LgGdfsvMFzrUmENex4CRQA/cat_accom_vacationhome-V6hAoBrGvghuRzqEhvxHQP.webp",
  accom_resort: "https://d2xsxph8kpxj0f.cloudfront.net/310519663047046836/LgGdfsvMFzrUmENex4CRQA/cat_accom_resort-BzZY5ysV278Grb5poFMFtY.webp",
  accom_bayview: "https://d2xsxph8kpxj0f.cloudfront.net/310519663047046836/LgGdfsvMFzrUmENex4CRQA/cat_accom_bayview-WeTEQDExZfgAQozKpjPjRG.webp",
  // Activities sub-themes
  activities_watersports: "https://d2xsxph8kpxj0f.cloudfront.net/310519663047046836/LgGdfsvMFzrUmENex4CRQA/cat_activities_watersports-H5F3zDR7ptGmqTDqUuQoyb.webp",
  activities_parasail: "https://d2xsxph8kpxj0f.cloudfront.net/310519663047046836/LgGdfsvMFzrUmENex4CRQA/cat_activities_parasail-E2dteXoGqkG58CsZQ22pi9.webp",
  activities_fishing: "https://d2xsxph8kpxj0f.cloudfront.net/310519663047046836/LgGdfsvMFzrUmENex4CRQA/cat_activities_fishing-LmkY3C25vRB9CtAdvHLAcD.webp",
  activities_dolphin: "https://d2xsxph8kpxj0f.cloudfront.net/310519663047046836/LgGdfsvMFzrUmENex4CRQA/cat_activities_dolphin-UBTBL5DGzqa95aFFgQsmDX.webp",
  // Shopping sub-themes
  shopping_boutique: "https://d2xsxph8kpxj0f.cloudfront.net/310519663047046836/LgGdfsvMFzrUmENex4CRQA/cat_shopping_boutique-H575UBssmE6neH7FXarfn2.webp",
  shopping_beachgear: "https://d2xsxph8kpxj0f.cloudfront.net/310519663047046836/LgGdfsvMFzrUmENex4CRQA/cat_shopping_beachgear-3ZVow3uZx7ssYmCXCAk8ri.webp",
  shopping_jewelry: "https://d2xsxph8kpxj0f.cloudfront.net/310519663047046836/LgGdfsvMFzrUmENex4CRQA/cat_shopping_jewelry-VzZ5Zfe6wXbWUxYQEJPKdH.webp",
  // Other categories
  nightlife_tikibar: "https://d2xsxph8kpxj0f.cloudfront.net/310519663047046836/LgGdfsvMFzrUmENex4CRQA/cat_nightlife_tikibar-4Wa7eMSK3Yvh4HYLANX4Wj.webp",
  wellness_spa: "https://d2xsxph8kpxj0f.cloudfront.net/310519663047046836/LgGdfsvMFzrUmENex4CRQA/cat_wellness_spa-AA3FenRNwvB4VKsssFS4S6.webp",
  realestate: "https://d2xsxph8kpxj0f.cloudfront.net/310519663047046836/LgGdfsvMFzrUmENex4CRQA/cat_realestate-hCyscQtyTnrSP93MPYqWQr.webp",
  services_salon: "https://d2xsxph8kpxj0f.cloudfront.net/310519663047046836/LgGdfsvMFzrUmENex4CRQA/cat_services_salon-HLE77RbHrwR85hvGHjVmbW.webp",
};

// Smart keyword-based assignment function
function assignCover(business) {
  const text = `${business.name} ${business.description || ""} ${business.shortDescription || ""}`.toLowerCase();
  const cat = (business.categoryName || "").toLowerCase();

  // Nightlife
  if (cat === "nightlife" || text.includes("daiquiri") || text.includes("nightlife") || text.includes("bar") && text.includes("live music")) {
    return COVERS.nightlife_tikibar;
  }

  // Real Estate
  if (cat === "real estate" || text.includes("real estate") || text.includes("realty")) {
    return COVERS.realestate;
  }

  // Services
  if (cat === "services" || text.includes("salon") || text.includes("hair") || text.includes("blonding")) {
    return COVERS.services_salon;
  }

  // Wellness
  if (cat === "wellness" || text.includes("spa") || text.includes("massage") || text.includes("sauna") || text.includes("infrared") || text.includes("facial")) {
    return COVERS.wellness_spa;
  }

  // Shopping sub-themes
  if (cat === "shopping") {
    if (text.includes("jewelry") || text.includes("jewels") || text.includes("jewel") || text.includes("bracelet") || text.includes("necklace") || text.includes("repair") || text.includes("keepsake") || text.includes("consignment") || text.includes("estate sale") || text.includes("apparel") || text.includes("clothing") || text.includes("boutique") || text.includes("fashion") || text.includes("women") || text.includes("dress")) {
      // Jewelry/gifts vs boutique clothing
      if (text.includes("jewelry") || text.includes("jewels") || text.includes("jewel") || text.includes("bracelet") || text.includes("necklace") || text.includes("repair") || text.includes("keepsake") || text.includes("consignment") || text.includes("estate")) {
        return COVERS.shopping_jewelry;
      }
      return COVERS.shopping_boutique;
    }
    // Beach gear, swimwear, souvenirs
    return COVERS.shopping_beachgear;
  }

  // Activities sub-themes
  if (cat === "activities") {
    if (text.includes("parasail") || text.includes("parasailing")) return COVERS.activities_parasail;
    if (text.includes("fish") || text.includes("charter") || text.includes("angling")) return COVERS.activities_fishing;
    if (text.includes("dolphin") || text.includes("eco-tour") || text.includes("eco tour") || text.includes("wildlife") || text.includes("cruise") || text.includes("boat tour")) return COVERS.activities_dolphin;
    // Default activities = watersports
    return COVERS.activities_watersports;
  }

  // Accommodations sub-themes
  if (cat === "accommodations") {
    if (text.includes("resort") || text.includes("hotel") || text.includes("inn") || text.includes("club")) return COVERS.accom_resort;
    if (text.includes("bay") || text.includes("marina") || text.includes("waterway") || text.includes("sarasota bay")) return COVERS.accom_bayview;
    if (text.includes("home") || text.includes("house") || text.includes("villa") || text.includes("cottage") || text.includes("pool")) return COVERS.accom_vacationhome;
    // Default accommodations = beach condo
    return COVERS.accom_beachcondo;
  }

  // Dining sub-themes
  if (cat === "dining") {
    if (text.includes("coffee") || text.includes("cafe") && (text.includes("roast") || text.includes("espresso") || text.includes("latte"))) return COVERS.dining_coffee;
    if (text.includes("breakfast") || text.includes("brunch") || text.includes("cafe") || text.includes("mango") || text.includes("garden")) return COVERS.dining_cafe;
    if (text.includes("pizza") || text.includes("pi pizza") || text.includes("ripfire")) return COVERS.dining_pizza;
    if (text.includes("mexican") || text.includes("cuba") || text.includes("latin") || text.includes("taco") || text.includes("fajita") || text.includes("margarita") || text.includes("tex-mex")) return COVERS.dining_mexican;
    if (text.includes("fine dining") || text.includes("gourmet") || text.includes("award-winning") || text.includes("elegant") || text.includes("upscale") || text.includes("wagyu") || text.includes("steak")) return COVERS.dining_finedining;
    if (text.includes("bar") || text.includes("grill") || text.includes("pub") || text.includes("tiki") || text.includes("rum")) return COVERS.dining_bargrill;
    if (text.includes("waterfront") || text.includes("bay") || text.includes("marina") || text.includes("dock") || text.includes("ophelia") || text.includes("turtle")) return COVERS.dining_waterfront;
    // Default dining = seafood (most common on Siesta Key)
    return COVERS.dining_seafood;
  }

  // Fallback: use beach condo as generic coastal image
  return COVERS.accom_beachcondo;
}

// Get all unclaimed businesses needing covers
const [rows] = await conn.execute(`
  SELECT b.id, b.name, b.description, b.shortDescription, c.name as categoryName
  FROM businesses b
  LEFT JOIN categories c ON c.id = b.categoryId
  WHERE b.isClaimed = 0
    AND b.isActive = 1
    AND (
      b.coverPhoto IS NULL
      OR b.coverPhoto LIKE '%SiestaKey_panorama%'
      OR b.coverPhoto LIKE '%LifeguardStand%'
    )
`);

console.log(`Assigning covers to ${rows.length} businesses...`);

let updated = 0;
const batchSize = 50;
for (let i = 0; i < rows.length; i += batchSize) {
  const batch = rows.slice(i, i + batchSize);
  for (const biz of batch) {
    const url = assignCover(biz);
    await conn.execute(`UPDATE businesses SET coverPhoto = ? WHERE id = ?`, [url, biz.id]);
    updated++;
  }
  console.log(`  Progress: ${Math.min(i + batchSize, rows.length)}/${rows.length}`);
}

console.log(`\nDone! Updated ${updated} businesses with category cover photos.`);

// Summary by cover type
const summary = {};
for (const biz of rows) {
  const url = assignCover(biz);
  const key = Object.entries(COVERS).find(([, v]) => v === url)?.[0] || "unknown";
  summary[key] = (summary[key] || 0) + 1;
}
console.log("\nAssignment summary:");
for (const [k, v] of Object.entries(summary).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k}: ${v}`);
}

await conn.end();
