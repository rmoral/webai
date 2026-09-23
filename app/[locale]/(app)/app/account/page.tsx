import type { Metadata } from "next";
import { getFormatter, getTranslations } from "next-intl/server";

import { DeleteAccountButton } from "@/components/app/delete-account-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireSession } from "@/lib/auth/server";
import { getSubscriber } from "@/lib/billing/entitlements";
import { Link } from "@/lib/i18n/navigation";
import { getUserUsage } from "@/lib/usage/summary";
import { QUOTA_TIMEZONE, peekWords } from "@/lib/usage/quotas";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account");
  return { title: t("title"), robots: { index: false } };
}

export default async function AccountPage() {
  const t = await getTranslations();
  const format = await getFormatter();
  const user = await requireSession();

  const [subscriber, usage] = await Promise.all([
    getSubscriber(user.id).catch(() => null),
    getUserUsage(user.id).catch(() => null),
  ]);
  const plan = subscriber?.plan ?? null;

  // "Hoy" is the allowance, read from where the allowance lives -- not a
  // sum of usage_daily, which counts words processed and so answered "600"
  // under a limit of 500 while the header said something else again.
  // usage_daily still answers the two historical figures, which is what it
  // is for.
  const allowance = subscriber
    ? await peekWords(`user:${user.id}`, subscriber).catch(() => null)
    : null;
  const isPaid = plan !== null && plan.id !== "free" && plan.id !== "anonymous";

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-semibold">{t("account.title")}</h1>

      <div className="mt-8 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("account.data")}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            {t("account.created", {
              date: format.dateTime(new Date(user.created_at), "short"),
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("account.subscription")}</CardTitle>
            <CardDescription>
              {t("account.plan", { plan: t(`plans.${plan?.id ?? "free"}`) })}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <p className="text-muted-foreground">
              {isPaid
                ? t("account.limitsPaid", {
                    month: plan!.limits.wordsPerMonth ?? 0,
                    request: plan!.limits.maxWordsPerRequest,
                  })
                : t("account.limitsFree", {
                    day: plan?.limits.wordsPerDay ?? 0,
                    request: plan?.limits.maxWordsPerRequest ?? 0,
                  })}
              {subscriber &&
                subscriber.topupWords > 0 &&
                t("account.topups", { words: subscriber.topupWords })}
            </p>
            {isPaid ? (
              <form action="/api/stripe/portal" method="POST">
                <Button type="submit" variant="outline">
                  {t("account.manage")}
                </Button>
                {/* US auto-renewal laws require the cancellation path to be
                    as easy as signing up, and to be labelled as such. */}
                <p className="text-muted-foreground mt-2 text-xs">
                  {t("account.cancelNote")}
                </p>
              </form>
            ) : (
              <Button asChild>
                <Link href="/pricing">{t("editor.seePlans")}</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("account.usage")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <dl className="grid grid-cols-3 gap-4">
              <div>
                <dt className="text-muted-foreground">{t("account.today")}</dt>
                <dd className="text-lg font-medium">
                  {allowance && allowance.limit !== null
                    ? `${format.number(allowance.used)} / ${format.number(allowance.limit)}`
                    : format.number(usage?.wordsToday ?? 0)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("account.month")}</dt>
                <dd className="text-lg font-medium">
                  {format.number(usage?.wordsMonth ?? 0)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">
                  {t("account.requests")}
                </dt>
                <dd className="text-lg font-medium">
                  {format.number(usage?.requestsMonth ?? 0)}
                </dd>
              </div>
            </dl>
            {allowance?.metered && allowance.limit !== null && (
              // Nobody could have known when the day ends: it was UTC by
              // accident, and nothing said so anywhere.
              <p className="text-muted-foreground mt-4 text-xs leading-normal">
                {t("account.resets", { timezone: QUOTA_TIMEZONE })}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle>{t("account.deleteTitle")}</CardTitle>
            <CardDescription>{t("account.deleteBody")}</CardDescription>
          </CardHeader>
          <CardContent>
            <DeleteAccountButton />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
