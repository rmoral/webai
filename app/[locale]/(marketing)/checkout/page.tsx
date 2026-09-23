import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { CheckoutPageView } from "@/components/billing/checkout";
import { requireSession } from "@/lib/auth/server";
import { getPathname } from "@/lib/i18n/navigation";
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

  const { plan, cycle } = await searchParams;
  const tier = tierOf(plan);
  const interval = intervalOf(cycle);

  // Nobody can be billed without an account to bill -- but somebody who
  // has just pressed "try it free" is not coming back to anything, and the
  // page that greets them said "welcome back" while quietly dropping the
  // plan they had chosen. They go to sign-up instead, carrying this exact
  // URL, so signing up ends on the card field with the plan already picked.
  //
  // The `next` is the LOCALISED path: /pricing and /checkout are internal
  // names that only exist in the routing table, and handing one to a
  // redirect lands a Spanish reader on a 404.
  await requireSession({
    signup: true,
    next: getPathname({
      href: { pathname: "/checkout", query: { plan: tier, cycle: interval } },
      locale,
    }),
  });

  return (
    <main className="mx-auto max-w-[65rem] px-6 py-12">
      <CheckoutPageView tier={tier} initialInterval={interval} />
    </main>
  );
}
