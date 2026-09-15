import * as React from "react";

/**
 * Daily word allowance, shown before the user hits the wall. Fill turns amber
 * at 80% and red at 100%. Added Sept 2026: upstream only printed "Te quedan
 * N palabras hoy" as muted text, which nobody reads until the 429.
 */
export interface QuotaBarProps {
  used?: number;
  /** Daily limit from `lib/billing/plans.ts`. Pro has none — hide the bar instead. */
  total?: number;
  /** Plan name: "Anónimo" | "Gratis" | "Pro". */
  plan?: string;
  /** Trailing unit text. */
  unit?: string;
  /** Set false when a sibling already names the plan (e.g. the app header's badge). */
  showPlan?: boolean;
}

export declare function QuotaBar(props: QuotaBarProps): React.ReactElement;
