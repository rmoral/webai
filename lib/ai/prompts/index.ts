import type { ToolId } from "@/lib/ai/tools";
import type { Locale } from "@/lib/i18n/routing";

import { correctPrompt } from "./correct";
import { humanizePrompt } from "./humanize";
import { paraphrasePrompt } from "./paraphrase";
import type { LocalizedPrompt, PromptBuilder } from "./types";

// The API returns 501 for tools not registered here. `detect` is absent on
// purpose: it measures the text instead of generating one, so it has no
// prompt and is handled before this lookup.
const PROMPTS: Partial<Record<ToolId, LocalizedPrompt>> = {
  humanize: humanizePrompt,
  paraphrase: paraphrasePrompt,
  correct: correctPrompt,
};

/** Undefined for a tool with no prompt, which the caller answers as a 501. */
export function promptFor(
  tool: ToolId,
  locale: Locale,
): PromptBuilder | undefined {
  return PROMPTS[tool]?.[locale];
}
