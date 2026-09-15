import { z } from "zod";

import type { ToolId } from "@/lib/ai/tools";
import { PLANS, type PlanLimits } from "@/lib/billing/plans";

// Stripe product metadata → plan limits (study §3.2). Everything is
// optional: whatever is missing or malformed falls back to plans.ts, so a
// typo in the dashboard degrades to the shipped defaults instead of
// unlocking or locking the product by accident.

const TOOL_IDS: readonly ToolId[] = [
  "humanize",
  "detect",
  "paraphrase",
  "correct",
];

const numeric = z
  .string()
  .regex(/^\d+$/)
  .transform(Number)
  .pipe(z.number().int().positive());

const boolean = z
  .string()
  .transform((value) => value.trim().toLowerCase())
  .pipe(z.enum(["true", "false"]))
  .transform((value) => value === "true");

const toolList = z.string().transform((value) =>
  value
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry): entry is ToolId => TOOL_IDS.includes(entry as ToolId)),
);

// Each field degrades on its own: a typo in one value must not discard the
// rest of the metadata, so each one falls back to undefined independently.
export const productMetadataSchema = z.object({
  tier: z.enum(["pro", "unlimited"]).optional().catch(undefined),
  words_per_month: numeric.optional().catch(undefined),
  max_words_per_request: numeric.optional().catch(undefined),
  tools: toolList.optional().catch(undefined),
  history: boolean.optional().catch(undefined),
  priority_queue: boolean.optional().catch(undefined),
});

export interface ResolvedTier {
  tier: "pro" | "unlimited";
  limits: PlanLimits;
}

/**
 * Resolves the tier and its limits from product metadata, using the
 * plans.ts entry for that tier as the baseline.
 */
export function resolveEntitlements(
  metadata: Record<string, string> | null | undefined,
  fallbackTier: "pro" | "unlimited",
): ResolvedTier {
  const parsed = productMetadataSchema.safeParse(metadata ?? {});
  const data = parsed.success ? parsed.data : {};
  const tier = data.tier ?? fallbackTier;
  const defaults = PLANS[tier].limits;

  return {
    tier,
    limits: {
      ...defaults,
      wordsPerMonth: data.words_per_month ?? defaults.wordsPerMonth,
      maxWordsPerRequest:
        data.max_words_per_request ?? defaults.maxWordsPerRequest,
      tools: data.tools?.length ? data.tools : defaults.tools,
      history: data.history ?? defaults.history,
      priorityQueue: data.priority_queue ?? defaults.priorityQueue,
    },
  };
}
