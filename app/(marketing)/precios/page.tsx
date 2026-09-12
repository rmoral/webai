import type { Metadata } from "next";
import Link from "next/link";

import { CheckoutButton } from "@/components/marketing/checkout-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    "Planes de Verbalyx: gratis para empezar, Pro con prueba de 3 días para escribir sin límites.",
};

function euros(amount: number) {
  return amount.toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
  });
}

export default function PricingPage() {
  const monthlyEquivalent = PRICING.proYearly.amount / 12;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Precios</h1>
      <p className="text-muted-foreground mt-3">
        Empieza gratis. Prueba Pro 3 días — cancela antes y no pagas nada.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{PLANS.free.name}</CardTitle>
            <CardDescription>0 €</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>· {PLANS.free.limits.wordsPerDay} palabras al día</li>
              <li>· Humanizador (y pronto el resto de herramientas)</li>
            </ul>
            <Button variant="outline" asChild>
              <Link href="/login">Crear cuenta gratis</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {PLANS.pro.name} anual <Badge>Recomendado</Badge>
            </CardTitle>
            <CardDescription>
              {euros(PRICING.proYearly.amount)}/año — sale a{" "}
              {euros(monthlyEquivalent)}/mes
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>
                · {PLANS.pro.limits.wordsPerRequest.toLocaleString("es-ES")}{" "}
                palabras por petición
              </li>
              <li>· Sin límite diario</li>
              <li>· Historial de documentos</li>
              <li>· Todas las herramientas</li>
            </ul>
            <CheckoutButton interval="yearly" />
            <p className="text-muted-foreground text-xs">
              ¿Prefieres pagar mes a mes? Pro mensual por{" "}
              {euros(PRICING.proMonthly.amount)}/mes:
            </p>
            <CheckoutButton interval="monthly" variant="outline" />
          </CardContent>
        </Card>
      </div>

      <p className="text-muted-foreground mt-8 text-xs">
        Precios con IVA incluido. La prueba requiere tarjeta; puedes cancelar en
        cualquier momento desde tu cuenta. Al activar la suscripción aceptas los{" "}
        <Link href="/legal/terminos" className="underline">
          términos del servicio
        </Link>{" "}
        y renuncias al derecho de desistimiento al acceder de inmediato al
        contenido digital.
      </p>
    </main>
  );
}
