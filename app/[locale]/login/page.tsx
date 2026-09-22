import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AuthForm } from "@/components/auth/auth-form";
import type { Locale } from "@/lib/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("signinMetaTitle"), robots: { index: false } };
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  setRequestLocale((await params).locale);
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <AuthForm mode="signin" />
    </main>
  );
}
