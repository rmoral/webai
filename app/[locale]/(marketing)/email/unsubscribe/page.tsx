import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { unsubscribe } from "./actions";

import { Button } from "@/components/ui/button";
import { verifyOptOutToken } from "@/lib/email/optout";
import { Link } from "@/lib/i18n/navigation";
import type { Locale } from "@/lib/i18n/routing";

// Where the "stop sending these" line in an onboarding email lands.
//
// It asks before doing anything, which is not politeness: some email clients
// fetch every link in a message to build a preview, and a page that
// unsubscribes on being loaded would take people off the list who never
// clicked. The write happens on the form's POST.
//
// Not a page of the site: noindex here, disallowed in robots.ts.

export const metadata: Metadata = {
  title: "Baja",
  robots: { index: false, follow: false },
};

type Params = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{
    t?: string;
    done?: string;
    invalid?: string;
    error?: string;
  }>;
};

export default async function UnsubscribePage({
  params,
  searchParams,
}: Params) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { t: token, done, invalid, error } = await searchParams;
  const t = await getTranslations("unsubscribe");

  // Checked here, not only in the action: a link that lost half its token to
  // a mail client's line wrapping should say so on arrival rather than after
  // somebody has pressed a button that could not have worked.
  const signed = token ? verifyOptOutToken(token) !== null : false;

  const state = done
    ? "done"
    : error
      ? "error"
      : invalid || !signed
        ? "invalid"
        : "ask";

  return (
    <main className="mx-auto max-w-[36rem] px-6 py-20">
      <h1 className="text-2xl font-semibold tracking-tight">
        {t(`${state}.title`)}
      </h1>
      <p className="text-muted-foreground mt-3 leading-relaxed">
        {t(`${state}.body`)}
      </p>

      {state === "ask" && (
        <form action={unsubscribe} className="mt-8">
          <input type="hidden" name="t" value={token} />
          <input type="hidden" name="locale" value={locale} />
          <Button type="submit">{t("ask.confirm")}</Button>
        </form>
      )}

      <p className="mt-8 text-sm">
        <Link href="/" className="underline">
          {t("home")}
        </Link>
      </p>
    </main>
  );
}
