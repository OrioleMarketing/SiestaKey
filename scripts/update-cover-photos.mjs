/**
 * Update cover photos for all claimed businesses.
 * Run: node scripts/update-cover-photos.mjs
 */
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

// Map of business ID → new cover photo URL (compressed webp CDN URLs)
const updates = [
  {
    id: 150081,
    name: "Beach to Bay Vacation Rentals",
    coverPhoto: "https://d2xsxph8kpxj0f.cloudfront.net/310519663047046836/LgGdfsvMFzrUmENex4CRQA/cover_beach_to_bay-iuooGnJcPstrPJPscX3ntE.webp",
  },
  {
    id: 180012,
    name: "BLVD Beachwear",
    coverPhoto: "https://d2xsxph8kpxj0f.cloudfront.net/310519663047046836/LgGdfsvMFzrUmENex4CRQA/cover_blvd_beachwear-7EnMwYHKqhScrGfHCSz9u9.webp",
  },
  {
    id: 150083,
    name: "Gertrude Rentals",
    coverPhoto: "https://d2xsxph8kpxj0f.cloudfront.net/310519663047046836/LgGdfsvMFzrUmENex4CRQA/cover_gertrude_rentals-UdGEiYxWt9dNR4chRwBY2j.webp",
  },
  {
    id: 150076,
    name: "iTrip Vacations Sarasota & Venice",
    coverPhoto: "https://d2xsxph8kpxj0f.cloudfront.net/310519663047046836/LgGdfsvMFzrUmENex4CRQA/cover_itrip_vacations-6MfUHmfXJrqbEfaqP4YZQE.webp",
  },
  {
    id: 12,
    name: "Kayaking SRQ Tours & Rentals",
    coverPhoto: "https://d2xsxph8kpxj0f.cloudfront.net/310519663047046836/LgGdfsvMFzrUmENex4CRQA/cover_kayaking_srq-6T7NE87jVXLKaEJjckoNCf.webp",
  },
  {
    id: 240005,
    name: "Key Sailing Charters",
    coverPhoto: "https://d2xsxph8kpxj0f.cloudfront.net/310519663047046836/LgGdfsvMFzrUmENex4CRQA/cover_key_sailing-FkGgiEhYhPL75RM4JamMKM.webp",
  },
  {
    id: 240019,
    name: "LeBarge Tropical Cruises",
    coverPhoto: "https://d2xsxph8kpxj0f.cloudfront.net/310519663047046836/LgGdfsvMFzrUmENex4CRQA/cover_lebarge_cruises-Xz33z83G968ZdZ3etFAZkV.webp",
  },
  {
    id: 240018,
    name: "Sarasota Bay Explorers",
    coverPhoto: "https://d2xsxph8kpxj0f.cloudfront.net/310519663047046836/LgGdfsvMFzrUmENex4CRQA/cover_sarasota_bay_explorers-9Djrojz7hgQGeZLSCFzk5F.webp",
  },
  {
    id: 150067,
    name: "Siesta 4 Rent",
    coverPhoto: "https://d2xsxph8kpxj0f.cloudfront.net/310519663047046836/LgGdfsvMFzrUmENex4CRQA/cover_siesta_4_rent-oE8jEXWdY7BQosr8myEShr.webp",
  },
  {
    id: 270001,
    name: "siesta 4 rent (duplicate)",
    coverPhoto: "https://d2xsxph8kpxj0f.cloudfront.net/310519663047046836/LgGdfsvMFzrUmENex4CRQA/cover_siesta4rent_beach-doSoWwBAqXEmBUZ934ZqR6.webp",
  },
  {
    id: 240022,
    name: "Siesta Key Jet Ski",
    coverPhoto: "https://d2xsxph8kpxj0f.cloudfront.net/310519663047046836/LgGdfsvMFzrUmENex4CRQA/cover_siesta_key_jet_ski-TeQzPs3fC3hLW2s87rq8Y6.webp",
  },
  {
    id: 150075,
    name: "SkyRun Vacation Rentals",
    coverPhoto: "https://d2xsxph8kpxj0f.cloudfront.net/310519663047046836/LgGdfsvMFzrUmENex4CRQA/cover_skyrun_vacations-75GsPd4uzgUJgmbngz9LcR.webp",
  },
  // Oriole Marketing (id: 60001) already has a real cover photo — skip
];

console.log(`Updating cover photos for ${updates.length} businesses...`);

for (const biz of updates) {
  await conn.execute(
    "UPDATE businesses SET coverPhoto = ? WHERE id = ?",
    [biz.coverPhoto, biz.id]
  );
  console.log(`  ✅ ${biz.name} (id: ${biz.id})`);
}

console.log(`\nDone! ${updates.length} businesses updated.`);
await conn.end();
