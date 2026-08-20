/**
 * POST /api/scheduled/sync-chamber-events
 *
 * Called by the AGENT cron weekly. The agent scrapes the Chamber events page,
 * parses the events, and POSTs a JSON array here. This handler upserts new
 * events and removes stale past events for the Chamber business.
 *
 * Auth: Authorization: Bearer <SCHEDULED_TASK_SECRET>
 */
import { timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import { getDb } from "./db";
import { businessEvents, businesses } from "../drizzle/schema";
import { eq, and, lt } from "drizzle-orm";

export type ChamberEventPayload = {
  title: string;
  description?: string;
  startDate?: string; // ISO 8601
  endDate?: string;
  location?: string;
  type?: "event" | "announcement";
  sourceUrl?: string;
};

export async function syncChamberEventsHandler(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const expectedSecret = process.env.SCHEDULED_TASK_SECRET ?? "";
    const authorization = req.get("authorization") ?? "";
    const suppliedSecret = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    const expected = Buffer.from(expectedSecret);
    const supplied = Buffer.from(suppliedSecret);
    const authorized = expected.length > 0 && expected.length === supplied.length && timingSafeEqual(expected, supplied);
    if (!authorized) {
      res.status(403).json({ error: "scheduled-task authorization failed" });
      return;
    }

    const events: ChamberEventPayload[] = req.body?.events ?? [];

    if (!Array.isArray(events)) {
      res.status(400).json({ error: "body.events must be an array" });
      return;
    }

    const db = await getDb();
    if (!db) {
      res.status(500).json({ error: "database unavailable" });
      return;
    }

    // 2. Find the Chamber business (slug: siesta-key-chamber-of-commerce)
    const [chamber] = await db
      .select({ id: businesses.id })
      .from(businesses)
      .where(eq(businesses.slug, "siesta-key-chamber-of-commerce"))
      .limit(1);

    if (!chamber) {
      res.status(404).json({ error: "Chamber business not found" });
      return;
    }

    const businessId = chamber.id;

    // 3. Remove past events for the Chamber (startDate < now)
    const now = new Date().toISOString();
    await db
      .delete(businessEvents)
      .where(
        and(
          eq(businessEvents.businessId, businessId),
          lt(businessEvents.startDate, now)
        )
      );

    // 4. Upsert incoming events — match by title to avoid duplicates
    let upserted = 0;
    let skipped = 0;

    for (const ev of events) {
      if (!ev.title?.trim()) {
        skipped++;
        continue;
      }

      // Check if an event with this title already exists for the Chamber
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
        // Update existing event
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
      } else {
        // Insert new event
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
      }
      upserted++;
    }

    console.log(
      `[ChamberSync] upserted=${upserted} skipped=${skipped} removed_past=true`
    );

    res.json({
      ok: true,
      upserted,
      skipped,
      businessId,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[ChamberSync] Error:", err);
    res.status(500).json({
      error: String(err),
      stack: err instanceof Error ? err.stack : undefined,
      context: { url: req.url, taskUid: "unknown" },
      timestamp: new Date().toISOString(),
    });
  }
}
