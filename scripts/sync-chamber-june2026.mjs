/**
 * Sync Chamber events — June 2026 scrape.
 * Uses raw mysql2 (same pattern as seed-chamber-events.mjs).
 * Run: node scripts/sync-chamber-june2026.mjs
 */
import { createConnection } from "mysql2/promise";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL not set");

const match = DATABASE_URL.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
if (!match) throw new Error("Could not parse DATABASE_URL: " + DATABASE_URL);
const [, user, password, host, port, database] = match;

const conn = await createConnection({
  host,
  port: parseInt(port),
  user,
  password,
  database,
  ssl: { rejectUnauthorized: false },
});

const CHAMBER_ID = 30005;
const now = new Date().toISOString().slice(0, 19); // YYYY-MM-DDTHH:MM:SS

// 10 upcoming events scraped from https://my.siestakeychamber.com/events on 2026-06-15
const events = [
  {
    type: "event",
    title: "Using AI on Your Smartphone",
    description:
      "Artificial Intelligence is no longer limited to computers and research labs — it's now available right on your smartphone. In this interactive workshop, participants will learn how to use AI tools such as ChatGPT, Google Gemini, and other AI tools directly from their mobile devices to simplify everyday tasks. No technical background is required. Participants are encouraged to bring their smartphones so they can practice using AI tools during the session. Presented by Osher Lifelong Learning Institute (OLLI). Fee: $20.",
    startDate: "2026-06-18T11:00:00",
    endDate: "2026-06-18T12:30:00",
    location: "Ringling College Museum Campus, 1001 S. Tamiami Trail, Sarasota, FL 34236",
  },
  {
    type: "event",
    title: "Business Card Exchange | Step Into the Spotlight: Networking at Showtime Realty",
    description:
      "Come on out for after-hours networking with members and guests of the Siesta Key Chamber of Commerce at Showtime Realty! Bring plenty of business cards and get ready to make new connections with fellow professionals from the Siesta Key business community. This casual networking event is a great opportunity to build relationships, share ideas, and learn more about local businesses while enjoying light refreshments in a relaxed setting. Members - $10, Non-members - $20.",
    startDate: "2026-06-18T17:00:00",
    endDate: "2026-06-18T18:30:00",
    location: "Showtime Realty, Siesta Key, FL",
  },
  {
    type: "event",
    title: "The Times They Are Changing Music Show featuring Karlus Trapp",
    description:
      "Songs of protest and revolution — music that inspires awareness and action. From 'Blowin' in the Wind' to 'Mercy, Mercy Me (The Ecology)' and 'What the World Needs Now is Love,' these timeless classics resonate today. Experience the power of these moving songs brought to life by musicologist and entertainer Karlus Trapp. Presented by OLLI. Fee: $20.",
    startDate: "2026-06-26T13:00:00",
    endDate: "2026-06-26T14:30:00",
    location: "Ringling College Museum Campus, 1001 S. Tamiami Trail, Sarasota, FL 34236",
  },
  {
    type: "event",
    title: "Can You Tell When a Financial Panic is Coming?",
    description:
      "Is the next financial disaster on its way? In the last 200 years, the United States has had 10 financial panics — more than any industrialized country in the world, except for Argentina — with one common feature. Most never saw them coming. This lecture will explain how financial disasters are created, who is responsible, and what you can do to prepare for the next one. Drawn from Thomas Vartanian's book, 200 Years of American Financial Panics. Presented by OLLI. Fee: $15.",
    startDate: "2026-07-02T14:00:00",
    endDate: "2026-07-02T15:30:00",
    location: "Ringling College Museum Campus, 1001 S. Tamiami Trail, Sarasota, FL 34236",
  },
  {
    type: "event",
    title: "Siesta Key Fourth of July Fireworks",
    description:
      "Join us for the 35th annual Siesta Key Fourth of July Fireworks on Saturday July 4, 2026 at Siesta Beach. This year's celebration is especially meaningful as we honor 250 years of American independence during the America250 Semiquincentennial. The Siesta Key Fireworks display is 100% funded by the generosity of local residents, businesses, and community supporters. Fireworks launch at dusk.",
    startDate: "2026-07-04T20:00:00",
    endDate: "2026-07-04T21:30:00",
    location: "Siesta Beach, Siesta Key, FL",
  },
  {
    type: "event",
    title: "Business Card Exchange | The Power of Connection",
    description:
      "Join the Siesta Key Chamber of Commerce for a meaningful Business Card Exchange hosted at Senior Friendship Centers, a nonprofit that has been strengthening connections and enriching lives across Southwest Florida for more than 50 years. Enjoy an engaging evening of conversation, relationship-building, and community impact as local professionals come together to exchange business cards, share ideas, and strengthen partnerships. Members - $10, Non-Members - $20.",
    startDate: "2026-07-16T17:00:00",
    endDate: "2026-07-16T18:30:00",
    location: "Senior Friendship Centers, Sarasota, FL",
  },
  {
    type: "event",
    title: "Rise & Brine | Networking Breakfast",
    description:
      "Start your morning with fresh energy and fresh connections at the Siesta Key Chamber of Commerce Networking Breakfast — Rise & Brine: Morning Networking on the Half Shell. The world is your oyster — and your network should be too. Join fellow Chamber members for a high-energy yet relaxed morning of connection. Sip your coffee and kick-start your day alongside local business leaders and community partners. Members - $25, Non-members - $35.",
    startDate: "2026-08-05T08:00:00",
    endDate: "2026-08-05T09:30:00",
    location: "Siesta Key Oyster Bar, Siesta Key, FL",
  },
  {
    type: "event",
    title: "Business Card Exchange | Glow & Grow",
    description:
      "Connect, refresh, and glow at the Siesta Key Chamber of Commerce Business Card Exchange, hosted at The Face of Paris, a premier day spa offering customized skincare in the heart of Sarasota. This unique networking event invites local professionals to step into a space dedicated to self-care while building meaningful business connections. Bring your business cards and unwind as you connect with fellow Chamber members. Members - $10, Non-Members - $20.",
    startDate: "2026-08-20T17:00:00",
    endDate: "2026-08-20T18:30:00",
    location: "The Face of Paris, Sarasota, FL",
  },
  {
    type: "event",
    title: "Scarecrow Stroll 2026",
    description:
      "The Siesta Key Scarecrow Stroll is a family-friendly seasonal event where homemade scarecrows created by local businesses adorn storefronts on Siesta Key. Come on out to the Key to stroll, dine, or shop, and enjoy the scarecrow displays throughout the month of October during regular business hours. Vote for your favorite scarecrow! Online voting is open October 1 - October 31. Winner will be announced November 2, 2026. Connect on social with #SiestaScarecrowStroll.",
    startDate: "2026-10-01T00:00:00",
    endDate: "2026-10-31T23:59:00",
    location: "Siesta Key, FL",
  },
  {
    type: "event",
    title: "Paws & Perks | Networking Breakfast",
    description:
      "Start your morning with purpose at Paws & Perks, a Networking Breakfast hosted at the Humane Society of Sarasota County and in celebration of National Adopt a Shelter Dog Month! Enjoy breakfast and coffee while building valuable connections and learning more about the Humane Society's life-saving work in our community. Guests will have the opportunity to hear about adoption programs, volunteer initiatives, and ways businesses can engage in supporting animal welfare. Members - $25, Non-members - $35.",
    startDate: "2026-10-07T08:00:00",
    endDate: "2026-10-07T09:30:00",
    location: "Humane Society of Sarasota County, Sarasota, FL",
  },
];

console.log(`Syncing ${events.length} Chamber events to DB...`);
console.log(`Removing past events (startDate < ${now})...`);

// Remove past events for the Chamber
const [delResult] = await conn.execute(
  "DELETE FROM business_events WHERE businessId = ? AND startDate < ?",
  [CHAMBER_ID, now]
);
console.log(`Removed ${delResult.affectedRows} past events`);

// Upsert each event (update if title matches, insert if new)
let inserted = 0;
let updated = 0;

for (const ev of events) {
  // Check if event with this title already exists
  const [rows] = await conn.execute(
    "SELECT id FROM business_events WHERE businessId = ? AND title = ? LIMIT 1",
    [CHAMBER_ID, ev.title]
  );

  if (rows.length > 0) {
    const existingId = rows[0].id;
    await conn.execute(
      `UPDATE business_events 
       SET description = ?, startDate = ?, endDate = ?, location = ?, type = ?, isPublished = 1
       WHERE id = ?`,
      [ev.description ?? null, ev.startDate, ev.endDate ?? null, ev.location ?? null, ev.type, existingId]
    );
    updated++;
    console.log(`  UPDATED: ${ev.title}`);
  } else {
    await conn.execute(
      `INSERT INTO business_events (businessId, type, title, description, startDate, endDate, location, imageUrl, isPublished)
       VALUES (?, ?, ?, ?, ?, ?, ?, NULL, 1)`,
      [CHAMBER_ID, ev.type, ev.title, ev.description ?? null, ev.startDate, ev.endDate ?? null, ev.location ?? null]
    );
    inserted++;
    console.log(`  INSERTED: ${ev.title}`);
  }
}

console.log(`\nDone! Inserted: ${inserted}, Updated: ${updated}`);

// Show final state
const [finalRows] = await conn.execute(
  "SELECT id, title, startDate FROM business_events WHERE businessId = ? ORDER BY startDate ASC",
  [CHAMBER_ID]
);
console.log(`\nTotal Chamber events in DB: ${finalRows.length}`);
for (const r of finalRows) {
  console.log(`  [${r.id}] ${r.title} — ${r.startDate}`);
}

await conn.end();
