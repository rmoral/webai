"use client";

import { cn } from "@/lib/utils";

// Single-select pill used for tool modes. Pressed state is the brand fill;
// selection is announced through aria-pressed, not colour alone.
export function Chip({
  pressed = false,
  className,
  ...props
}: React.ComponentProps<"button"> & { pressed?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center rounded-md border px-3 text-sm font-medium whitespace-nowrap transition-colors outline-none",
        "focus-visible:ring-brand/30 focus-visible:ring-[3px]",
        "disabled:pointer-events-none disabled:opacity-50",
        pressed
          ? "bg-brand border-brand text-brand-foreground hover:bg-brand-hover"
          : "bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}
