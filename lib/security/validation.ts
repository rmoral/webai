import { z } from "zod";

import { TOOLS, type ToolId } from "@/lib/ai/tools";
import {
  ATTRIBUTION_FIELDS,
  ATTRIBUTION_MAX_LENGTH,
  type AttributionField,
} from "@/lib/analytics/attribution";
import { routing } from "@/lib/i18n/routing";

// Hard server-side bound on input size, independent of plan limits
// (~10K words). Plan limits are enforced by entitlements + quotas.
export const MAX_INPUT_CHARS = 80_000;

const toolIds = Object.keys(TOOLS) as [ToolId, ...ToolId[]];

/** Every AI tool endpoint parses its body with this schema before anything else. */
export const aiToolRequestSchema = z
  .object({
    tool: z.enum(toolIds),
    text: z.string().trim().min(1).max(MAX_INPUT_CHARS),
    mode: z.string().max(40).optional(),
    // The endpoint lives outside the [locale] tree, so it cannot read the
    // language from the URL. The client states it and this validates it
    // against the locales that exist; anything else falls back to the
    // default rather than being trusted into a message lookup.
    locale: z.enum(routing.locales).optional(),
    turnstileToken: z.string().max(2048).optional(),
  })
  .refine(
    (req) =>
      !req.mode || (TOOLS[req.tool].modes as string[]).includes(req.mode),
    { message: "Invalid mode for tool", path: ["mode"] },
  );

export type AiToolRequest = z.infer<typeof aiToolRequestSchema>;

/**
 * Where the customer came from, as their browser recorded it.
 *
 * Built from ATTRIBUTION_FIELDS so the list of parameters exists once: a
 * field added there is accepted here without being remembered separately.
 *
 * Closed and capped, because it arrives from a URL anyone can write and
 * ends up in Stripe metadata, which refuses a value over 500 characters
 * and would fail the subscription rather than the field.
 */
export const attributionSchema = z.strictObject(
  Object.fromEntries(
    ATTRIBUTION_FIELDS.map((field) => [
      field,
      z.string().trim().min(1).max(ATTRIBUTION_MAX_LENGTH).optional(),
    ]),
  ) as Record<AttributionField, z.ZodOptional<z.ZodString>>,
);

/**
 * The body of POST /api/billing/subscribe.
 *
 * It carries no price and no trial flag. What the customer owes is read
 * from `lib/billing/plans.ts` and from Stripe; letting a browser state the
 * amount is the classic hole, and letting it ask for a trial is the
 * incoherence this redesign exists to remove.
 */
export const subscribeRequestSchema = z.object({
  plan: z.enum(["pro", "unlimited"]),
  cycle: z.enum(["monthly", "yearly"]),
  locale: z.enum(routing.locales),
  /**
   * The customer ticked the box saying they understand the subscription
   * renews by itself. Checked again here: the button that enables on it
   * lives in a browser, and the record written from this request is what
   * answers a chargeback.
   */
  consent: z.literal(true),
  /**
   * Absent for every customer who refused advertising cookies, and for
   * everyone who arrived without a campaign. Never required: a sale must
   * not depend on being able to attribute it.
   */
  attribution: attributionSchema.optional(),
});

export type SubscribeRequest = z.infer<typeof subscribeRequestSchema>;

export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/**
 * The first `max` words, with the original spacing up to the cut.
 *
 * Wall A processes the beginning of an over-long paste instead of refusing
 * it, and the notice names both figures -- "the first 300 of the 812 you
 * pasted" -- so the cut has to fall exactly where countWords says it does.
 * Both functions read a word as a maximal run of non-whitespace, which is
 * what keeps the two numbers in agreement.
 */
export function truncateToWords(text: string, max: number): string {
  if (max <= 0) return "";
  const word = /\S+/g;
  for (let seen = 0; ;) {
    const match = word.exec(text);
    if (!match) return text;
    if (++seen === max) return text.slice(0, match.index + match[0].length);
  }
}

/**
 * The body of POST /api/billing/manage — the two things the end-of-trial
 * wall can do to a live subscription. Both are narrowing: switching down to
 * Pro, or stopping. Neither can raise what anyone is charged, which is why
 * they are safe to offer on a screen with no way out.
 */
export const manageSubscriptionSchema = z.object({
  action: z.enum(["switch_to_pro", "cancel"]),
});

export type ManageSubscriptionRequest = z.infer<
  typeof manageSubscriptionSchema
>;

/**
 * The `next` a redirect will actually follow.
 *
 * Every door into the app carries one -- the middleware writes it, the
 * pricing page writes it, the paywall writes it -- and it survives a round
 * trip through Supabase, so by the time it is used it has been outside the
 * process. An open redirect here is a phishing page that starts on our
 * domain and ends on theirs, with our sign-in form in the middle.
 *
 * `startsWith("/")` is not enough on its own: `//evil.example` and
 * `/\evil.example` are protocol-relative URLs, and every browser reads
 * them as another origin. So is a backslash after the slash, which some
 * parsers normalise. Anything not plainly an internal path falls back.
 */
export function safeNext(
  value: string | null | undefined,
  fallback = "/app",
): string {
  if (!value || value.length > 512) return fallback;
  if (!value.startsWith("/")) return fallback;
  if (/^\/[/\\]/.test(value)) return fallback;
  // A control character or whitespace in a Location header is how a header
  // injection starts; no legitimate path we generate contains either.
  if (/[\s\u0000-\u001f\u007f]/.test(value)) return fallback;
  return value;
}
