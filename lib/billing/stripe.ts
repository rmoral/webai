import Stripe from "stripe";

import {
  PRICES,
  TOPUP,
  type BillingInterval,
  type PaidTier,
} from "@/lib/billing/plans";

// Server-only Stripe client.
let stripe: Stripe | undefined;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  stripe ??= new Stripe(key);
  return stripe;
}

export function lookupKeyFor(
  tier: PaidTier | "topup",
  interval?: BillingInterval,
): string {
  if (tier === "topup") return TOPUP.lookupKey;
  return PRICES[tier][interval ?? "monthly"].lookupKey;
}

/**
 * Resolves a price by lookup_key. Prices are never hardcoded as ids, which
 * is what lets prices change in Stripe without touching the code.
 */
export async function findPrice(
  lookupKey: string,
): Promise<Stripe.Price | null> {
  const { data } = await getStripe().prices.list({
    lookup_keys: [lookupKey],
    active: true,
    expand: ["data.product"],
    limit: 1,
  });
  return data[0] ?? null;
}
