import type { Metadata } from "next";
import { getFormatter, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import type { ModeId, ToolId } from "@/lib/ai/tools";
import { requireSession } from "@/lib/auth/server";
import { getDocument } from "@/lib/documents/store";
import { Link } from "@/lib/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("history");
  return { title: t("docTitle"), robots: { index: false } };
}

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations();
  const format = await getFormatter();
  const user = await requireSession();

  // Scoped to the caller inside getDocument, so someone else's id is a 404
  // rather than a forbidden — it should not confirm the document exists.
  const doc = await getDocument((await params).id, user.id);
  if (!doc) notFound();

  return (
    <main className="mx-auto max-w-[65rem] px-6 py-8">
      <Link href="/app/history" className="text-sm underline">
        {t("history.back")}
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">
        {doc.title}
      </h1>
      <p className="text-muted-foreground mt-1 text-sm">
        {t(`tools.${doc.tool as ToolId}.name`)}
        {doc.mode && ` · ${t(`modes.${doc.mode as ModeId}`)}`} ·{" "}
        {format.dateTime(doc.createdAt, "short")}
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section className="bg-card rounded-xl border p-5">
          <h2 className="text-muted-foreground text-xs font-semibold tracking-[0.06em] uppercase">
            {t("history.input")}
          </h2>
          <p className="mt-3 text-sm whitespace-pre-wrap">{doc.inputText}</p>
        </section>
        <section className="bg-card rounded-xl border p-5">
          <h2 className="text-muted-foreground text-xs font-semibold tracking-[0.06em] uppercase">
            {t("history.output")}
          </h2>
          <p className="mt-3 text-sm whitespace-pre-wrap">{doc.outputText}</p>
        </section>
      </div>
    </main>
  );
}
