import * as React from "react";

/**
 * Tinted banner that offers Pro. Two tones: `brand` (opportunistic, e.g.
 * "te quedan 265 palabras") and `quota` (blocking, shown after a 429).
 * Added Sept 2026 — upstream surfaced the paywall only as a red error line.
 */
export interface UpsellBannerProps {
  tone?: "brand" | "quota";
  /** Bold lead-in sentence. */
  title?: React.ReactNode;
  children?: React.ReactNode;
  /** The CTA element — a `Button`, usually `size="sm"`. */
  action?: React.ReactNode;
}

export declare function UpsellBanner(props: UpsellBannerProps): React.ReactElement;
