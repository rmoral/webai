import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";

// Renders inside the [locale] layout, so a 404 reached from /en/... answers
// in English rather than dropping the visitor into the other language.
export default async function NotFound() {
  const t = await getTranslations("errors");

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold">{t("notFoundTitle")}</h1>
      <p className="text-muted-foreground text-sm">{t("notFoundBody")}</p>
      <Button asChild>
        <Link href="/">{t("notFoundCta")}</Link>
      </Button>
    </main>
  );
}
