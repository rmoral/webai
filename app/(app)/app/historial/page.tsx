import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  DeleteDocumentButton,
  HistoryOpened,
} from "@/components/app/document-actions";
import { UpsellBanner } from "@/components/billing/upsell-banner";
import { Button } from "@/components/ui/button";
import { TOOLS, type ToolId } from "@/lib/ai/tools";
import { getSession } from "@/lib/auth/server";
import { getSubscriber } from "@/lib/billing/entitlements";
import { listDocuments } from "@/lib/documents/store";

export const metadata: Metadata = {
  title: "Historial",
  robots: { index: false },
};

export default async function HistoryPage() {
  const user = await getSession();
  if (!user) redirect("/login?next=/app/historial");

  const subscriber = await getSubscriber(user.id);
  if (!subscriber.plan.limits.history) {
    return (
      <main className="mx-auto max-w-[65rem] px-6 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Historial</h1>
        <UpsellBanner
          title="El historial está en los planes de pago."
          action={
            <Button size="sm" asChild>
              <Link href="/precios">Ver planes</Link>
            </Button>
          }
          className="mt-6"
        >
          En los planes gratuitos no guardamos tus textos: se procesan y se
          descartan. Con Pro o Ilimitado cada resultado queda guardado y
          cifrado, y puedes volver a él cuando quieras.
        </UpsellBanner>
      </main>
    );
  }

  const documents = await listDocuments(user.id);

  return (
    <main className="mx-auto max-w-[65rem] px-6 py-8">
      <HistoryOpened count={documents.length} />
      <h1 className="text-2xl font-semibold tracking-tight">Historial</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Tus textos se guardan cifrados. Solo tú puedes leerlos, y puedes
        borrarlos uno a uno.
      </p>

      {documents.length === 0 ? (
        <p className="text-muted-foreground mt-8 text-sm">
          Todavía no hay nada aquí. Lo que proceses a partir de ahora aparecerá
          en esta lista.
        </p>
      ) : (
        <ul className="mt-6 divide-y rounded-xl border">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3"
            >
              <Link
                href={`/app/historial/${doc.id}`}
                className="min-w-0 flex-1 truncate text-sm hover:underline"
              >
                {doc.title}
              </Link>
              <span className="text-muted-foreground shrink-0 text-xs">
                {TOOLS[doc.tool as ToolId].name} ·{" "}
                {doc.createdAt.toLocaleDateString("es-ES")}
              </span>
              <DeleteDocumentButton id={doc.id} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
