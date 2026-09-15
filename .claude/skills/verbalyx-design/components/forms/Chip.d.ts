import * as React from "react";

/**
 * Single-select toggle for a tool's register/mode. Replaces the
 * `Button variant="outline"/"default"` pair the upstream tool editor used,
 * so a mode row never reads as four competing actions.
 */
export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Selected state — fills with brand blue. */
  pressed?: boolean;
  /** Fully rounded; used in the marketing hero's compact editor. */
  round?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export declare function Chip(props: ChipProps): React.ReactElement;
