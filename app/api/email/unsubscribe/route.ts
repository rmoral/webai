import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { applyOptOut } from "@/lib/email/unsubscribe";

// One-click unsubscribe, for the mailbox providers rather than for people.
//
// Gmail and Yahoo require a bulk sender to honour a POST to the
// List-Unsubscribe URL with no confirmation step; the caller is not a
// browser and there is nothing to render for it. A person clicking the
// visible link lands on the page instead, which asks first -- and that
// separation is the point, because an email client that prefetches links
// must not be able to unsubscribe somebody who never clicked.
//
// Deliberately without a rate limit. The write is idempotent and needs a
// valid signature, so a flood achieves nothing, and the protections in this
// codebase fail closed -- which here would mean refusing a legitimate
// unsubscribe because Upstash was down. That is the worse failure, legally
// and otherwise.

export const dynamic = "force-dynamic";

const schema = z.object({ t: z.string().min(1).max(200) });

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse({
    t: request.nextUrl.searchParams.get("t") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  try {
    if (!(await applyOptOut(parsed.data.t))) {
      return NextResponse.json({ error: "invalid_token" }, { status: 400 });
    }
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  return new NextResponse("Unsubscribed", { status: 200 });
}
