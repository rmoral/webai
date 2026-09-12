import Stripe from "stripe";

// Server-only Stripe client.
let stripe: Stripe | undefined;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  stripe ??= new Stripe(key);
  return stripe;
}

export const PRICE_IDS = {
  monthly: () => process.env.STRIPE_PRICE_PRO_MONTHLY,
  yearly: () => process.env.STRIPE_PRICE_PRO_YEARLY,
};
