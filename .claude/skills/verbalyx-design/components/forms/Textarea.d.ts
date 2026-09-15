import * as React from "react";

/**
 * Multi-line text field — the input side of every AI tool.
 * Ported from `components/ui/textarea.tsx`.
 */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export declare function Textarea(props: TextareaProps): React.ReactElement;
