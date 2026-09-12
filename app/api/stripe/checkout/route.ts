import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getSession } from "@/lib/auth/server";
import { getStripe, PRICE_IDS } from "@/lib/billing/stripe";

const bodySchema = z.object({
  interval: z.enum(["monthly", "yearly"]).default("yearly"),
});

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const price = PRICE_IDS[parsed.data.interval]();
  if (!price) {
    return NextResponse.json(
      { error: "price_not_configured" },
      { status: 503 },
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    client_reference_id: user.id,
    customer_email: user.email,
    allow_promotion_codes: true,
    automatic_tax: { enabled: true },
    // Closed decision (plan §4.2): 3-day trial, card always required.
    payment_method_collection: "always",
    subscription_data: { trial_period_days: 3, metadata: { user_id: user.id } },
    success_url: `${appUrl}/app?checkout=success`,
    cancel_url: `${appUrl}/precios?checkout=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
