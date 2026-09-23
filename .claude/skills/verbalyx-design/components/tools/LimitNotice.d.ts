import * as React from "react";

/**
 * D3 · Limit strip under the editor panels (ticket C8). Replaces
 * `OverflowNotice`, which always said «Procesamos las primeras 300», even
 * with nothing left.
 *
 * - overflow   Paste is longer than `maxWordsPerRequest`, balance is enough.
 * - partial    Balance < words wanted (rewrite tools): the first N get processed.
 * - exhausted  Balance 0. `plan="pro"` switches to monthly copy plus a top-up.
 * - detector   Detector with balance < words: all or nothing, so the run
 *              button is disabled and this strip says why.
 *
 * When two limits apply, render the kind of the one that binds (the smaller
 * figure). Never render two strips.
 */
export interface LimitNoticeProps {
  kind?: "overflow" | "partial" | "exhausted" | "detector";
  plan?: "anonymous" | "free" | "pro";
  /** Words in the box. */
  submitted?: number;
  /** `PlanLimits.maxWordsPerRequest`. */
  ceiling?: number;
  /** Words left in the window, from the server. */
  remaining?: number;
  /** The plan's daily allowance (300 anonymous, 500 free). */
  dailyLimit?: number;
  freeDaily?: number;
  proRequest?: number;
  unlimitedRequest?: number;
  resetsIn?: string;
  renewsOn?: string;
  topupWords?: number;
  topupPrice?: string;
  onAction?: () => void;
}

export declare function LimitNotice(props: LimitNoticeProps): React.ReactElement;
