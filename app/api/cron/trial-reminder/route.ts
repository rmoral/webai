import * as Sentry from "@sentry/nextjs";
import { and, eq, gte, isNull, lte } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { sendTrialReminder } from "@/lib/billing/notify";
import { PRICES } from "@/lib/billing/plans";
import { getDb } from "@/lib/db/client";
import { subscriptions, users } from "@/lib/db/schema";
import { isLocale, routing } from "@/lib/i18n/routing";

// The 24-hour warning before a trial converts.
//
// This has to be ours. Stripe's customer.subscription.trial_will_end fires
// three days before the end, so on a three-day trial it arrives at the
// moment the trial is created -- both useless and actively misleading. The
// design document flags this twice because it is the easy mistake, and it
// is the one that costs most: the warning is what stops the charge being a
// surprise, and a surprise charge is a dispute.
//
// Runs once a day (vercel.json), which is what a Vercel Hobby account
// allows -- an hourly schedule is refused at deploy time.
//
// The window is exactly one day wide and starts one day out, so it tiles
// the timeline: between two runs the distance to a given trial_end drops by
// exactly 24 hours, so each trial falls inside [24h, 48h] on exactly one
// run. Nobody is skipped and nobody is mailed twice, and the
// trialReminderSentAt mark covers the boundary case where a trial sits
// exactly on 24 or 48 hours.
//
// The cost is precision: the warning lands somewhere between one and two
// days before the charge rather than at 24 hours. That is why the email
// states the date instead of saying "tomorrow" -- see emails/trial-reminder.

export const dynamic = "force-dynamic";

const HOUR = 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  // Fails closed. An unprotected endpoint that sends mail is a way for
  // anyone to mail every trialing customer on demand.
  if (!secret) {
    console.error("[cron] CRON_SECRET is not set; refusing to run");
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const now = Date.now();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;

  const due = await getDb()
    .select({
      userId: subscriptions.userId,
      trialEnd: subscriptions.trialEnd,
      email: users.email,
      locale: users.locale,
    })
    .from(subscriptions)
    .innerJoin(users, eq(users.id, subscriptions.userId))
    .where(
      and(
        eq(subscriptions.status, "trialing"),
        isNull(subscriptions.trialReminderSentAt),
        gte(subscriptions.trialEnd, new Date(now + 24 * HOUR)),
        lte(subscriptions.trialEnd, new Date(now + 48 * HOUR)),
      ),
    );

  let sent = 0;
  for (const row of due) {
    if (!row.trialEnd) continue;
    try {
      await sendTrialReminder({
        to: row.email,
        locale: isLocale(row.locale) ? row.locale : routing.defaultLocale,
        appUrl,
        trialEnd: row.trialEnd,
        amount: PRICES.unlimited.monthly.amount,
      });
      // Marked only once the send has returned, so a failure is retried by
      // the next run rather than swallowed.
      await getDb()
        .update(subscriptions)
        .set({ trialReminderSentAt: new Date() })
        .where(eq(subscriptions.userId, row.userId));
      sent += 1;
    } catch (error) {
      // One bad address must not stop the rest of the batch.
      console.error(`[cron] trial reminder failed for ${row.userId}`);
      Sentry.captureException(error);
    }
  }

  return NextResponse.json({ due: due.length, sent });
}
