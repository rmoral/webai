import type { Metadata } from "next";
import { getFormatter, getTranslations } from "next-intl/server";

import {
  DeleteDocumentButton,
  HistoryOpened,
} from "@/components/app/document-actions";
import { UpsellBanner } from "@/components/billing/upsell-banner";
import { Button } from "@/components/ui/button";
import type { ToolId } from "@/lib/ai/tools";
import { requireSession } from "@/lib/auth/server";
import { getSubscriber } from "@/lib/billing/entitlements";
import { listDocuments } from "@/lib/documents/store";
import { Link } from "@/lib/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("history");
  return { title: t("title"), robots: { index: false } };
}

export default async function HistoryPage() {
  const t = await getTranslations();
  const format = await getFormatter();
  const user = await requireSession();

  const subscriber = await getSubscriber(user.id);
  if (!subscriber.plan.limits.history) {
    return (
      <main className="mx-auto max-w-[65rem] px-6 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("history.title")}
        </h1>
        <UpsellBanner
          title={t("history.gatedTitle")}
          action={
            <Button size="sm" asChild>
              <Link href="/pricing">{t("editor.seePlans")}</Link>
            </Button>
          }
          className="mt-6"
        >
          {t("history.gatedBody")}
        </UpsellBanner>
      </main>
    );
  }

  const documents = await listDocuments(user.id);

  return (
    <main className="mx-auto max-w-[65rem] px-6 py-8">
      <HistoryOpened count={documents.length} />
      <h1 className="text-2xl font-semibold tracking-tight">
        {t("history.title")}
      </h1>
      <p className="text-muted-foreground mt-1 text-sm">{t("history.intro")}</p>

      {documents.length === 0 ? (
        <p className="text-muted-foreground mt-8 text-sm">
          {t("history.empty")}
        </p>
      ) : (
        <ul className="mt-6 divide-y rounded-xl border">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3"
            >
              <Link
                href={{
                  pathname: "/app/history/[id]",
                  params: { id: doc.id },
                }}
                className="min-w-0 flex-1 truncate text-sm hover:underline"
              >
                {doc.title}
              </Link>
              <span className="text-muted-foreground shrink-0 text-xs">
                {t(`tools.${doc.tool as ToolId}.name`)} ·{" "}
                {format.dateTime(doc.createdAt, "short")}
              </span>
              <DeleteDocumentButton id={doc.id} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
