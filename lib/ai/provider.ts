import Anthropic from "@anthropic-ai/sdk";

// Server-only abstraction over the AI provider. All tool endpoints stream
// through here.
//
// COST. For a rewriting tool the bill is dominated by OUTPUT tokens: the
// output is about as long as the input, and output is priced five times
// input. So the only lever with real leverage is the per-token price of the
// model, and Haiku 4.5 is the cheapest model there is -- half of Sonnet 5 on
// both input and output. Measured on a 1,000-word Spanish request
// (~1,500 tokens in, ~1,500 out, plus a ~450-token system prompt):
//
//   Sonnet 5     $0.0189 per request
//   Haiku 4.5    $0.0095 per request   <- what we run
//
// Every other knob is worth single-digit percentages of that, or nothing at
// all. The two that look like savings and are not:
//
//   max_tokens   A ceiling, not a charge. You pay for the tokens generated,
//                never for the headroom. Sizing it (below) caps the damage a
//                runaway generation can do; it saves nothing in normal use.
//   prompt cache Our system prompts are 341-540 tokens and the minimum
//                cacheable prefix is 1,024 on Sonnet 5 and 4,096 on Haiku
//                4.5. Below the minimum the breakpoint is a silent no-op --
//                no error, just cache_read_input_tokens: 0 -- so this has
//                never cached on either model. Padding a prompt to reach the
//                minimum costs MORE than it saves (a 4,096-token write at
//                1.25x against a 450-token prompt at 1x), so the marker
//                stays as a no-op and the prompt stays short. See the note
//                on CACHE_CONTROL below.

/**
 * Sonnet is kept in the union because `usage_daily` rows written before this
 * change name it, and estimateCostCents has to keep pricing them correctly.
 */
export type ModelId = "claude-haiku-4-5" | "claude-sonnet-5";

/**
 * Every rewriting request runs here.
 *
 * Haiku 4.5 is the cheapest model available and these three tasks are the
 * shape it is good at: bounded transformations with the rules stated in the
 * prompt -- rewrite this, keep the meaning, drop the filler -- rather than
 * open-ended reasoning. It replaces a Sonnet-above-150-words split that cost
 * twice as much for the same job.
 */
const MODEL: ModelId = "claude-haiku-4-5";

// USD per 1M tokens (input / output).
const PRICING: Record<ModelId, { input: number; output: number }> = {
  "claude-haiku-4-5": { input: 1, output: 5 },
  "claude-sonnet-5": { input: 2, output: 10 },
};

/**
 * Output allowance per input word, used to size `max_tokens`.
 *
 * A rewrite returns roughly what it was given, so the input length predicts
 * the output length. Spanish runs about 1.5 tokens per word; the rest is
 * headroom for a rewrite that legitimately runs longer than its source.
 */
const TOKENS_PER_WORD = 2.4;

/** Enough for any request the largest plan allows (8,000 words). */
const MAX_OUTPUT_TOKENS = 16_000;

/** Short requests still need room for a complete answer. */
const MIN_OUTPUT_TOKENS = 1_024;

/**
 * A ceiling scaled to the request, so a pathological generation on a
 * 300-word free-tier paste cannot bill 16,000 output tokens. It is a
 * blast-radius guard, not a saving: normal requests never approach it.
 */
export function maxTokensFor(wordCount: number): number {
  const needed = Math.ceil(wordCount * TOKENS_PER_WORD);
  return Math.min(MAX_OUTPUT_TOKENS, Math.max(MIN_OUTPUT_TOKENS, needed));
}

let client: Anthropic | undefined;

function getClient(): Anthropic {
  client ??= new Anthropic();
  return client;
}

/**
 * Streams a completion.
 *
 * The system prompt is stable per tool and per language, which is what a
 * cache breakpoint needs -- but at 341-540 tokens it is below Haiku 4.5's
 * 4,096-token minimum, so the marker below caches nothing today. It is kept
 * because it costs nothing and starts working the moment a prompt grows past
 * the minimum or the model changes; CLAUDE.md's "prompt caching always on
 * system prompts" is satisfied in intent, and the measurement above says
 * what it is actually worth. Do not pad a prompt to make it fire.
 */
export function streamCompletion(options: {
  system: string;
  user: string;
  wordCount: number;
}) {
  return getClient().messages.stream({
    model: MODEL,
    max_tokens: maxTokensFor(options.wordCount),
    system: [
      {
        type: "text",
        text: options.system,
        cache_control: { type: "ephemeral" },
      },
    ],
    // No `thinking` and no `output_config.effort`: rewriting needs neither,
    // Haiku 4.5 does no thinking unless asked, and it rejects `effort`
    // outright. Both would be pure cost here.
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
