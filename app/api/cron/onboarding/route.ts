import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { getDb } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import {
  dueForOnboarding,
  suggestTool,
  type OnboardingDay,
} from "@/lib/onboarding/due";
import {
  sendOnboardingDay2,
  sendOnboardingDay5,
} from "@/lib/onboarding/notify";

// The two emails that follow a signup: a tip on day 2, and what the account
// gives on day 5.
//
// Hourly, like the trial reminder, and for the same reason: the window is two
// hours wide, so the first run that matches sends and the column stops every
// run after it. The guardrail test holds the window against this schedule.
//
// Both emails can be refused, which no other message in this codebase can.
// The opt-out is read in the query (lib/onboarding/due.ts), never here: a
// filter that lives in the caller is a filter somebody forgets in the next
// caller.

export const dynamic = "force-dynamic";

const DAYS: OnboardingDay[] = [2, 5];

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  // Fails closed. An unprotected endpoint that sends mail is a way for
  // anyone to mail every new account on demand.
  if (!secret) {
    console.error("[cron] CRON_SECRET is not set; refusing to run");
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  const result: Record<string, { due: number; sent: number }> = {};

  for (const day of DAYS) {
    const due = await dueForOnboarding(day);
    let sent = 0;

    for (const row of due) {
      // What each email needs in order to be worth sending. Day 2 needs
      // something they have not tried; day 5 needs a figure of their own.
      // Without it the column is still claimed, because the moment has
      // passed and holding the row open would mail them a week late.
      const tool = day === 2 ? suggestTool(row.untried) : null;
      const worth = day === 2 ? tool !== null : row.words > 0;

      try {
        if (worth) {
          if (day === 2 && tool) {
            await sendOnboardingDay2({
              to: row.email,
              userId: row.userId,
              locale: row.locale,
              appUrl,
              tool,
            });
          } else if (day === 5) {
            await sendOnboardingDay5({
              to: row.email,
              userId: row.userId,
              locale: row.locale,
              appUrl,
              words: row.words,
            });
          }
          sent += 1;
        }

        // Written only once the send has returned, so a failure is retried
        // by the next run rather than swallowed.
        await getDb()
          .update(users)
          .set(
            day === 2
              ? { onboardingDay2SentAt: new Date() }
              : { onboardingDay5SentAt: new Date() },
          )
          .where(eq(users.id, row.userId));
      } catch (error) {
        // One bad address must not stop the rest of the batch.
        console.error(`[cron] onboarding day ${day} failed for ${row.userId}`);
        Sentry.captureException(error);
      }
    }

    result[`day${day}`] = { due: due.length, sent };
  }

  return NextResponse.json(result);
}
