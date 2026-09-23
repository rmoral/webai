import * as React from "react";

/**
 * D3 · The cost of the next run, shown next to the run button (ticket C8).
 *
 *   142 palabras · te quedan 358 hoy
 *   923 palabras · se procesarán 200 · te quedan 200
 *   923 palabras · no te quedan palabras hoy
 *   280 palabras · necesita 280 · te quedan 200      (detector)
 *
 * The word count turns red (`--danger-ink`) when it is over what will be
 * processed. `remaining = null` means the server has not told us yet (a
 * first anonymous visit): the balance segment is left out rather than
 * guessed.
 */
export interface RunCostProps {
  words?: number;
  ceiling?: number;
  /** From `x-words-remaining`, or the SSR `peekWords`. null = unknown. */
  remaining?: number | null;
  /** "hoy" for daily plans, "este mes" for Pro. */
  window?: string;
  detector?: boolean;
}

export declare function RunCost(props: RunCostProps): React.ReactElement | null;
