import * as React from "react";

/**
 * D1 · Balance block for the /app header (ticket C7). Replaces the
 * `Badge` + `QuotaBar` pair the header renders on main.
 *
 * - free    «Hoy: X / 500 palabras», bar, outline «Mejorar». Spent: red bar,
 *           «· se recargan en 5 h» inline, «Mejorar» turns `soft`.
 * - pro     «Este mes: X / 60.000 palabras», bar, «Pasar a Ilimitado» as a link.
 * - unlimited  «Ilimitado», no bar, no button.
 * - trial   «Ilimitado · prueba hasta el 26 de septiembre», no button; the
 *           tooltip states the charge date and amount.
 *
 * Every number comes from the server (`peekWords` + `getSubscriber`), never
 * from a constant in the component.
 */
export interface UsageMeterProps {
  plan?: "free" | "pro" | "unlimited" | "trial";
  /** Words spent in the current window (day for free, billing period for Pro). */
  used?: number;
  /** `PlanLimits.wordsPerDay` (free) or `wordsPerMonth` (Pro). */
  limit?: number;
  /** Time left until the daily key rolls over (00:00 UTC), e.g. "5 h", "40 min". */
  resetsIn?: string;
  /** Long date of `subscriber.periodEnd` — Pro only. */
  renewsOn?: string;
  /** Long date of `subscriber.trialEnd` — trial only. */
  trialEndsOn?: string;
  /** Formatted monthly amount charged when the trial converts. */
  trialAmount?: string;
  proMonthly?: number;
  proRequest?: number;
  unlimitedMonthly?: number;
  unlimitedRequest?: number;
  /** `subscriber.topupWords`; shown in the Pro tooltip when > 0. */
  topup?: number;
  /** Mobile header: shorter label, narrower bar, tooltip docks to the viewport. */
  compact?: boolean;
  /** Opens the tooltip on mount (specimens only). */
  defaultOpen?: boolean;
  onUpgrade?: () => void;
  onManage?: () => void;
}

export declare function UsageMeter(props: UsageMeterProps): React.ReactElement;
