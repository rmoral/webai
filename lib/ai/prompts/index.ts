import type { ToolId } from "@/lib/ai/tools";

import { humanizeSystem, humanizeUser } from "./humanize";

interface PromptBuilder {
  system: string;
  user: (text: string, mode?: string) => string;
}

// Tools become available as their prompts land (detect/paraphrase/correct:
// Sprint 3). The API returns 501 for tools not registered here.
export const PROMPTS: Partial<Record<ToolId, PromptBuilder>> = {
  humanize: { system: humanizeSystem, user: humanizeUser },
};
