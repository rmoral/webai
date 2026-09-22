import { getTranslations } from "next-intl/server";

import { FeatureLock } from "@/components/billing/paywall";
import { TrialEndGate } from "@/components/billing/trial-end-gate";
import { QuotaBar } from "@/components/billing/quota-bar";
import { ToolTabs } from "@/components/navigation/tool-tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { isAdmin } from "@/lib/auth/admin";
import { ensureUserRecord } from "@/lib/auth/ensure-user";
import { requireSession } from "@/lib/auth/server";
import { getSubscriber } from "@/lib/billing/entitlements";
import { Link } from "@/lib/i18n/navigation";
import { peekWords } from "@/lib/usage/quotas";

// Shell for the signed-in area: every page under it has a guaranteed session.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations();
  const user = await requireSession();

  // Keeps the mirror row in sync for users who signed in before it existed.
  await ensureUserRecord(user.id, user.email);

  // The header must not be able to take the app down: a database blip
  // should cost the quota bar, not the page.
  const subscriber = await getSubscriber(user.id).catch(() => null);
  const { used, limit } = subscriber
    ? await peekWords(`user:${user.id}`, subscriber)
    : { used: 0, limit: null };
  const metered = subscriber?.plan.limits.wordsPerDay !== null;

  // Wall E, on the last day of the trial and before the charge. `trialEnd`
  // is mirrored from Stripe by the webhook, so this costs a column read
  // rather than an API call on every page of the signed-in area.
  //
  // Stripe's own trial_will_end fires three days out, which on a three-day
  // trial is the moment the trial starts -- it cannot be what triggers
  // this, and it is not what triggers the reminder email either.
  const trialEndsWithin24h =
    subscriber?.trialEnd != null &&
    subscriber.trialEnd.getTime() - Date.now() < 24 * 60 * 60 * 1000;

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto max-w-[65rem] px-6">
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 text-sm">
            <Link href="/app" className="font-semibold tracking-tight">
              Verbalyx
            </Link>
            {subscriber && (
              <>
                <Badge variant="brand">
                  {t(`plans.${subscriber.plan.id}`)}
                </Badge>
                <QuotaBar
                  used={used}
                  limit={limit}
                  unit={metered ? t("app.wordsToday") : t("app.wordsMonth")}
                  showPlan={false}
                  className="w-40"
                />
              </>
            )}
            {/* Wall D. On a free plan the history is a lock rather than a
                link: sending someone to a page whose whole content is "you
                cannot have this" is a worse answer than saying it here. */}
            {subscriber && !subscriber.plan.limits.history ? (
              <div className="ml-auto">
                <FeatureLock
                  feature="history"
                  plan={subscriber.plan.id}
                  label={t("app.history")}
                />
              </div>
            ) : (
              <Link href="/app/history" className="ml-auto hover:underline">
                {t("app.history")}
              </Link>
            )}
            <Link href="/app/account" className="hover:underline">
              {t("app.account")}
            </Link>
            {isAdmin(user.email) && (
              <Link href="/admin" className="hover:underline">
                {t("app.admin")}
              </Link>
            )}
            <form action="/auth/signout" method="POST">
              <Button variant="outline" size="sm" type="submit">
                {t("app.signOut")}
              </Button>
            </form>
          </nav>
          <ToolTabs />
        </div>
      </header>
      {trialEndsWithin24h && <TrialEndGate />}
      {children}
    </div>
  );
}
