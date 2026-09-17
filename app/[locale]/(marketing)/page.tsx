import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ToolEditor } from "@/components/tools/tool-editor";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/lib/billing/plans";
import { alternatesFor } from "@/lib/i18n/metadata";
import { Link } from "@/lib/i18n/navigation";
import type { Locale } from "@/lib/i18n/routing";

type Params = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: alternatesFor("/", locale) };
}

// The home page is the page that gets the most traffic, so it is the tool
// itself: no extra click between landing and first use.
export default async function HomePage({ params }: Params) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <main className="mx-auto max-w-[65rem] px-6 py-12">
      <div className="flex flex-col items-center gap-4 text-center">
        <Badge variant="brand">
          {t("badge", { words: PLANS.anonymous.limits.wordsPerDay ?? 0 })}
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {t("h1")}
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg">{t("intro")}</p>
      </div>

      <div className="mt-10">
        <ToolEditor tool="humanize" />
      </div>

      <p className="text-muted-foreground mt-10 text-center text-sm">
        {t("more")}{" "}
        <Link href="/pricing" className="underline">
          {t("morePricing")}
        </Link>
        .
      </p>
    </main>
  );
}
