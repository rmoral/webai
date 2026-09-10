import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PLANS, PRICING } from "@/lib/billing/plans";

export const metadata: Metadata = {
  title: "Precios",
  description:
    "Planes de Verbalyx: gratis para empezar, Pro para escribir sin límites.",
};

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Precios</h1>
      <p className="text-muted-foreground mt-3">
        Empieza gratis. El plan Pro estará disponible muy pronto.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{PLANS.free.name}</CardTitle>
            <CardDescription>0 €</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            {PLANS.free.limits.wordsPerDay} palabras al día · todas las
            herramientas disponibles al lanzarse
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {PLANS.pro.name} <Badge variant="secondary">Muy pronto</Badge>
            </CardTitle>
            <CardDescription>
              {PRICING.proMonthly.amount.toLocaleString("es-ES", {
                style: "currency",
                currency: PRICING.proMonthly.currency,
              })}
              /mes ·{" "}
              {PRICING.proYearly.amount.toLocaleString("es-ES", {
                style: "currency",
                currency: PRICING.proYearly.currency,
              })}
              /año
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            {PLANS.pro.limits.wordsPerRequest.toLocaleString("es-ES")} palabras
            por petición · sin límite diario · historial de documentos
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
