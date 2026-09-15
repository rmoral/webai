import type { ToolId } from "@/lib/ai/tools";

import { correctSystem, correctUser } from "./correct";
import { humanizeSystem, humanizeUser } from "./humanize";
import { paraphraseSystem, paraphraseUser } from "./paraphrase";

interface PromptBuilder {
  system: string;
  user: (text: string, mode?: string) => string;
}

// The API returns 501 for tools not registered here. `detect` is absent on
// purpose: it measures the text instead of generating one, so it has no
// prompt and is handled before this lookup.
export const PROMPTS: Partial<Record<ToolId, PromptBuilder>> = {
  humanize: { system: humanizeSystem, user: humanizeUser },
  paraphrase: { system: paraphraseSystem, user: paraphraseUser },
  correct: { system: correctSystem, user: correctUser },
};
