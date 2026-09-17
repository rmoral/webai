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
import { aiToolRequestSchema, countWords } from "@/lib/security/validation";
import { routing, splitLocale } from "@/lib/i18n/routing";
import { checkBurstLimit, consumeWords } from "@/lib/usage/quotas";
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
    subscriptionId: null as string | null,
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

  const wordsIn = countWords(text);
  const entitlement = checkEntitlement(plan, tool, wordsIn);
  if (!entitlement.allowed) {
    const messages: Record<string, string> = {
      unknown_tool: t("unknown_tool"),
      tool_not_in_plan: t("tool_not_in_plan", { tool: names(`${tool}.name`) }),
      request_too_long: t("request_too_long", {
        words: plan.limits.maxWordsPerRequest,
      }),
    };
    return error(
      entitlement.reason === "request_too_long" ? 413 : 403,
      entitlement.reason ?? "forbidden",
      messages[entitlement.reason ?? ""] ?? t("forbidden"),
    );
  }

  const quota = await consumeWords(subject, subscriber, wordsIn);
  if (!quota.allowed) {
    return error(
      429,
      "quota_exceeded",
      plan.limits.wordsPerDay !== null ? t("quota_daily") : t("quota_monthly"),
    );
  }

  if (tool === "detect") {
    const analysis = analyze(text);
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
      headers: {
        "cache-control": "no-store",
        ...(quota.remaining !== null
          ? { "x-words-remaining": String(quota.remaining) }
          : {}),
      },
    });
  }

  const messageStream = streamCompletion({
    system: prompt!.system,
    user: prompt!.user(text, mode),
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
          inputText: text,
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
      ...(quota.remaining !== null
        ? { "x-words-remaining": String(quota.remaining) }
        : {}),
    },
  });
}
