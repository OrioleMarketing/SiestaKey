/**
 * Direct DB sync of Chamber events — bypasses HTTP auth for manual runs.
 * Usage: node scripts/sync-chamber-direct.mjs
 */
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { eq, and, lt } from "drizzle-orm";
import * as schema from "../drizzle/schema.js";

const { businessEvents, businesses } = schema;

const CHAMBER_SLUG = "siesta-key-chamber-of-commerce";

const events = [
  {
    title: "Using AI on Your Smartphone",
    description:
      "Artificial Intelligence is no longer limited to computers and research labs — it's now available right on your smartphone. In this interactive workshop, participants will learn how to use AI tools such as ChatGPT, Google Gemini, and other AI tools directly from their mobile devices to simplify everyday tasks. No technical background is required. Presented by Osher Lifelong Learning Institute (OLLI). Fee: $20.",
    startDate: "2026-06-18T11:00:00-04:00",
    endDate: "2026-06-18T12:30:00-04:00",
    location: "Ringling College Museum Campus, 1001 S. Tamiami Trail, Sarasota, FL 34236",
    type: "event",
  },
  {
    title: "Business Card Exchange | Step Into the Spotlight: Networking at Showtime Realty",
    description:
      "Come on out for after-hours networking with members and guests of the Siesta Key Chamber of Commerce at Showtime Realty! Bring plenty of business cards and get ready to make new connections with fellow professionals from the Siesta Key business community. This casual networking event is a great opportunity to build relationships, share ideas, and learn more about local businesses while enjoying light refreshments in a relaxed setting. Members - $10, Non-members - $20.",
    startDate: "2026-06-18T17:00:00-04:00",
    endDate: "2026-06-18T18:30:00-04:00",
    location: "Showtime Realty, Siesta Key, FL",
    type: "event",
  },
  {
    title: "The Times They Are Changing Music Show featuring Karlus Trapp",
    description:
      "Songs of protest and revolution — music that inspires awareness and action. From 'Blowin' in the Wind' to 'Mercy, Mercy Me (The Ecology)' and 'What the World Needs Now is Love,' these timeless classics resonate today. Experience the power of these moving songs brought to life by musicologist and entertainer Karlus Trapp. Presented by OLLI. Fee: $20.",
    startDate: "2026-06-26T13:00:00-04:00",
    endDate: "2026-06-26T14:30:00-04:00",
    location: "Ringling College Museum Campus, 1001 S. Tamiami Trail, Sarasota, FL 34236",
    type: "event",
  },
  {
    title: "Can You Tell When a Financial Panic is Coming?",
    description:
      "Is the next financial disaster on its way? In the last 200 years, the United States has had 10 financial panics — more than any industrialized country in the world, except for Argentina — with one common feature. Most never saw them coming. This lecture will explain how financial disasters are created, who is responsible, and what you can do to prepare for the next one. Drawn from Thomas Vartanian's book, 200 Years of American Financial Panics. Presented by OLLI. Fee: $15.",
    startDate: "2026-07-02T14:00:00-04:00",
    endDate: "2026-07-02T15:30:00-04:00",
    location: "Ringling College Museum Campus, 1001 S. Tamiami Trail, Sarasota, FL 34236",
    type: "event",
  },
  {
    title: "Siesta Key Fourth of July Fireworks",
    description:
      "Join us for the 35th annual Siesta Key Fourth of July Fireworks on Saturday July 4, 2026 at Siesta Beach. This year's celebration is especially meaningful as we honor 250 years of American independence during the America250 Semiquincentennial. The Siesta Key Fireworks display is 100% funded by the generosity of local residents, businesses, and community supporters. Fireworks launch at dusk.",
    startDate: "2026-07-04T20:00:00-04:00",
    endDate: "2026-07-04T21:30:00-04:00",
    location: "Siesta Beach, Siesta Key, FL",
    type: "event",
  },
  {
    title: "Business Card Exchange | The Power of Connection",
    description:
      "Join the Siesta Key Chamber of Commerce for a meaningful Business Card Exchange hosted at Senior Friendship Centers, a nonprofit that has been strengthening connections and enriching lives across Southwest Florida for more than 50 years. Enjoy an engaging evening of conversation, relationship-building, and community impact as local professionals come together to exchange business cards, share ideas, and strengthen partnerships. Members - $10, Non-Members - $20.",
    startDate: "2026-07-16T17:00:00-04:00",
    endDate: "2026-07-16T18:30:00-04:00",
    location: "Senior Friendship Centers, Sarasota, FL",
    type: "event",
  },
  {
    title: "Rise & Brine | Networking Breakfast",
    description:
      "Start your morning with fresh energy and fresh connections at the Siesta Key Chamber of Commerce Networking Breakfast — Rise & Brine: Morning Networking on the Half Shell. The world is your oyster — and your network should be too. Join fellow Chamber members for a high-energy yet relaxed morning of connection. Sip your coffee and kick-start your day alongside local business leaders and community partners. Members - $25, Non-members - $35.",
    startDate: "2026-08-05T08:00:00-04:00",
    endDate: "2026-08-05T09:30:00-04:00",
    location: "Siesta Key Oyster Bar, Siesta Key, FL",
    type: "event",
  },
  {
    title: "Business Card Exchange | Glow & Grow",
    description:
      "Connect, refresh, and glow at the Siesta Key Chamber of Commerce Business Card Exchange, hosted at The Face of Paris, a premier day spa offering customized skincare in the heart of Sarasota. This unique networking event invites local professionals to step into a space dedicated to self-care while building meaningful business connections. Bring your business cards and unwind as you connect with fellow Chamber members. Members - $10, Non-Members - $20.",
    startDate: "2026-08-20T17:00:00-04:00",
    endDate: "2026-08-20T18:30:00-04:00",
    location: "The Face of Paris, Sarasota, FL",
    type: "event",
  },
  {
    title: "Scarecrow Stroll 2026",
    description:
      "The Siesta Key Scarecrow Stroll is a family-friendly seasonal event where homemade scarecrows created by local businesses adorn storefronts on Siesta Key. Come on out to the Key to stroll, dine, or shop, and enjoy the scarecrow displays throughout the month of October during regular business hours. Vote for your favorite scarecrow! Online voting is open October 1 - October 31. Winner will be announced November 2, 2026. Connect on social with #SiestaScarecrowStroll.",
    startDate: "2026-10-01T00:00:00-04:00",
    endDate: "2026-10-31T23:59:00-04:00",
    location: "Siesta Key, FL",
    type: "event",
  },
  {
    title: "Paws & Perks | Networking Breakfast",
    description:
      "Start your morning with purpose at Paws & Perks, a Networking Breakfast hosted at the Humane Society of Sarasota County and in celebration of National Adopt a Shelter Dog Month! Enjoy breakfast and coffee while building valuable connections and learning more about the Humane Society's life-saving work in our community. Guests will have the opportunity to hear about adoption programs, volunteer initiatives, and ways businesses can engage in supporting animal welfare. Members - $25, Non-members - $35.",
    startDate: "2026-10-07T08:00:00-04:00",
    endDate: "2026-10-07T09:30:00-04:00",
    location: "Humane Society of Sarasota County, Sarasota, FL",
    type: "event",
  },
];

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const db = drizzle(connection, { schema, mode: "default" });

  // Find Chamber business
  const [chamber] = await db
    .select({ id: businesses.id })
    .from(businesses)
    .where(eq(businesses.slug, CHAMBER_SLUG))
    .limit(1);

  if (!chamber) {
    console.error("Chamber business not found!");
    process.exit(1);
  }

  const businessId = chamber.id;
  console.log(`Chamber business ID: ${businessId}`);

  // Remove past events (startDate < now)
  const now = new Date().toISOString();
  const deleted = await db
    .delete(businessEvents)
    .where(
      and(
        eq(businessEvents.businessId, businessId),
        lt(businessEvents.startDate, now)
      )
    );
  console.log(`Removed past events`);

  // Upsert each event
  let upserted = 0;
  let updated = 0;

  for (const ev of events) {
    const [existing] = await db
      .select({ id: businessEvents.id })
      .from(businessEvents)
      .where(
        and(
          eq(businessEvents.businessId, businessId),
          eq(businessEvents.title, ev.title.trim())
        )
      )
      .limit(1);

    if (existing) {
      await db
        .update(businessEvents)
        .set({
          description: ev.description ?? null,
          startDate: ev.startDate ?? null,
          endDate: ev.endDate ?? null,
          location: ev.location ?? null,
          type: ev.type ?? "event",
          isPublished: true,
        })
        .where(eq(businessEvents.id, existing.id));
      updated++;
      console.log(`  UPDATED: ${ev.title}`);
    } else {
      await db.insert(businessEvents).values({
        businessId,
        title: ev.title.trim(),
        description: ev.description ?? null,
        startDate: ev.startDate ?? null,
        endDate: ev.endDate ?? null,
        location: ev.location ?? null,
        type: ev.type ?? "event",
        isPublished: true,
      });
      upserted++;
      console.log(`  INSERTED: ${ev.title}`);
    }
  }

  console.log(`\nDone! Inserted: ${upserted}, Updated: ${updated}`);

  // Show final count
  const all = await db
    .select({ id: businessEvents.id, title: businessEvents.title, startDate: businessEvents.startDate })
    .from(businessEvents)
    .where(eq(businessEvents.businessId, businessId));
  console.log(`\nTotal Chamber events in DB: ${all.length}`);
  for (const e of all) {
    console.log(`  [${e.id}] ${e.title} — ${e.startDate}`);
  }

  await connection.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
