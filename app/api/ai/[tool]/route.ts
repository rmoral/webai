import * as Sentry from "@sentry/nextjs";
import { getTranslations } from "next-intl/server";
import { NextRequest, NextResponse, after } from "next/server";

import { analyze } from "@/lib/ai/detector/pipeline";
import { promptFor } from "@/lib/ai/prompts";
import type { ToolId } from "@/lib/ai/tools";
import { estimateCostCents, streamCompletion } from "@/lib/ai/provider";
import { getSession } from "@/lib/auth/server";
import { checkEntitlement, getSubscriber } from "@/lib/billing/entitlements";
import { PLANS } from "@/lib/billing/plans";
import { saveDocument } from "@/lib/documents/store";
import { hashIp } from "@/lib/security/crypto";
import { verifyTurnstile } from "@/lib/security/turnstile";
import {
  aiToolRequestSchema,
  countWords,
  truncateToWords,
} from "@/lib/security/validation";
import { routing, splitLocale } from "@/lib/i18n/routing";
import {
  checkBurstLimit,
  reserveWords,
  type QuotaGrant,
} from "@/lib/usage/quotas";
import { recordUsage } from "@/lib/usage/tracking";

export const maxDuration = 120;

function error(status: number, code: string, message: string) {
  return NextResponse.json({ error: code, message }, { status });
}

/**
 * Best-effort locale for the boundary catch below, from the page the request
 * came from. The body carries the locale for every other answer, but by the
 * time something throws it has already been read, and re-reading it to pick
 * a language for a 500 is not worth a second JSON parse on every request.
 */
function localeFromReferer(request: NextRequest) {
  const referer = request.headers.get("referer");
  if (!referer) return routing.defaultLocale;
  try {
    return splitLocale(new URL(referer).pathname).locale;
  } catch {
    return routing.defaultLocale;
  }
}

/**
 * What the client needs to keep every counter in the product agreeing,
 * carried on the response rather than in the body: the rewrite answers
 * with a stream, and a stream has nowhere to put a number.
 *
 * `processed` is the figure wall B and the excess notice are written
 * from -- how many words were actually paid for and seen by the model --
 * and it is the only honest source for "we processed the first N".
 */
function quotaHeaders(grant: QuotaGrant): Record<string, string> {
  return {
    "x-words-processed": String(grant.granted),
    ...(grant.limit !== null
      ? {
          "x-words-limit": String(grant.limit),
          "x-words-used": String(grant.used ?? 0),
          "x-words-remaining": String(grant.remaining ?? 0),
        }
      : {}),
  };
}

/**
 * Boundary catch. The anti-abuse layer fails closed by throwing when a
 * required secret is missing (hashIp without IP_HASH_SECRET, Redis without
 * Upstash credentials in production). Failing closed is right; failing with
 * an empty 500 is not — the browser then shows a generic "algo ha salido
 * mal" and the cause is invisible from both ends. Answer with JSON and
 * report it, so a misconfiguration is diagnosable instead of silent.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ tool: string }> },
) {
  try {
    return await handle(request, context);
  } catch (e) {
    // The anti-abuse layer throws by name when a secret is missing, and
    // that name is the whole diagnosis: "Upstash Redis is not configured"
    // and "ANTHROPIC_API_KEY is not set" are one variable apart and look
    // identical from the browser.
    console.error(`[ai] ${e instanceof Error ? e.message : String(e)}`);
    Sentry.captureException(e);
    const t = await getTranslations({
      locale: localeFromReferer(request),
      namespace: "errors",
    });
    return error(500, "server_error", t("server_error"));
  }
}

async function handle(
  request: NextRequest,
  { params }: { params: Promise<{ tool: string }> },
) {
  const body = await request.json().catch(() => null);
  const parsed = aiToolRequestSchema.safeParse({
    ...body,
    tool: (await params).tool,
  });

  // Answers are written in the language the visitor is browsing, which the
  // client states in the body. An unparseable body has no locale to read,
  // so that one case falls back to the default.
  const locale = parsed.success
    ? (parsed.data.locale ?? routing.defaultLocale)
    : routing.defaultLocale;
  const t = await getTranslations({ locale, namespace: "errors" });
  const names = await getTranslations({ locale, namespace: "tools" });

  if (!parsed.success) {
    return error(400, "invalid_request", t("invalid_request"));
  }
  const { tool, text, mode, turnstileToken } = parsed.data;

  // The prompt is chosen by the language the visitor is reading, not by
  // detecting the language of the text (see lib/ai/prompts/types.ts).
  const prompt = promptFor(tool, locale);
  if (!prompt && tool !== "detect") {
    return error(501, "tool_not_available", t("tool_not_available"));
  }

  const user = await getSession();
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "0.0.0.0";
  const subject = user ? `user:${user.id}` : `ip:${hashIp(ip)}`;

  if (!user && !(await verifyTurnstile(turnstileToken, ip))) {
    return error(403, "captcha_failed", t("captcha_failed"));
  }

  const burst = await checkBurstLimit(subject);
  if (!burst.allowed) {
    return error(429, "rate_limited", t("rate_limited"));
  }

  let subscriber = {
    plan: PLANS.anonymous,
    topupWords: 0,
    periodStart: null as Date | null,
    periodEnd: null as Date | null,
    interval: null as "month" | "year" | null,
    subscriptionId: null as string | null,
    trialEnd: null as Date | null,
  };
  if (user) {
    try {
      subscriber = await getSubscriber(user.id);
    } catch (e) {
      Sentry.captureException(e);
      subscriber = { ...subscriber, plan: PLANS.free };
    }
  }
  const plan = subscriber.plan;

  const submitted = countWords(text);
  const ceiling = plan.limits.maxWordsPerRequest;
  const entitlement = checkEntitlement(plan, tool, submitted);

  // An over-long paste is no longer refused, for a rewrite. It is the
  // commonest way a visitor meets the ceiling, and a 413 sends them away
  // holding nothing; wall A processes the first `maxWordsPerRequest` words
  // and says so, in the editor, before the button is pressed. CLAUDE.md
  // asks for input outside the limit to be truncated before the API call
  // -- this is that truncation, and the cut is the only thing the model
  // ever sees.
  //
  // The detector is the exception, and it is refused. It measures a text
  // rather than rewriting one, so scoring the first 300 words of a
  // 900-word paste answers a question nobody asked: the reader is told
  // something about their text that was never read. Cutting silently is
  // what this used to do. The editor disables the button and says so
  // first; this is the same rule, enforced.
  if (tool === "detect" && entitlement.reason === "request_too_long") {
    return error(
      413,
      "request_too_long",
      t("request_too_long", { words: ceiling }),
    );
  }

  if (!entitlement.allowed && entitlement.reason !== "request_too_long") {
    const messages: Record<string, string> = {
      unknown_tool: t("unknown_tool"),
      tool_not_in_plan: t("tool_not_in_plan", { tool: names(`${tool}.name`) }),
    };
    return error(
      403,
      entitlement.reason ?? "forbidden",
      messages[entitlement.reason ?? ""] ?? t("forbidden"),
    );
  }

  // Wall A: an over-long paste is not refused, it is cut. This is the cut
  // CLAUDE.md asks for, and the only thing the model can ever see.
  const wanted = Math.min(submitted, ceiling);

  // The allowance is spent BEFORE the model is called, and the model only
  // ever sees what was paid for.
  //
  // It used to be the other way round: a refused request generated the
  // whole answer anyway, sent it to the browser and blurred it with CSS --
  // so we paid for inference on a request we had just refused, and the
  // text was in the DOM for anyone who opened the inspector. The wall now
  // shows the reader a real result they paid for with the words they had
  // left, and the rest was never written.
  //
  // The detector asks for all or nothing: a score measured over the first
  // 200 words of a 900-word text is a wrong answer about that text, not a
  // partial one.
  const grant = await reserveWords(
    subject,
    subscriber,
    wanted,
    tool !== "detect",
  );

  if (grant.granted === 0) {
    return NextResponse.json(
      {
        error: "quota_exceeded",
        message:
          plan.limits.wordsPerDay !== null
            ? t("quota_daily")
            : t("quota_monthly"),
        // The wall is written from these, so it can say "500 / 500 today"
        // without a limit hardcoded in a component.
        used: grant.used,
        limit: grant.limit,
      },
      {
        status: 429,
        headers: { "cache-control": "no-store", ...quotaHeaders(grant) },
      },
    );
  }

  const input =
    grant.granted < submitted ? truncateToWords(text, grant.granted) : text;
  const wordsIn = grant.granted;

  if (tool === "detect") {
    // Measured against the anchors of the language being read. See the note
    // at the top of lib/ai/detector/pipeline.ts.
    const analysis = analyze(input, locale);
    // The per-window breakdown is the paid half of the detector
    // (PlanLimits.sentenceHighlight): it is what locates a generated block
    // inside a written text. Everyone gets the band and the evidence.
    const result = plan.limits.sentenceHighlight
      ? analysis
      : { ...analysis, windows: [] };
    after(() =>
      recordUsage({
        subjectKey: subject,
        userId: user?.id ?? null,
        tool,
        wordsIn,
        wordsOut: 0,
        // Measured locally: no model call, so no per-request AI cost.
        costCents: 0,
      }).catch(() => {}),
    );
    return NextResponse.json(result, {
      headers: { "cache-control": "no-store", ...quotaHeaders(grant) },
    });
  }

  const messageStream = streamCompletion({
    system: prompt!.system,
    user: prompt!.user(input, mode),
    wordCount: wordsIn,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      messageStream.on("text", (t) => controller.enqueue(encoder.encode(t)));
      messageStream.on("error", (e) => {
        Sentry.captureException(e);
        controller.error(e);
      });
      messageStream.on("end", () => controller.close());
    },
    cancel() {
      messageStream.abort();
    },
  });

  after(async () => {
    try {
      const final = await messageStream.finalMessage();
      const outText = final.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("");
      await recordUsage({
        subjectKey: subject,
        userId: user?.id ?? null,
        tool: tool as ToolId,
        wordsIn,
        wordsOut: countWords(outText),
        costCents: estimateCostCents(final.model, final.usage),
      });
      // The plan decides whether this is kept; saveDocument holds that
      // gate, so free and anonymous text never reaches the table.
      if (user) {
        await saveDocument({
          userId: user.id,
          plan,
          tool: tool as ToolId,
          mode,
          inputText: input,
          outputText: outText,
        });
      }
    } catch {
      // finalMessage rejects when the stream errored/aborted; already reported.
    }
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      ...quotaHeaders(grant),
    },
  });
}
