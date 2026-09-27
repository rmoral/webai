import { and, eq, isNull } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { verifyOptOutToken } from "@/lib/email/optout";

// The one write behind both ways of unsubscribing: the page a person
// confirms on, and the one-click POST that Gmail and Yahoo require of bulk
// senders. Kept here so the two cannot drift apart -- the awkward failure
// being the one where the visible link works and the header's does not,
// which is invisible until a mailbox provider starts filtering us.

/** False when the token does not verify. Doing nothing counts as done. */
export async function applyOptOut(token: string): Promise<boolean> {
  const userId = verifyOptOutToken(token);
  if (!userId) return false;

  // Conditional, so the date stays the date they first asked: clicking the
  // link twice is not a second request.
  await getDb()
    .update(users)
    .set({ marketingOptOutAt: new Date() })
    .where(and(eq(users.id, userId), isNull(users.marketingOptOutAt)));

  return true;
}
