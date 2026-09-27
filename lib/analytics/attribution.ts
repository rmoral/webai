// Which ad paid for a customer, carried from the click to the charge.
//
// Google measures a paid click in the browser. The sale, three days later,
// is a fact only Stripe knows -- and by then the tab that clicked may be
// closed, the banner may have been refused and an ad blocker may have
// removed the tag altogether. So the click id has to be carried by us:
// recorded where the visitor lands, sent with the subscription, and written
// into the `purchase` row that lib/db/schema.ts already keeps for exactly
// this ("minimal mirror of PostHog events for Ads conversion attribution").
//
// Consent, because this is advertising measurement and not something the
// service needs to work: nothing is read or kept until `ad_storage` is
// granted, and withdrawing it deletes what was kept. A refusal is not a
// blind spot -- Consent Mode keeps modelling those conversions from
// cookieless pings, which is why v2 was implemented.
//
// Nothing here is text the user wrote or anything they typed. A click id is
// Google's own opaque handle for a click on our own ad.

/**
 * The parameters worth keeping, in the order they are written.
 *
 * `gclid` is the Google Ads click. `gbraid` and `wbraid` are what Google
 * sends instead when it cannot set a cookie (iOS, in-app browsers), so a
 * campaign that leaves them out loses its iPhone traffic -- which in Spain
 * is most of it.
 */
export const ATTRIBUTION_FIELDS = [
  "gclid",
  "gbraid",
  "wbraid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

export type AttributionField = (typeof ATTRIBUTION_FIELDS)[number];

export type Attribution = Partial<Record<AttributionField, string>>;

export const ATTRIBUTION_KEY = "vbx:attr";

/** Bumped when the fields change, like the consent record's own version. */
export const ATTRIBUTION_VERSION = 1;

/**
 * How long a stored click stays useful.
 *
 * Google Ads refuses an imported conversion whose click is older than its
 * longest conversion window, so a record kept beyond that is not history --
 * it is a row that will be rejected, attached to a customer whose real
 * source is by then unknowable.
 */
export const ATTRIBUTION_MAX_AGE_DAYS = 90;

/**
 * Longest value kept per field.
 *
 * A click id is ~100 characters and a campaign name is shorter. The cap is
 * here because these arrive from a URL anyone can write, and they end up in
 * Stripe metadata, which refuses a value over 500.
 */
export const ATTRIBUTION_MAX_LENGTH = 200;

interface Stored extends Attribution {
  v: number;
  at: number;
}

/**
 * Reads the tracked parameters out of a query string.
 *
 * Returns null when the URL carries none of them, which is what makes an
 * untagged visit leave the stored record alone.
 */
export function parseAttribution(search: string): Attribution | null {
  const params = new URLSearchParams(search);
  const found: Attribution = {};
  for (const field of ATTRIBUTION_FIELDS) {
    const value = params.get(field)?.trim();
    if (value) found[field] = value.slice(0, ATTRIBUTION_MAX_LENGTH);
  }
  return Object.keys(found).length ? found : null;
}

function isFresh(at: unknown): boolean {
  return (
    typeof at === "number" &&
    Date.now() - at < ATTRIBUTION_MAX_AGE_DAYS * 86_400_000
  );
}

/** What was recorded, or null when there is nothing usable. */
export function readAttribution(): Attribution | null {
  try {
    const stored: unknown = JSON.parse(
      localStorage.getItem(ATTRIBUTION_KEY) ?? "null",
    );
    if (!stored || typeof stored !== "object") return null;
    const row = stored as Stored;
    if (row.v !== ATTRIBUTION_VERSION || !isFresh(row.at)) return null;
    const out: Attribution = {};
    for (const field of ATTRIBUTION_FIELDS) {
      const value = row[field];
      if (typeof value === "string" && value) out[field] = value;
    }
    return Object.keys(out).length ? out : null;
  } catch {
    // Private mode, or storage denied. Not knowing is the same as nothing.
    return null;
  }
}

export function clearAttribution(): void {
  try {
    localStorage.removeItem(ATTRIBUTION_KEY);
  } catch {
    // Nothing to do: there is no state to correct if storage is unreadable.
  }
}

/**
 * Records the parameters of a tagged visit, if advertising was consented to.
 *
 * The most recent tagged visit wins. This is deliberate and it is the rule
 * Google Ads expects: a conversion is attributed to the click that led to
 * it, so a visitor who clicks a second ad must be credited to the second
 * one. An untagged visit -- direct, organic, a link from an email without
 * utm -- changes nothing, so returning from Stripe or reloading the page
 * cannot erase the campaign that paid for the visit.
 */
export function captureAttribution(
  search: string,
  allowed: boolean,
): Attribution | null {
  if (!allowed) return null;
  const found = parseAttribution(search);
  if (!found) return readAttribution();
  try {
    const row: Stored = { v: ATTRIBUTION_VERSION, at: Date.now(), ...found };
    localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(row));
  } catch {
    // The visit is still attributable for as long as this page is open;
    // it just will not survive the customer coming back tomorrow.
  }
  return found;
}

/**
 * The tracked fields present in an arbitrary bag of strings.
 *
 * For reading them back out of Stripe metadata in the webhook, which is
 * where they survive the three days between a trial opening and the charge
 * that follows it. Anything else in the bag is ignored.
 */
export function pickAttribution(
  bag: Record<string, unknown> | null | undefined,
): Attribution | null {
  if (!bag) return null;
  const out: Attribution = {};
  for (const field of ATTRIBUTION_FIELDS) {
    const value = bag[field];
    if (typeof value === "string" && value.trim()) {
      out[field] = value.trim().slice(0, ATTRIBUTION_MAX_LENGTH);
    }
  }
  return Object.keys(out).length ? out : null;
}
