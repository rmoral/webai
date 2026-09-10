import "dotenv/config";
import Stripe from "stripe";

import { PRICING } from "../lib/billing/plans";

// Creates the Pro product and prices in Stripe (idempotent by lookup_key)
// and prints the env lines to copy into .env.local / Vercel.
// Usage: pnpm tsx scripts/sync-stripe-prices.ts

async function main() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const products = await stripe.products.search({
    query: "metadata['app']:'verbalyx'",
  });
  const product =
    products.data[0] ??
    (await stripe.products.create({
      name: "Verbalyx Pro",
      metadata: { app: "verbalyx" },
    }));

  async function ensurePrice(
    lookupKey: string,
    amount: number,
    interval: "month" | "year",
  ) {
    const existing = await stripe.prices.list({
      lookup_keys: [lookupKey],
      limit: 1,
    });
    if (existing.data[0]) return existing.data[0];
    return stripe.prices.create({
      product: product.id,
      lookup_key: lookupKey,
      unit_amount: Math.round(amount * 100),
      currency: "eur",
      recurring: { interval },
      tax_behavior: "inclusive", // prices shown IVA incl.
    });
  }

  const monthly = await ensurePrice(
    "pro_monthly",
    PRICING.proMonthly.amount,
    "month",
  );
  const yearly = await ensurePrice(
    "pro_yearly",
    PRICING.proYearly.amount,
    "year",
  );

  console.log(`STRIPE_PRICE_PRO_MONTHLY=${monthly.id}`);
  console.log(`STRIPE_PRICE_PRO_YEARLY=${yearly.id}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
