// Single source of truth for plan limits and pricing.
// Never hardcode these values in UI components.

export type PlanId = "anonymous" | "free" | "pro";

export interface PlanLimits {
  /** Words allowed per day across tools. `null` = no daily limit. */
  wordsPerDay: number | null;
  /** Max words accepted in a single request. */
  wordsPerRequest: number;
  /** Soft monthly cap to keep AI cost under control. `null` = none. */
  softWordsPerMonth: number | null;
  /** Whether documents/history are persisted. */
  history: boolean;
}

export interface Plan {
  id: PlanId;
  name: string;
  limits: PlanLimits;
}

export const PLANS: Record<PlanId, Plan> = {
  anonymous: {
    id: "anonymous",
    name: "Anónimo",
    limits: {
      wordsPerDay: 300,
      wordsPerRequest: 300,
      softWordsPerMonth: null,
      history: false,
    },
  },
  free: {
    id: "free",
    name: "Gratis",
    limits: {
      wordsPerDay: 500,
      wordsPerRequest: 500,
      softWordsPerMonth: null,
      history: false,
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    limits: {
      wordsPerDay: null,
      wordsPerRequest: 10_000,
      softWordsPerMonth: 150_000,
      history: true,
    },
  },
};

export const PRICING = {
  proMonthly: { amount: 9.99, currency: "EUR", interval: "month" },
  proYearly: { amount: 59.99, currency: "EUR", interval: "year" },
} as const;
