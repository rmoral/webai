import { and, eq, gt, inArray, isNull, lte, sql } from "drizzle-orm";

import { TOOLS, type ToolId } from "@/lib/ai/tools";
import { ACTIVE_STATUSES } from "@/lib/billing/entitlements";
import { getDb } from "@/lib/db/client";
import { subscriptions, usageDaily, users } from "@/lib/db/schema";
import { isLocale, routing, type Locale } from "@/lib/i18n/routing";

// Who is due an onboarding email, and what it should say to them.
//
// Both emails are chosen from rows we already keep: the signup date, and the
// aggregate usage counts. Nothing here reads a user's text -- CLAUDE.md
// forbids storing any for a free account, and the figures in these emails
// are counts of words, which is all `usage_daily` holds.

const HOUR = 60 * 60 * 1000;

/**
 * The two days, and how wide a window each run looks at.
 *
 * The window and the cron schedule are one decision: narrower than the gap
 * between runs and a signup passes through unseen, much wider and the email
 * arrives a day late. tests/guardrails.test.ts holds both edges against
 * vercel.json, the same way it does for the trial reminder.
 */
export const ONBOARDING = { windowHours: 2 } as const;

export type OnboardingDay = 2 | 5;

export interface DueUser {
  userId: string;
  email: string;
  locale: Locale;
  /** Words processed, every tool, since they signed up. */
  words: number;
  /** Tools with a published landing that they have never run. */
  untried: ToolId[];
}

/**
 * The tool to put in the day-2 email, or null when there is nothing to say.
 *
 * Somebody who has already run all four is activated; a mail telling them
 * to try what they have tried is the one that gets the sender unsubscribed.
 * The order is the order TOOLS declares, which is the order the product
 * leads with -- so a brand-new account is pointed at the humaniser.
 */
export function suggestTool(untried: ToolId[]): ToolId | null {
  const order = Object.values(TOOLS)
    .filter((tool) => tool.landing)
    .map((tool) => tool.id);
  return order.find((id) => untried.includes(id)) ?? null;
}

/**
 * Accounts that signed up `day` days ago and have not had this email.
 *
 * Day 5 leaves out anyone already paying: it is the message that says what
 * the free account gives and what more costs, and sending it to a customer
 * is at best noise. Day 2 goes to everyone, because a tip about the tool is
 * as useful to somebody who paid on the first day.
 *
 * Nobody who has opted out is returned, on either day.
 */
export async function dueForOnboarding(
  day: OnboardingDay,
  now: Date = new Date(),
): Promise<DueUser[]> {
  const sentColumn =
    day === 2 ? users.onboardingDay2SentAt : users.onboardingDay5SentAt;

  const newest = new Date(now.getTime() - day * 24 * HOUR);
  const oldest = new Date(newest.getTime() - ONBOARDING.windowHours * HOUR);

  const rows = await getDb()
    .select({
      userId: users.id,
      email: users.email,
      locale: users.locale,
      plan: subscriptions.plan,
      status: subscriptions.status,
    })
    .from(users)
    .leftJoin(subscriptions, eq(subscriptions.userId, users.id))
    .where(
      and(
        isNull(sentColumn),
        isNull(users.marketingOptOutAt),
        gt(users.createdAt, oldest),
        lte(users.createdAt, newest),
      ),
    );

  const paying = (row: (typeof rows)[number]) =>
    row.plan !== null &&
    row.plan !== "free" &&
    row.status !== null &&
    (ACTIVE_STATUSES as readonly string[]).includes(row.status);

  const candidates = day === 5 ? rows.filter((row) => !paying(row)) : rows;
  if (candidates.length === 0) return [];

  // One grouped query for everybody in the batch rather than a lookup each.
  const usage = await getDb()
    .select({
      userId: usageDaily.userId,
      tool: usageDaily.tool,
      words: sql<number>`coalesce(sum(${usageDaily.wordsIn}), 0)::int`,
    })
    .from(usageDaily)
    .where(
      inArray(
        usageDaily.userId,
        candidates.map((row) => row.userId),
      ),
    )
    .groupBy(usageDaily.userId, usageDaily.tool);

  const byUser = new Map<string, { words: number; used: Set<ToolId> }>();
  for (const row of usage) {
    if (!row.userId) continue;
    const entry = byUser.get(row.userId) ?? { words: 0, used: new Set() };
    entry.words += row.words;
    entry.used.add(row.tool);
    byUser.set(row.userId, entry);
  }

  const landings = Object.values(TOOLS)
    .filter((tool) => tool.landing)
    .map((tool) => tool.id);

  return candidates.map((row) => {
    const entry = byUser.get(row.userId);
    return {
      userId: row.userId,
      email: row.email,
      locale: isLocale(row.locale) ? row.locale : routing.defaultLocale,
      words: entry?.words ?? 0,
      untried: landings.filter((id) => !entry?.used.has(id)),
    };
  });
}
