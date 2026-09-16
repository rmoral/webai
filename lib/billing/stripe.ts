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
 * Classification keys off `param`, which Stripe sets on an invalid request
 * and which does not change wording between API versions the way the
 * message does. The message is only a fallback.
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

  if (where.includes("automatic_tax")) {
    return {
      code: "tax_not_configured",
      fix: "Stripe Tax no está activado. Actívalo en Stripe → Tax y define la dirección de origen de YBB Solutions, LLC. Sin eso Stripe rechaza cualquier sesión con automatic_tax.",
    };
  }

  if (where.includes("consent_collection")) {
    return {
      code: "terms_url_missing",
      fix: "Falta la URL de los términos en Stripe → Settings → Business → Public details. Es obligatoria para pedir la aceptación de términos en el checkout. Usa https://www.verbalyx.ai/legal/terminos.",
    };
  }

  if (where.includes("customer_update")) {
    return {
      code: "customer_update_invalid",
      fix: "Stripe rechaza customer_update porque la sesión no lleva un cliente asociado. Revisa el plan del usuario antes de abrir el pago.",
    };
  }

  return { code: "checkout_failed", fix: null };
}
