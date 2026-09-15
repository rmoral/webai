import * as React from "react";

/**
 * Marks what the tool changed inside a result pane — the one place where
 * colour carries information rather than emphasis. Added Sept 2026; every
 * major competitor highlights its edits, and without it the user cannot tell
 * what the AI touched.
 */
export interface HighlightProps extends React.HTMLAttributes<HTMLElement> {
  /** `rewritten` (amber) = existing text reworded. `added` (green) = new text. */
  kind?: "rewritten" | "added";
  children?: React.ReactNode;
}

export interface HighlightLegendProps {
  kind?: "rewritten" | "added";
  /** Defaults to "Reescrito" / "Añadido". */
  children?: React.ReactNode;
}

export declare function Highlight(props: HighlightProps): React.ReactElement;
export declare function HighlightLegend(props: HighlightLegendProps): React.ReactElement;
