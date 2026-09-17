"use client";

import type { Change } from "diff";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

// Marks what the tool changed. The comparison runs in the browser over the
// input and the streamed output: it costs nothing per request, which a
// model-annotated output would not. Amber = rewritten, green = added.

const MARK =
  "rounded-[2px] px-px text-inherit bg-[var(--hl-rewritten)] shadow-[inset_0_-2px_0_var(--hl-rewritten-line)]";
const MARK_ADDED =
  "bg-[var(--hl-added)] shadow-[inset_0_-2px_0_var(--hl-added-line)]";

/**
 * Word-level diff of the output against the input. The `diff` package is
 * imported on demand: it is only needed once a result exists, so it stays
 * out of the initial bundle of the pages that carry the editor.
 */
export async function diffParts(
  input: string,
  output: string,
): Promise<Change[] | null> {
  if (!input.trim() || !output.trim()) return null;
  const { diffWords } = await import("diff");
  return diffWords(input, output);
}

export function DiffMarks({
  parts,
  fallback,
}: {
  parts: Change[] | null;
  fallback: string;
}) {
  if (!parts) return <>{fallback}</>;

  return (
    <>
      {parts.map((part, i) => {
        if (part.removed) return null;
        if (!part.added) return <span key={i}>{part.value}</span>;
        // A chunk that replaces removed text reads as "rewritten"; one that
        // replaces nothing, as "added".
        const rewritten = parts[i - 1]?.removed === true;
        return (
          <mark key={i} className={cn(MARK, !rewritten && MARK_ADDED)}>
            {part.value}
          </mark>
        );
      })}
    </>
  );
}

export function HighlightLegend({ kind }: { kind: "rewritten" | "added" }) {
  const t = useTranslations("highlight");
  return (
    <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
      <span
        className={cn(
          "size-2.5 shrink-0 rounded-[2px]",
          MARK,
          kind === "added" && MARK_ADDED,
        )}
      />
      {t(kind)}
    </span>
  );
}
