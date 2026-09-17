import type { Locale } from "@/lib/i18n/routing";

export interface PromptBuilder {
  /** Stable per language, so prompt caching still hits on every request. */
  system: string;
  user: (text: string, mode?: string) => string;
}

/**
 * A prompt in every language the product is sold in.
 *
 * Which one is used is decided by the interface the visitor is reading, not
 * by detecting the language of the pasted text. That is a deliberate choice:
 * detection is another thing that can be wrong, and being wrong here means
 * silently translating somebody's work. The consequence is that pasting
 * English into the Spanish humanizer gets you Spanish, which is what the
 * page said it would do.
 */
export type LocalizedPrompt = Record<Locale, PromptBuilder>;
