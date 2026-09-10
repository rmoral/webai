import * as Sentry from "@sentry/nextjs";
import { sql } from "drizzle-orm";

import type { ToolId } from "@/lib/ai/tools";
import { getDb } from "@/lib/db/client";
import { usageDaily } from "@/lib/db/schema";

// Fire-and-forget accounting per CLAUDE.md: every AI request lands in
// usage_daily. Must never break a stream, hence the broad catch.
export async function recordUsage(entry: {
  subjectKey: string;
  userId: string | null;
  tool: ToolId;
  wordsIn: number;
  wordsOut: number;
  costCents: number;
}): Promise<void> {
  if (!process.env.DATABASE_URL) return; // dev without DB

  try {
    const db = getDb();
    await db
      .insert(usageDaily)
      .values({
        subjectKey: entry.subjectKey,
        userId: entry.userId,
        date: new Date().toISOString().slice(0, 10),
        tool: entry.tool,
        wordsIn: entry.wordsIn,
        wordsOut: entry.wordsOut,
        requests: 1,
        costCents: entry.costCents,
      })
      .onConflictDoUpdate({
        target: [usageDaily.subjectKey, usageDaily.date, usageDaily.tool],
        set: {
          wordsIn: sql`${usageDaily.wordsIn} + ${entry.wordsIn}`,
          wordsOut: sql`${usageDaily.wordsOut} + ${entry.wordsOut}`,
          requests: sql`${usageDaily.requests} + 1`,
          costCents: sql`${usageDaily.costCents} + ${entry.costCents}`,
        },
      });
  } catch (error) {
    Sentry.captureException(error);
  }
}
