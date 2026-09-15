import "dotenv/config";
import Stripe from "stripe";

import {
  PLANS,
  PRICES,
  TOPUP,
  type BillingInterval,
  type PaidTier,
} from "../lib/billing/plans";

// Creates the products and prices of study §3.2 in Stripe, idempotently:
// products are matched by metadata.app + metadata.tier, prices by
// lookup_key. Re-running it is safe and reports what already existed.
//
// Usage: pnpm stripe:sync   (or the "Sync Stripe products" GitHub Action)

// SaaS B2C tax code (§3.1).
const TAX_CODE = "txcd_10103001";
const APP = "verbalyx";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/** Product metadata is what entitlements.ts reads at webhook time. */
function metadataFor(tier: PaidTier) {
  const { limits } = PLANS[tier];
  return {
    app: APP,
    tier,
    words_per_month: String(limits.wordsPerMonth),
    max_words_per_request: String(limits.maxWordsPerRequest),
    tools: limits.tools.join(","),
    history: String(limits.history),
    priority_queue: String(limits.priorityQueue),
  };
}

async function findProduct(tier: string): Promise<Stripe.Product | null> {
  const { data } = await stripe.products.search({
    query: `metadata['app']:'${APP}' AND metadata['tier']:'${tier}'`,
    limit: 1,
  });
  return data[0] ?? null;
}

async function ensureProduct(
  tier: string,
  name: string,
  metadata: Record<string, string>,
): Promise<Stripe.Product> {
  const existing = await findProduct(tier);
  if (existing) {
    // Keep metadata in sync: it is the source of truth for entitlements.
    const updated = await stripe.products.update(existing.id, {
      name,
      metadata,
      tax_code: TAX_CODE,
    });
    console.log(`· producto ${tier}: actualizado (${updated.id})`);
    return updated;
  }
  const created = await stripe.products.create({
    name,
    metadata,
    tax_code: TAX_CODE,
  });
  console.log(`· producto ${tier}: creado (${created.id})`);
  return created;
}

async function ensurePrice(
  product: Stripe.Product,
  lookupKey: string,
  amount: number,
  recurring?: BillingInterval,
): Promise<Stripe.Price> {
  const { data } = await stripe.prices.list({
    lookup_keys: [lookupKey],
    limit: 1,
  });
  if (data[0]) {
    console.log(`  · precio ${lookupKey}: ya existe (${data[0].id})`);
    return data[0];
  }
  const price = await stripe.prices.create({
    product: product.id,
    lookup_key: lookupKey,
    unit_amount: Math.round(amount * 100),
    currency: "usd",
    // US prices are quoted without tax; Stripe Tax adds it at checkout.
    tax_behavior: "exclusive",
    ...(recurring
      ? { recurring: { interval: recurring === "yearly" ? "year" : "month" } }
      : {}),
  });
  console.log(`  · precio ${lookupKey}: creado (${price.id})`);
  return price;
}

async function main() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }

  for (const tier of ["pro", "unlimited"] as const) {
    const product = await ensureProduct(
      tier,
      `Verbalyx ${PLANS[tier].name}`,
      metadataFor(tier),
    );
    for (const interval of ["monthly", "yearly"] as const) {
      const price = PRICES[tier][interval];
      await ensurePrice(product, price.lookupKey, price.amount, interval);
    }
  }

  const topup = await ensureProduct(
    "topup",
    "Verbalyx Recarga 25.000 palabras",
    {
      app: APP,
      tier: "topup",
      words: String(TOPUP.words),
    },
  );
  await ensurePrice(topup, TOPUP.lookupKey, TOPUP.amount);

  console.log(
    "\nListo. Los precios se resuelven por lookup_key, así que no hay ids que copiar.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
