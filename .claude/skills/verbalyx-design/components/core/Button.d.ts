import * as React from "react";

/**
 * The single action primitive of Verbalyx. Eight variants, four sizes.
 * Geometry is 1:1 with `components/ui/button.tsx` (shadcn/ui new-york);
 * `default` now fills with the brand blue (Sept 2026 colour decision),
 * and `ink` preserves the original near-black fill.
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual treatment. `default` is the near-black solid fill. */
  variant?: "default" | "ink" | "soft" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  /** `icon` is a 36x36 square for a lone glyph. */
  size?: "default" | "sm" | "lg" | "icon";
  /** Render as another element (upstream does this with Radix `asChild`, e.g. wrapping a link). */
  as?: "button" | "a" | "span";
  className?: string;
  children?: React.ReactNode;
}

export declare function Button(props: ButtonProps): React.ReactElement;
