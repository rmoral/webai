import { createHmac, timingSafeEqual } from "node:crypto";

// The link that stops the onboarding emails, and the proof that the person
// clicking it is the person the email was sent to.
//
// It has to work without a session: the email may be opened on a phone that
// is not signed in, months later, and an unsubscribe that asks you to log in
// first is an unsubscribe that does not work. So the link carries a signed
// user id instead of a database row -- nothing to store, nothing to expire,
// and nothing an attacker can enumerate, because a user id without the
// signature is refused.
//
// Nothing in here imports the app: node's crypto and nothing else. That is
// what lets the same signing be called from a page, a cron, an email and a
// test process that has no Next transform to resolve next-intl for it.
//
// Deliberately without an expiry. Somebody who finds a year-old email must
// still be able to get off the list; a dead link would leave them with no
// way but writing to us, which is exactly the friction the law is about.

/**
 * Domain separation.
 *
 * The secret is shared with the IP hashing, and reusing a key for two
 * purposes is only safe when the two can never produce the same input. The
 * prefix is what guarantees that: no IP hash can collide with a token, and
 * no token can be replayed as one.
 *
 * Reusing the secret rather than adding a variable is a deliberate choice:
 * every new required variable is one more thing that can be missing in
 * production, and the README already documents what a missing one costs.
 */
const PURPOSE = "email-optout:v1:";

/** 128 bits, which is plenty for a value that only ever gates one write. */
const SIGNATURE_LENGTH = 22;

function sign(userId: string): string {
  const secret = process.env.IP_HASH_SECRET;
  if (!secret) throw new Error("IP_HASH_SECRET is not set");
  return createHmac("sha256", secret)
    .update(`${PURPOSE}${userId}`)
    .digest("base64url")
    .slice(0, SIGNATURE_LENGTH);
}

export function optOutToken(userId: string): string {
  return `${userId}.${sign(userId)}`;
}

/** The user the token names, or null for anything that fails to verify. */
export function verifyOptOutToken(token: string): string | null {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const userId = token.slice(0, dot);
  const given = Buffer.from(token.slice(dot + 1));
  let expected: Buffer;
  try {
    expected = Buffer.from(sign(userId));
  } catch {
    // Misconfigured server. Refusing is the only safe answer, and the
    // caller reports it: silently accepting would opt people out on an
    // unsigned link.
    return null;
  }
  if (given.length !== expected.length) return null;
  return timingSafeEqual(given, expected) ? userId : null;
}
