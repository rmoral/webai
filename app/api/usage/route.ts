import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth/server";
import { getSubscriber } from "@/lib/billing/entitlements";
import { PLANS } from "@/lib/billing/plans";
import { hashIp } from "@/lib/security/crypto";
import { QUOTA_TIMEZONE } from "@/lib/usage/day";
import { checkBurstLimit, peekWords } from "@/lib/usage/quotas";

// What is left, for a surface that has no server render to read it from.
//
// The signed-in header gets its first value from the layout and every one
// after that from the tool endpoint's headers. The tool pages are static
// and anonymous, so they have neither: without this the editor could not
// say "te quedan 200 palabras" until after the reader had already spent
// some, which is the wrong half of the sentence to be sure about.
//
// It never consumes and never writes. It answers about the caller and
// nobody else: the session, or the hashed IP the quota itself is keyed by.

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getSession();
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "0.0.0.0";
  const subject = user ? `user:${user.id}` : `ip:${hashIp(ip)}`;

  // A Redis read is cheap and this runs on page load, but it is still an
  // unauthenticated endpoint: the same burst limit as everything else.
  if (!(await checkBurstLimit(`usage:${subject}`)).allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const subscriber = user
    ? await getSubscriber(user.id).catch(() => null)
    : null;
  const allowance = await peekWords(
    subject,
    subscriber ?? {
      plan: PLANS.anonymous,
      topupWords: 0,
      periodStart: null,
      periodEnd: null,
      interval: null,
      subscriptionId: null,
      trialEnd: null,
    },
  );

  return NextResponse.json(
    // The plan travels with the allowance because the pages that have no
    // server render need both: the editor to know what it may offer, and
    // /pricing to mark the card the reader is already paying for.
    {
      ...allowance,
      plan: subscriber?.plan.id ?? PLANS.anonymous.id,
      timezone: QUOTA_TIMEZONE,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
