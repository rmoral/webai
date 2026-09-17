import { z } from "zod";

import { TOOLS, type ToolId } from "@/lib/ai/tools";
import { routing } from "@/lib/i18n/routing";

// Hard server-side bound on input size, independent of plan limits
// (~10K words). Plan limits are enforced by entitlements + quotas.
export const MAX_INPUT_CHARS = 80_000;

const toolIds = Object.keys(TOOLS) as [ToolId, ...ToolId[]];

/** Every AI tool endpoint parses its body with this schema before anything else. */
export const aiToolRequestSchema = z
  .object({
    tool: z.enum(toolIds),
    text: z.string().trim().min(1).max(MAX_INPUT_CHARS),
    mode: z.string().max(40).optional(),
    // The endpoint lives outside the [locale] tree, so it cannot read the
    // language from the URL. The client states it and this validates it
    // against the locales that exist; anything else falls back to the
    // default rather than being trusted into a message lookup.
    locale: z.enum(routing.locales).optional(),
    turnstileToken: z.string().max(2048).optional(),
  })
  .refine(
    (req) =>
      !req.mode || (TOOLS[req.tool].modes as string[]).includes(req.mode),
    { message: "Invalid mode for tool", path: ["mode"] },
  );

export type AiToolRequest = z.infer<typeof aiToolRequestSchema>;

export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}
