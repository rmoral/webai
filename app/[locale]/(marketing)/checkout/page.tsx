import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { CheckoutPageView } from "@/components/billing/checkout";
import { requireSession } from "@/lib/auth/server";
import type { BillingInterval, PaidTier } from "@/lib/billing/plans";
import type { Locale } from "@/lib/i18n/routing";

// The door to payment from the pricing page. The other door is the paywall,
// which pays in a modal over the editor without coming here at all.
//
// Not indexed (see app/robots.ts) and not in the sitemap: it is a step in a
// flow, and it only means anything with a plan in the query.

export const metadata: Metadata = { robots: { index: false, follow: false } };

// Never prerendered. It reads the session and the query, so a cached copy
// would be somebody else's answer -- in the worst case a build-time
// redirect to login baked in for everyone.
export const dynamic = "force-dynamic";

function tierOf(value: string | undefined): PaidTier {
  return value === "pro" ? "pro" : "unlimited";
}

function intervalOf(value: string | undefined): BillingInterval {
  return value === "yearly" ? "yearly" : "monthly";
}

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ plan?: string; cycle?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Nobody can be billed without an account to bill. requireSession sends
  // them to sign in and back.
  await requireSession();

  const { plan, cycle } = await searchParams;

  return (
    <main className="mx-auto max-w-[65rem] px-6 py-12">
      <CheckoutPageView
        tier={tierOf(plan)}
        initialInterval={intervalOf(cycle)}
      />
    </main>
  );
}
