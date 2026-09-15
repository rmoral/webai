import Link from "next/link";

import { ToolEditor } from "@/components/tools/tool-editor";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/lib/billing/plans";

// The home page is the page that gets the most traffic, so it is the tool
// itself: no extra click between landing and first use.
export default function HomePage() {
  return (
    <main className="mx-auto max-w-[65rem] px-6 py-12">
      <div className="flex flex-col items-center gap-4 text-center">
        <Badge variant="brand">
          Sin registro · {PLANS.anonymous.limits.wordsPerDay} palabras al día
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Escribe mejor con IA, en español
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Humaniza, detecta, parafrasea y corrige tus textos. Hecho para el
          español de España y LATAM, no traducido de una herramienta inglesa.
        </p>
      </div>

      <div className="mt-10">
        <ToolEditor tool="humanize" />
      </div>

      <p className="text-muted-foreground mt-10 text-center text-sm">
        ¿Necesitas más palabras al día?{" "}
        <Link href="/precios" className="underline">
          Consulta los planes
        </Link>
        .
      </p>
    </main>
  );
}
