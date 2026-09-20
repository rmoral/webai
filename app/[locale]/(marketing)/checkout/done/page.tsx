import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { PaymentSuccess } from "@/components/billing/checkout";
import { requireSession } from "@/lib/auth/server";
import { getSubscriber } from "@/lib/billing/entitlements";
import {
  PRICES,
  type BillingInterval,
  type PaidTier,
} from "@/lib/billing/plans";
import type { Locale } from "@/lib/i18n/routing";

// Confirmation, for a payment that left the page and came back.
//
// The card flow confirms in place and never reaches here. A bank redirect
// does, and before this it landed on /app -- so the one screen that has to
// show the date of the first charge was the one screen that never appeared.
//
// The figures come from our own subscription row, written by the webhook,
// rather than from the query string: a confirmation whose numbers arrive in
// the URL is a confirmation anybody can forge.

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function CheckoutDonePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  setRequestLocale((await params).locale);
  const user = await requireSession();
  const subscriber = await getSubscriber(user.id).catch(() => null);

  const tier: PaidTier =
    subscriber?.plan.id === "unlimited" ? "unlimited" : "pro";
  const interval: BillingInterval =
    subscriber?.interval === "year" ? "yearly" : "monthly";

  // A trial charges nothing today, and its end is the date of the first
  // charge. Anything else was charged in full, and the next charge is the
  // end of the period that was just opened.
  const trialing = subscriber?.trialEnd != null;
  const charge = subscriber?.trialEnd ?? subscriber?.periodEnd ?? null;

  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <PaymentSuccess
        target={{ tier, interval }}
        paid={{
          amountTodayCents: trialing
            ? 0
            : Math.round(PRICES[tier][interval].amount * 100),
          nextChargeAt: charge ? charge.toISOString() : null,
        }}
      />
    </main>
  );
}
