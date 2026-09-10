import Anthropic from "@anthropic-ai/sdk";

// Server-only abstraction over the AI provider. All tool endpoints stream
// through here. Per CLAUDE.md: Sonnet by default, Haiku for short texts,
// prompt caching always on the (stable) system prompt.

export type ModelId = "claude-sonnet-5" | "claude-haiku-4-5";

const HAIKU_MAX_WORDS = 150;

// USD per 1M tokens (input / output).
const PRICING: Record<ModelId, { input: number; output: number }> = {
  "claude-sonnet-5": { input: 2, output: 10 },
  "claude-haiku-4-5": { input: 1, output: 5 },
};

let client: Anthropic | undefined;

function getClient(): Anthropic {
  client ??= new Anthropic();
  return client;
}

export function pickModel(wordCount: number): ModelId {
  return wordCount < HAIKU_MAX_WORDS ? "claude-haiku-4-5" : "claude-sonnet-5";
}

/**
 * Streams a completion. The system prompt must be stable per tool so the
 * cache_control breakpoint actually hits; volatile data goes in `user`.
 */
export function streamCompletion(options: {
  system: string;
  user: string;
  wordCount: number;
}) {
  const model = pickModel(options.wordCount);
  return getClient().messages.stream({
    model,
    max_tokens: 16000,
    system: [
      {
        type: "text",
        text: options.system,
        cache_control: { type: "ephemeral" },
      },
    ],
    // Rewriting tasks don't need deep reasoning; low effort cuts cost and
    // latency. Haiku 4.5 does not accept output_config.effort.
    ...(model === "claude-sonnet-5"
      ? { output_config: { effort: "low" as const } }
      : {}),
    messages: [{ role: "user", content: options.user }],
  });
}

export function estimateCostCents(
  model: string,
  usage: { input_tokens: number; output_tokens: number },
): number {
  const price = PRICING[model as ModelId];
  if (!price) return 0;
  const usd =
    (usage.input_tokens * price.input + usage.output_tokens * price.output) /
    1_000_000;
  return usd * 100;
}
