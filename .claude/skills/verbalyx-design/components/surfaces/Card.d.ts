import * as React from "react";

/**
 * The only container in Verbalyx: 1px border, 14px radius, shadow-sm,
 * 24px padding, 24px gap between slots. Ported from `components/ui/card.tsx`.
 * Sub-parts: CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter.
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Adds the hover tint used when the whole card is a link (tool grids). */
  interactive?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export interface CardSlotProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

export declare function Card(props: CardProps): React.ReactElement;
export declare function CardHeader(props: CardSlotProps): React.ReactElement;
export declare function CardTitle(props: CardSlotProps): React.ReactElement;
export declare function CardDescription(props: CardSlotProps): React.ReactElement;
export declare function CardAction(props: CardSlotProps): React.ReactElement;
export declare function CardContent(props: CardSlotProps): React.ReactElement;
export declare function CardFooter(props: CardSlotProps): React.ReactElement;
