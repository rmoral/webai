import * as React from "react";

/**
 * Score readout for the Detector de IA (and the humanizer's "how human does
 * this read" check). Bands: >=70 green, 40-69 amber, <40 red. Added Sept 2026
 * with the semantic palette — the detector has no UI upstream.
 */
export interface ScoreGaugeProps {
  /** 0-100. Drives both the ring fill and the band colour. */
  value?: number;
  /** Overrides the generated headline ("Suena humano en un 72%"). */
  label?: string;
  /** Overrides the standing disclaimer. Keep a disclaimer. */
  note?: string;
  /** Trailing slot — typically a "Ver detalle" outline button. */
  children?: React.ReactNode;
}

export declare function ScoreGauge(props: ScoreGaugeProps): React.ReactElement;
