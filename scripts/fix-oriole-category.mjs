import { createConnection } from "mysql2/promise";

const db = await createConnection(process.env.DATABASE_URL);

// Dump all categories
const [cats] = await db.query("SELECT id, name, slug FROM categories ORDER BY id");
console.log("=== Categories ===");
cats.forEach(c => console.log(`  id=${c.id}  name="${c.name}"  slug="${c.slug}"`));

// Find Services category
const servicesCat = cats.find(c =>
  c.name.toLowerCase().includes("service") || c.slug.toLowerCase().includes("service")
);
console.log("\nServices category:", servicesCat);

if (servicesCat) {
  await db.query(
    "UPDATE businesses SET categoryId = ? WHERE slug = 'oriole-marketing-llc'",
    [servicesCat.id]
  );
  console.log(`\nUpdated Oriole Marketing categoryId to ${servicesCat.id} (${servicesCat.name})`);
} else {
  console.log("\nNo 'Services' category found — listing all categories above for manual check");
}

await db.end();
