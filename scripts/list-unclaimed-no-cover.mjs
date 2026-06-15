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

const [rows] = await conn.execute(`
  SELECT b.id, b.name, b.description, b.shortDescription, c.name as categoryName, c.slug as categorySlug
  FROM businesses b
  LEFT JOIN categories c ON c.id = b.categoryId
  WHERE b.isClaimed = 0
    AND b.isActive = 1
    AND (
      b.coverPhoto IS NULL
      OR b.coverPhoto LIKE '%SiestaKey_panorama%'
      OR b.coverPhoto LIKE '%LifeguardStand%'
    )
  ORDER BY c.name, b.name ASC
`);

console.log(`Total unclaimed businesses needing covers: ${rows.length}`);

const byCategory = {};
for (const r of rows) {
  const cat = r.categoryName || "Unknown";
  if (!byCategory[cat]) byCategory[cat] = [];
  byCategory[cat].push(r);
}

for (const [cat, items] of Object.entries(byCategory)) {
  console.log(`\n[${cat}] — ${items.length} businesses`);
  for (const b of items) {
    const desc = (b.shortDescription || b.description || "").substring(0, 70);
    console.log(`  ${b.id}: ${b.name} — ${desc}`);
  }
}

// Output as JSON for use in the generation script
import { writeFileSync } from "fs";
writeFileSync("/home/ubuntu/unclaimed_no_cover.json", JSON.stringify(rows, null, 2));
console.log("\nSaved to /home/ubuntu/unclaimed_no_cover.json");

await conn.end();
