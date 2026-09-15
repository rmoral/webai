import * as React from "react";

/**
 * Single-line text field. Intentional addition: upstream has no
 * `components/ui/input.tsx` — the login page writes the same classes inline
 * (`h-9 rounded-md border bg-transparent px-3 text-sm focus-visible:ring-[3px]`).
 * This component is that markup, extracted verbatim.
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export declare function Input(props: InputProps): React.ReactElement;
