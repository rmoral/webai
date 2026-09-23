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
    .select({
      customerId: subscriptions.stripeCustomerId,
      subscriptionId: subscriptions.stripeSubscriptionId,
    })
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
  // The cancellation links in the emails come here. Landing on the portal's
  // front page and being asked to find the cancel button is how "two
  // clicks" stops being true, so the flow is named and Stripe opens on the
  // confirmation itself.
  const straightToCancel =
    request.nextUrl.searchParams.get("flow") === "cancel" &&
    subscription.subscriptionId;

  const portal = await getStripe().billingPortal.sessions.create({
    customer: subscription.customerId,
    return_url: `${appUrl}/app`,
    ...(straightToCancel
      ? {
          flow_data: {
            type: "subscription_cancel" as const,
            subscription_cancel: { subscription: straightToCancel },
          },
        }
      : {}),
  });
  return NextResponse.redirect(portal.url, 303);
}
