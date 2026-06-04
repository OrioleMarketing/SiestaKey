import { createConnection } from "mysql2/promise";

const db = await createConnection(process.env.DATABASE_URL);

// Check if slug already exists
const [existing] = await db.query(
  "SELECT id FROM businesses WHERE slug = ? LIMIT 1",
  ["oriole-marketing-llc"]
);

if (existing.length > 0) {
  console.log("Listing already exists, business id:", existing[0].id);
  await db.end();
  process.exit(0);
}

const desc =
  "Proven to ruthlessly increase customers, sales, and leads — Oriole Marketing will turn your brand's voice into a powerful roar using AI-Powered Digital Strategies focused on personalized, results-driven solutions!";
const shortDesc =
  "AI-powered digital marketing agency — results-driven solutions for local businesses.";

const [result] = await db.query(
  `INSERT INTO businesses
    (slug, name, categoryId, description, shortDescription, address, area, phone, website, email, isActive, isFeatured, isSponsored, isClaimed, tier)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    "oriole-marketing-llc",
    "Oriole Marketing LLC",
    6,
    desc,
    shortDesc,
    "7662 Gunsmith Court, Plainfield, IN 46168",
    "Siesta Key Village",
    "(317) 868-6834",
    "https://oriolemarketing.com",
    "Bruce@OrioleMarketing.com",
    1, // isActive
    1, // isFeatured
    1, // isSponsored
    0, // isClaimed
    "sponsored",
  ]
);

const newId = result.insertId;
console.log("Created Oriole Marketing business, id:", newId);

// Update the submission record to link it
await db.query(
  "UPDATE listing_submissions SET createdBusinessId = ?, createdBusinessSlug = ? WHERE id = 1",
  [newId, "oriole-marketing-llc"]
);
console.log("Submission #1 updated with createdBusinessId =", newId);

await db.end();
