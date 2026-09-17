import { getTranslations } from "next-intl/server";

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
            <Link href="/app/history" className="ml-auto hover:underline">
              {t("app.history")}
            </Link>
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
      {children}
    </div>
  );
}
