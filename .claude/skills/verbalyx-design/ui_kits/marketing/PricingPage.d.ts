import * as React from "react";

/**
 * D2 · /precios (ticket C9).
 *
 * - Anual by default. A line under the toggle says where the trial is and
 *   switches cycle in one click, so the default hides nothing.
 * - Headline is the monthly equivalent; directly under it, the yearly total
 *   and the sentence that says when it is charged.
 * - One badge on the page («Más popular», Ilimitado, both cycles). The
 *   trial is said in the CTA and the billing line, not in a second badge.
 * - One filled CTA on the page (Ilimitado's). The rest are outline.
 * - Social-proof band only when `wordsProcessed` is supplied from real data
 *   (sum of `usage_daily.words_in`). No figure means no band.
 * - Taxes are included: the footer and the FAQ both say so.
 */
export interface PricingPageProps {
  /** "yearly" by default. */
  initialCycle?: "yearly" | "monthly";
  /** Resolved in the browser, as `HeaderAuth` already does. */
  session?: "anon" | "free" | "pro" | "unlimited";
  /** Preformatted and rounded down, e.g. "12,4 millones". null hides the band. */
  wordsProcessed?: string | null;
  /** Month the count starts from, e.g. "marzo de 2026". */
  since?: string;
  /** Today + TRIAL.days, as a long date. */
  trialEndsOn?: string;
  /** Receives "registro" | "checkout" | "cuenta" | "recarga". */
  onNavigate?: (destination: string) => void;
}

export declare function PricingPage(props: PricingPageProps): React.ReactElement;
