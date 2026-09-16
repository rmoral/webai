import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { TOOLS, type ToolId } from "@/lib/ai/tools";
import { getSession } from "@/lib/auth/server";
import { getDocument } from "@/lib/documents/store";

export const metadata: Metadata = {
  title: "Documento",
  robots: { index: false },
};

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSession();
  if (!user) redirect("/login?next=/app/historial");

  // Scoped to the caller inside getDocument, so someone else's id is a 404
  // rather than a forbidden — it should not confirm the document exists.
  const doc = await getDocument((await params).id, user.id);
  if (!doc) notFound();

  return (
    <main className="mx-auto max-w-[65rem] px-6 py-8">
      <Link href="/app/historial" className="text-sm underline">
        Volver al historial
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">
        {doc.title}
      </h1>
      <p className="text-muted-foreground mt-1 text-sm">
        {TOOLS[doc.tool as ToolId].name}
        {doc.mode && ` · ${doc.mode}`} ·{" "}
        {doc.createdAt.toLocaleDateString("es-ES")}
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section className="bg-card rounded-xl border p-5">
          <h2 className="text-muted-foreground text-xs font-semibold tracking-[0.06em] uppercase">
            Tu texto
          </h2>
          <p className="mt-3 text-sm whitespace-pre-wrap">{doc.inputText}</p>
        </section>
        <section className="bg-card rounded-xl border p-5">
          <h2 className="text-muted-foreground text-xs font-semibold tracking-[0.06em] uppercase">
            Resultado
          </h2>
          <p className="mt-3 text-sm whitespace-pre-wrap">{doc.outputText}</p>
        </section>
      </div>
    </main>
  );
}
