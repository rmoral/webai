import type { ToolId } from "@/lib/ai/tools";

// Single source of truth for plan limits and pricing (USD).
// Never hardcode these values in UI components.
//
// Paid tiers mirror the product metadata in Stripe: the webhook resolves
// that metadata against these defaults and stores the result on the
// subscription row, so limits can change in Stripe without a deploy.
// See ESTUDIO_PRECIOS_Y_CONFIG_STRIPE_USD.md §2 and §3.2.

export type PlanId = "anonymous" | "free" | "pro" | "unlimited";

/** Tiers that exist as a product in Stripe. */
export type PaidTier = "pro" | "unlimited";

export interface PlanLimits {
  /** Words per day. Only the free tiers are metered daily. `null` = unmetered. */
  wordsPerDay: number | null;
  /** Words per billing period. Paid tiers only. `null` = unmetered. */
  wordsPerMonth: number | null;
  /** Max words accepted in a single request. */
  maxWordsPerRequest: number;
  /** Tools the plan may use at all. */
  tools: readonly ToolId[];
  /** Whether documents are persisted. */
  history: boolean;
  /** Detector returns per-sentence scores, not just the global one. */
  sentenceHighlight: boolean;
  /** Reserved for the priority queue; stored, no runtime effect yet. */
  priorityQueue: boolean;
  /**
   * When true the monthly cap only alerts instead of blocking — the
   * Ilimitado plan is sold as unlimited with a cap to contain abuse.
   */
  softCap: boolean;
}

export interface Plan {
  id: PlanId;
  name: string;
  limits: PlanLimits;
}

const FREE_TOOLS = ["humanize", "detect"] as const;
const ALL_TOOLS = ["humanize", "detect", "paraphrase", "correct"] as const;

export const PLANS: Record<PlanId, Plan> = {
  anonymous: {
    id: "anonymous",
    name: "Anónimo",
    limits: {
      wordsPerDay: 300,
      wordsPerMonth: null,
      maxWordsPerRequest: 300,
      tools: FREE_TOOLS,
      history: false,
      sentenceHighlight: false,
      priorityQueue: false,
      softCap: false,
    },
  },
  free: {
    id: "free",
    name: "Gratis",
    limits: {
      wordsPerDay: 500,
      wordsPerMonth: null,
      maxWordsPerRequest: 300,
      tools: FREE_TOOLS,
      history: false,
      sentenceHighlight: false,
      priorityQueue: false,
      softCap: false,
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    limits: {
      wordsPerDay: null,
      wordsPerMonth: 60_000,
      maxWordsPerRequest: 3_000,
      tools: ALL_TOOLS,
      history: true,
      sentenceHighlight: true,
      priorityQueue: false,
      softCap: false,
    },
  },
  unlimited: {
    id: "unlimited",
    name: "Ilimitado",
    limits: {
      wordsPerDay: null,
      wordsPerMonth: 500_000,
      maxWordsPerRequest: 8_000,
      tools: ALL_TOOLS,
      history: true,
      sentenceHighlight: true,
      priorityQueue: true,
      softCap: true,
    },
  },
};

export type BillingInterval = "monthly" | "yearly";

export interface PriceDefinition {
  /** Stripe lookup_key — prices are resolved by this, never by a hardcoded id. */
  lookupKey: string;
  /** Amount in USD. */
  amount: number;
  /** Equivalent monthly amount, for MRR and for "save $X" copy. */
  monthlyEquivalent: number;
}

export const PRICES: Record<
  PaidTier,
  Record<BillingInterval, PriceDefinition>
> = {
  pro: {
    monthly: {
      lookupKey: "pro_monthly_usd",
      amount: 14.99,
      monthlyEquivalent: 14.99,
    },
    yearly: {
      lookupKey: "pro_yearly_usd",
      amount: 89.88,
      monthlyEquivalent: 7.49,
    },
  },
  unlimited: {
    monthly: {
      lookupKey: "unlimited_monthly_usd",
      amount: 29.99,
      monthlyEquivalent: 29.99,
    },
    yearly: {
      lookupKey: "unlimited_yearly_usd",
      amount: 179.88,
      monthlyEquivalent: 14.99,
    },
  },
};

/** One-time word top-up. Does not expire; requires an active subscription. */
export const TOPUP = {
  lookupKey: "topup_25k_usd",
  amount: 9.99,
  words: 25_000,
} as const;

export const CURRENCY = "USD";

/** The trial runs on Ilimitado so the user sees the ceiling of the product. */
export const TRIAL = {
  tier: "unlimited" as const,
  interval: "monthly" as const,
  days: 3,
};

export function formatUsd(amount: number): string {
  return amount.toLocaleString("es-ES", {
    style: "currency",
    currency: CURRENCY,
    minimumFractionDigits: 2,
  });
}

/** Yearly saving in dollars — §2 asks for the figure, not just the percentage. */
export function yearlySaving(tier: PaidTier): number {
  return PRICES[tier].monthly.amount * 12 - PRICES[tier].yearly.amount;
}
