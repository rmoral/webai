import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth/server";
import { getStripe } from "@/lib/billing/stripe";
import { getDb } from "@/lib/db/client";
import { subscriptions } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.redirect(
      new URL("/login", request.nextUrl.origin),
      303,
    );
  }

  const [subscription] = await getDb()
    .select({ customerId: subscriptions.stripeCustomerId })
    .from(subscriptions)
    .where(eq(subscriptions.userId, user.id))
    .limit(1);

  if (!subscription?.customerId) {
    return NextResponse.redirect(
      new URL("/precios", request.nextUrl.origin),
      303,
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  const portal = await getStripe().billingPortal.sessions.create({
    customer: subscription.customerId,
    return_url: `${appUrl}/app`,
  });
  return NextResponse.redirect(portal.url, 303);
}
