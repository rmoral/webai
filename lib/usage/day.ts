// The clock the daily allowance runs on, and nothing else.
//
// Its own module because both halves of the product need it and they
// cannot share the other one: lib/usage/quotas.ts talks to Redis and to
// Postgres, so importing it from a component would put a database driver
// in the browser bundle. This file imports nothing.

/**
 * Where midnight is.
 *
 * It used to be UTC, by accident rather than by decision: every key was
 * built from `toISOString()`. Nobody was told, so "500 words a day" meant
 * a day that ended at 01:00 or 02:00 local time for the market this is
 * sold to, and no screen could say when the count resets because nothing
 * in the code knew.
 */
export const QUOTA_TIMEZONE = "Europe/Madrid";

/** The wall clock in the quota's timezone, expressed as if it were UTC. */
function wallClock(date: Date): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: QUOTA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const field = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);

  return new Date(
    Date.UTC(
      field("year"),
      field("month") - 1,
      field("day"),
      // Midnight comes back as hour 24 in some runtimes.
      field("hour") % 24,
      field("minute"),
      field("second"),
    ),
  );
}

/** The calendar day, as the allowance counts it. */
export function quotaDay(date: Date = new Date()): string {
  // en-CA renders YYYY-MM-DD, which is what the keys and the date column
  // already use.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: QUOTA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * When the allowance next refills: the following midnight in the quota's
 * timezone, which is the moment `dailyKey` starts writing a new key.
 *
 * Measured twice on purpose. The offset is read at `now` and applied to an
 * instant up to a day later, which is wrong by an hour on the two nights a
 * year the clocks move -- so the offset is read again at the answer and
 * the answer corrected. Twice a year, an hour, on a sentence that reads
 * "se recargan en 5 h": worth the second call.
 */
export function nextQuotaReset(now: Date = new Date()): Date {
  const wall = wallClock(now);
  const midnight = Date.UTC(
    wall.getUTCFullYear(),
    wall.getUTCMonth(),
    wall.getUTCDate() + 1,
  );

  const instant = (offset: number) => midnight - offset;
  const first = instant(wall.getTime() - now.getTime());
  const corrected = instant(wallClock(new Date(first)).getTime() - first);
  return new Date(corrected);
}

/**
 * Minutes until the allowance refills, rounded up, with a floor of one.
 *
 * Rounded up because "se recargan en 0 min" reads as a bug, and floored
 * for the same reason in the last seconds before midnight.
 */
export function minutesUntilQuotaReset(now: Date = new Date()): number {
  return Math.max(
    1,
    Math.ceil((nextQuotaReset(now).getTime() - now.getTime()) / 60_000),
  );
}
