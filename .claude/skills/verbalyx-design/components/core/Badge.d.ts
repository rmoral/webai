import * as React from "react";

/** Small status label: plan name, subscription state, "Recomendado", "En construcción". */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "brand" | "success" | "warning" | "danger";
  /** Fully rounded — used only for the "sin registro" hero pill. */
  pill?: boolean;
  /** Leading 6px status dot in the current text colour. */
  dot?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export declare function Badge(props: BadgeProps): React.ReactElement;
