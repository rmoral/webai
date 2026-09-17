import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ToolLanding } from "@/components/marketing/tool-landing";
import { alternatesFor } from "@/lib/i18n/metadata";
import type { Locale } from "@/lib/i18n/routing";

type Params = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing.humanize" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: alternatesFor("/humanize", locale),
  };
}

export default async function Page({ params }: Params) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ToolLanding tool="humanize" locale={locale} related="detect" />;
}
