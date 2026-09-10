import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse, after } from "next/server";

import { PROMPTS } from "@/lib/ai/prompts";
import { estimateCostCents, streamCompletion } from "@/lib/ai/provider";
import type { ToolId } from "@/lib/ai/tools";
import { getSession } from "@/lib/auth/server";
import { checkEntitlement, getPlan } from "@/lib/billing/entitlements";
import { PLANS, type Plan } from "@/lib/billing/plans";
import { hashIp } from "@/lib/security/crypto";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { aiToolRequestSchema, countWords } from "@/lib/security/validation";
import { checkBurstLimit, consumeDailyWords } from "@/lib/usage/quotas";
import { recordUsage } from "@/lib/usage/tracking";

export const maxDuration = 120;

function error(status: number, code: string, message: string) {
  return NextResponse.json({ error: code, message }, { status });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tool: string }> },
) {
  const body = await request.json().catch(() => null);
  const parsed = aiToolRequestSchema.safeParse({
    ...body,
    tool: (await params).tool,
  });
  if (!parsed.success) {
    return error(400, "invalid_request", "Petición no válida.");
  }
  const { tool, text, mode, turnstileToken } = parsed.data;

  const prompt = PROMPTS[tool];
  if (!prompt) {
    return error(501, "tool_not_available", "Esta herramienta llegará pronto.");
  }

  const user = await getSession();
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "0.0.0.0";
  const subject = user ? `user:${user.id}` : `ip:${hashIp(ip)}`;

  if (!user && !(await verifyTurnstile(turnstileToken, ip))) {
    return error(403, "captcha_failed", "Verificación anti-bot fallida.");
  }

  const burst = await checkBurstLimit(subject);
  if (!burst.allowed) {
    return error(
      429,
      "rate_limited",
      "Demasiadas peticiones. Espera un momento.",
    );
  }

  let plan: Plan = PLANS.anonymous;
  if (user) {
    try {
      plan = await getPlan(user.id);
    } catch (e) {
      Sentry.captureException(e);
      plan = PLANS.free;
    }
  }

  const wordsIn = countWords(text);
  const entitlement = checkEntitlement(plan, tool, wordsIn);
  if (!entitlement.allowed) {
    return error(
      entitlement.reason === "request_too_long" ? 413 : 403,
      entitlement.reason ?? "forbidden",
      `Tu plan admite hasta ${plan.limits.wordsPerRequest} palabras por petición.`,
    );
  }

  const quota = await consumeDailyWords(subject, plan, wordsIn);
  if (!quota.allowed) {
    return error(
      429,
      "quota_exceeded",
      "Has agotado tus palabras de hoy. Pásate a Pro para seguir.",
    );
  }

  const messageStream = streamCompletion({
    system: prompt.system,
    user: prompt.user(text, mode),
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
