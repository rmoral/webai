import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * The brand mark: the wordmark's own "x", white on brand blue.
 *
 * Served from app/icon.svg, the favicon, so the tab and the header can
 * never drift apart. Decorative: it always sits beside the name, which is
 * what a screen reader announces.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <Image
      src="/icon.svg"
      alt=""
      width={24}
      height={24}
      // In every header, above the fold: never worth deferring.
      priority
      className={cn("size-6 shrink-0", className)}
    />
  );
}
