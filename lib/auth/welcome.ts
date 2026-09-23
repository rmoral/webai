import { and, eq, isNull } from "drizzle-orm";
import * as Sentry from "@sentry/nextjs";

import { getDb } from "@/lib/db/client";
import { users } from "@/lib/db/schema";

/**
 * Claims the right to send the welcome email, once per account.
 *
 * A magic link is the same link the tenth time as the first, so nothing
 * in the callback can tell a new account from a returning one by itself.
 * The claim is a conditional update -- set the column only where it is
 * still null -- so two tabs finishing at once, or Supabase replaying the
 * callback, produce one winner and one no-op rather than two emails.
 *
 * Returns false on any failure, because the cost of not sending a welcome
 * is a missing email and the cost of sending it twice is a reader who
 * stops trusting the ones that matter.
 */
export async function claimWelcome(userId: string): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;
  try {
    const claimed = await getDb()
      .update(users)
      .set({ welcomeSentAt: new Date() })
      .where(and(eq(users.id, userId), isNull(users.welcomeSentAt)))
      .returning({ id: users.id });
    return claimed.length > 0;
  } catch (error) {
    Sentry.captureException(error);
    return false;
  }
}
