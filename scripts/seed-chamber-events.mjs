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
  host, port: parseInt(port), user, password, database,
  ssl: { rejectUnauthorized: false }
});

const CHAMBER_ID = 30005;

// 1. Verify Chamber tier (sponsored = Island Premier in businesses table)
const [chamberRows] = await conn.execute("SELECT id, name, tier FROM businesses WHERE id = ?", [CHAMBER_ID]);
console.log("Chamber record:", chamberRows[0]);
// The businesses table uses 'sponsored' as the Island Premier tier value — no upgrade needed.

// 2. Define all 8 upcoming events scraped from the Chamber site
const now = Date.now();
const events = [
  {
    businessId: CHAMBER_ID,
    type: "event",
    title: "ChatGPT — Your Brainstorming and Reflection Partner",
    description: "Curious how to use AI in a meaningful way to enhance life? This hands-on class introduces ChatGPT for brainstorming, problem-solving, and exploring habit change. Learn how to set up a free account, choose topics, and ask effective questions. Fee: $15. Presented by Osher Lifelong Learning Institute (OLLI).",
    startDate: "2026-06-09T13:00:00",
    endDate: "2026-06-09T14:20:00",
    location: "Ringling College Museum Campus, 1001 S. Tamiami Trail, Sarasota, FL 34236",
    imageUrl: null,
    isPublished: 1,
  },
  {
    businessId: CHAMBER_ID,
    type: "event",
    title: "Tree Fort Toasts — Curated Wine Tasting & Film Experience",
    description: "A curated wine tasting paired with the perfect film. Great date night or gals night out. Tickets at treefortproductions.com.",
    startDate: "2026-06-13T18:00:00",
    endDate: "2026-06-13T21:00:00",
    location: "Siesta Key",
    imageUrl: null,
    isPublished: 1,
  },
  {
    businessId: CHAMBER_ID,
    type: "event",
    title: "Using AI on Your Smartphone",
    description: "AI is now available right on your smartphone. Learn how to use ChatGPT, Google Gemini, and other AI tools directly from your mobile device to simplify everyday tasks. No technical background required. Bring your smartphone. Fee: $20. Presented by OLLI.",
    startDate: "2026-06-18T11:00:00",
    endDate: "2026-06-18T12:30:00",
    location: "Ringling College Museum Campus, 1001 S. Tamiami Trail, Sarasota, FL 34236",
    imageUrl: null,
    isPublished: 1,
  },
  {
    businessId: CHAMBER_ID,
    type: "event",
    title: "Business Card Exchange | Step Into the Spotlight: Networking at Showtime Realty",
    description: "After-hours networking with members and guests of the Siesta Key Chamber of Commerce at Showtime Realty. Bring plenty of business cards and enjoy light refreshments. Members: $10 / Non-members: $20. Members encouraged to bring a door prize.",
    startDate: "2026-06-18T17:00:00",
    endDate: "2026-06-18T18:30:00",
    location: "Showtime Realty, Siesta Key",
    imageUrl: null,
    isPublished: 1,
  },
  {
    businessId: CHAMBER_ID,
    type: "event",
    title: "The Times They Are Changing — Music Show featuring Karlus Trapp",
    description: "Songs of protest and revolution — music that inspires awareness and action. From 'Blowin' in the Wind' to 'Mercy, Mercy Me' and 'What the World Needs Now is Love.' Experience these timeless classics brought to life by musicologist and entertainer Karlus Trapp. Fee: $20. Presented by OLLI.",
    startDate: "2026-06-26T13:00:00",
    endDate: "2026-06-26T14:30:00",
    location: "Ringling College Museum Campus, 1001 S. Tamiami Trail, Sarasota, FL 34236",
    imageUrl: null,
    isPublished: 1,
  },
  {
    businessId: CHAMBER_ID,
    type: "event",
    title: "Can You Tell When a Financial Panic is Coming?",
    description: "In the last 200 years, the US has had 10 financial panics. Most never saw them coming. This lecture explains how financial disasters are created, who is responsible, and what you can do to prepare. Based on Thomas Vartanian's book '200 Years of American Financial Panics.' Fee: $15. Presented by OLLI.",
    startDate: "2026-07-02T14:00:00",
    endDate: "2026-07-02T15:30:00",
    location: "Ringling College Museum Campus, 1001 S. Tamiami Trail, Sarasota, FL 34236",
    imageUrl: null,
    isPublished: 1,
  },
  {
    businessId: CHAMBER_ID,
    type: "event",
    title: "Siesta Key Fourth of July Fireworks",
    description: "Join us for the 35th annual Siesta Key Fourth of July Fireworks on Siesta Beach — one of the community's most cherished traditions, bringing thousands together on the white sands to celebrate freedom, unity, and hometown pride. This year honors 250 years of American independence. Fireworks launch at dusk. 100% funded by the community.",
    startDate: "2026-07-04T20:00:00",
    endDate: "2026-07-04T21:30:00",
    location: "Siesta Beach, Siesta Key, FL",
    imageUrl: null,
    isPublished: 1,
  },
  {
    businessId: CHAMBER_ID,
    type: "event",
    title: "Business Card Exchange | The Power of Connection",
    description: "Networking event hosted at Senior Friendship Centers — a nonprofit strengthening connections across Southwest Florida for 50+ years. Connect with fellow professionals while learning about an organization vital to supporting seniors. Members: $10 / Non-members: $20. Bring a door prize.",
    startDate: "2026-07-16T17:00:00",
    endDate: "2026-07-16T18:30:00",
    location: "Senior Friendship Centers, Sarasota, FL",
    imageUrl: null,
    isPublished: 1,
  },
  {
    businessId: CHAMBER_ID,
    type: "event",
    title: "Rise & Brine | Networking Breakfast",
    description: "Start your morning with fresh energy and fresh connections. The world is your oyster — and your network should be too. Join fellow Chamber members for a high-energy yet relaxed morning of coffee and connection with local business leaders. Members: $25 / Non-members: $35. Bring a door prize.",
    startDate: "2026-08-05T08:00:00",
    endDate: "2026-08-05T09:30:00",
    location: "Siesta Key Oyster Bar, Siesta Key",
    imageUrl: null,
    isPublished: 1,
  },
  {
    businessId: CHAMBER_ID,
    type: "event",
    title: "Business Card Exchange | Glow & Grow",
    description: "Connect, refresh, and glow at this networking event hosted at The Face of Paris, a premier day spa in the heart of Sarasota. A relaxed after-hours atmosphere perfect for sparking new partnerships. Members: $10 / Non-members: $20. Bring a door prize.",
    startDate: "2026-08-20T17:00:00",
    endDate: "2026-08-20T18:30:00",
    location: "The Face of Paris Day Spa, Sarasota, FL",
    imageUrl: null,
    isPublished: 1,
  },
];

// 3. Delete any existing Chamber events to avoid duplicates
const [delResult] = await conn.execute(
  "DELETE FROM business_events WHERE businessId = ?",
  [CHAMBER_ID]
);
console.log(`🗑️  Deleted ${delResult.affectedRows} existing Chamber events`);

// 4. Insert all events
for (const ev of events) {
  await conn.execute(
    `INSERT INTO business_events (businessId, type, title, description, startDate, endDate, location, imageUrl, isPublished)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      ev.businessId,
      ev.type,
      ev.title,
      ev.description,
      ev.startDate,
      ev.endDate ?? null,
      ev.location ?? null,
      ev.imageUrl ?? null,
      ev.isPublished,
    ]
  );
  console.log(`✅ Inserted: ${ev.title}`);
}

console.log(`\n🎉 Done! ${events.length} Chamber events inserted.`);
await conn.end();
