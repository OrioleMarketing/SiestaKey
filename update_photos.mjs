import mysql from "mysql2/promise";

const url = process.env.DATABASE_URL;
if (!url) { console.error("No DATABASE_URL"); process.exit(1); }

const conn = await mysql.createConnection(url);

const updates = [
  {
    slug: "cbs-saltwater-outfitters",
    photos: [
      "/manus-storage/cbs-storefront_47cb5e41.jpg",
      "/manus-storage/cbs-boat-rentals_9ab93732.jpg",
      "/manus-storage/cbs-tackle-shop_56738753.jpg",
    ],
  },
  {
    slug: "the-hub-baja-grill",
    photos: [
      "/manus-storage/hub-evening-exterior_35a07115.jpg",
      "/manus-storage/hub-outdoor-dining_34820a8f.jpg",
      "/manus-storage/hub-daytime_f711b53b.jpg",
    ],
  },
  {
    slug: "the-salty-dog",
    photos: [
      "/manus-storage/saltydogbar-exterior_b3721a7d.jpg",
      "/manus-storage/saltydogbar-sign_4e08412e.jpg",
      "/manus-storage/saltydogbar-interior_4b530abc.jpg",
    ],
  },
  {
    slug: "palm-bay-club",
    photos: [
      "/manus-storage/palmbayclub-aerial_34dd9013.jpg",
      "/manus-storage/palmbayclub-courtyard_c15b6448.jpeg",
      "/manus-storage/palmbayclub-sunset_c28f1396.jpg",
    ],
  },
  {
    slug: "siesta-key-chamber-of-commerce",
    photos: [
      "/manus-storage/chamber-banner_b77ba38d.jpg",
      "/manus-storage/chamber-logo-wide_c4f751c0.jpg",
    ],
  },
  {
    slug: "olafs-siesta-village",
    photos: [
      "/manus-storage/olafs-sign_107afccf.jpg",
      "/manus-storage/olafs-storefront_4145ac25.jpg",
      "/manus-storage/olafs-kids_8ddc80eb.jpg",
    ],
  },
];

for (const { slug, photos } of updates) {
  const [result] = await conn.execute(
    "UPDATE businesses SET photos = ? WHERE slug = ?",
    [JSON.stringify(photos), slug]
  );
  console.log(`${slug}: ${result.affectedRows} row(s) updated`);
}

await conn.end();
console.log("Done.");
