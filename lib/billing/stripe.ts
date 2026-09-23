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

/** Why Stripe refused to open a checkout session. */
export interface CheckoutRejection {
  /** Error code for the client, surfaced to the operator as `(ref: …)`. */
  code: string;
  /** What has to change in the Stripe Dashboard. Null when unrecognised. */
  fix: string | null;
}

/**
 * Stripe states its objections precisely and then we throw that away: the
 * route answered every refusal with `checkout_failed`, so a Dashboard
 * setting nobody turned on looked identical to an outage.
 *
 * Classification reads `param` and the message together. `param` is the
 * stabler of the two, but Stripe does not always set it: the terms-of-service
 * refusal arrives as prose naming neither the parameter nor the field, which
 * is why the first version of this fell through to the generic code on the
 * very error it was written for. Each rule therefore carries the wording
 * Stripe actually uses alongside the parameter name.
 */
export function describeCheckoutRejection(error: unknown): CheckoutRejection {
  const e = error as { type?: string; param?: string; message?: string };
  const where = `${e?.param ?? ""} ${e?.message ?? ""}`;

  if (e?.type === "StripeAuthenticationError") {
    return {
      code: "stripe_key_invalid",
      fix: "STRIPE_SECRET_KEY no es válida para esta cuenta. Cópiala de nuevo desde Stripe → Developers → API keys, y comprueba que sea del mismo modo (test o live) que los precios.",
    };
  }

  if (/automatic_tax|stripe tax|tax (registration|calculation)/i.test(where)) {
    return {
      code: "tax_not_configured",
      fix: "Stripe Tax no está activado. Actívalo en Stripe → Tax y define la dirección de origen de YBB Solutions, LLC. Sin eso Stripe rechaza cualquier sesión con automatic_tax.",
    };
  }

  if (/consent_collection|terms of service/i.test(where)) {
    return {
      code: "terms_url_missing",
      fix: "Falta la URL de los términos en Stripe → Settings → Business → Public details. Es obligatoria para pedir la aceptación de términos en el checkout. Usa https://www.verbalyx.ai/legal/terminos.",
    };
  }

  if (/customer_update/i.test(where)) {
    return {
      code: "customer_update_invalid",
      fix: "Stripe rechaza customer_update porque la sesión no lleva un cliente asociado. Revisa el plan del usuario antes de abrir el pago.",
    };
  }

  return { code: "checkout_failed", fix: null };
}

/** One lookup key, and whether the connected account can sell it. */
export interface PriceAudit {
  lookupKey: string;
  found: boolean;
  /** Whether the price lives in the live account. Null when not found. */
  live: boolean | null;
}

/** One endpoint Stripe will call, as the account has it configured. */
export interface WebhookAudit {
  url: string;
  enabled: boolean;
  live: boolean;
  /** Whether it subscribes to the events the app is built around. */
  covers: boolean;
}

export interface StripeAudit {
  prices: PriceAudit[];
  webhooks: WebhookAudit[];
  /** Null when the account can take a payment today. */
  problem: string | null;
}

/**
 * The events the webhook has to deliver for a sale to become a plan.
 *
 * Missing any of these is the failure that costs the most and shows the
 * least: the customer pays, Stripe is happy, and the account stays free.
 */
const REQUIRED_EVENTS = [
  "invoice.paid",
  "setup_intent.succeeded",
  "customer.subscription.updated",
  "customer.subscription.deleted",
] as const;

/**
 * What the connected Stripe account is actually able to do, as opposed to
 * which variables are set.
 *
 * Switching to live is not one change, it is four, and three of them are
 * silent. The keys are the visible one. The prices are per mode, so an
 * account with live keys and no live prices answers every checkout with
 * `price_not_configured` -- the code is looking for a lookup_key that
 * exists only in the sandbox. The tax origin is per mode too. And the
 * webhook is per endpoint, so a live account with the sandbox's endpoint
 * takes the money and never tells us, which leaves a paying customer on
 * the free plan with nothing to find them by.
 *
 * None of that is visible from the browser, and all of it is one API call
 * away. Read-only: it creates nothing and changes nothing.
 */
export async function auditStripe(
  stripe: Stripe = getStripe(),
): Promise<StripeAudit> {
  const keys = [
    lookupKeyFor("pro", "monthly"),
    lookupKeyFor("pro", "yearly"),
    lookupKeyFor("unlimited", "monthly"),
    lookupKeyFor("unlimited", "yearly"),
    lookupKeyFor("topup"),
  ];

  const { data: found } = await stripe.prices.list({
    lookup_keys: keys,
    active: true,
    limit: keys.length,
  });

  const prices: PriceAudit[] = keys.map((lookupKey) => {
    const price = found.find((p) => p.lookup_key === lookupKey);
    return {
      lookupKey,
      found: Boolean(price),
      live: price ? price.livemode : null,
    };
  });

  const { data: endpoints } = await stripe.webhookEndpoints.list({ limit: 20 });
  const webhooks: WebhookAudit[] = endpoints.map((endpoint) => ({
    url: endpoint.url,
    enabled: endpoint.status === "enabled",
    live: endpoint.livemode,
    covers:
      endpoint.enabled_events.includes("*") ||
      REQUIRED_EVENTS.every((event) => endpoint.enabled_events.includes(event)),
  }));

  const missing = prices.filter((price) => !price.found);
  const usable = webhooks.filter((hook) => hook.enabled && hook.covers);

  const problem =
    missing.length > 0
      ? `Faltan ${missing.length} de ${prices.length} precios en esta cuenta de Stripe: ${missing.map((p) => p.lookupKey).join(", ")}. Los precios se crean por modo, así que los del sandbox no existen en live. Lánzalos desde GitHub → Actions → «Sync Stripe products» con el secret STRIPE_SECRET_KEY en modo live.`
      : usable.length === 0
        ? "Esta cuenta no tiene ningún webhook activo que cubra invoice.paid, setup_intent.succeeded y los cambios de suscripción. Se cobrará y el plan del usuario nunca se activará. Crea el endpoint en Stripe → Developers → Webhooks, en el mismo modo que las claves, y copia su whsec_ a STRIPE_WEBHOOK_SECRET."
        : null;

  return { prices, webhooks, problem };
}
