import type { Metadata } from "next";
import Link from "next/link";

import { CheckoutButton } from "@/components/marketing/checkout-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trialDisclosure } from "@/lib/billing/disclosure";
import {
  PLANS,
  PRICES,
  TOPUP,
  TRIAL,
  formatUsd,
  yearlySaving,
} from "@/lib/billing/plans";

export const metadata: Metadata = {
  title: "Precios",
  description:
    "Planes de Verbalyx: gratis para empezar, Pro y Ilimitado para escribir sin frenos. Prueba Ilimitado 3 días.",
};

const words = (value: number) => value.toLocaleString("es-ES");

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-[65rem] px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Precios</h1>
      <p className="text-muted-foreground mt-3">
        Empieza gratis. Prueba Ilimitado {TRIAL.days} días y decide después.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        <section className="rounded-xl border p-4">
          <h2 className="font-semibold">{PLANS.free.name}</h2>
          <p className="mt-1 text-2xl font-semibold">{formatUsd(0)}</p>
          <ul className="text-muted-foreground mt-4 space-y-1 text-sm">
            <li>{words(PLANS.free.limits.wordsPerDay ?? 0)} palabras al día</li>
            <li>
              Hasta {words(PLANS.free.limits.maxWordsPerRequest)} por petición
            </li>
            <li>Humanizador y detector (puntuación global)</li>
          </ul>
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/login">Crear cuenta gratis</Link>
          </Button>
        </section>

        <section className="rounded-xl border p-4">
          <h2 className="font-semibold">{PLANS.pro.name}</h2>
          <p className="mt-1 text-2xl font-semibold">
            {formatUsd(PRICES.pro.yearly.monthlyEquivalent)}
            <span className="text-muted-foreground text-base font-normal">
              {" "}
              /mes
            </span>
          </p>
          <p className="text-muted-foreground text-sm">
            {formatUsd(PRICES.pro.yearly.amount)} al año — ahorras{" "}
            {formatUsd(yearlySaving("pro"))}. Mensual:{" "}
            {formatUsd(PRICES.pro.monthly.amount)}
          </p>
          <ul className="text-muted-foreground mt-4 space-y-1 text-sm">
            <li>
              {words(PLANS.pro.limits.wordsPerMonth ?? 0)} palabras al mes
            </li>
            <li>
              Hasta {words(PLANS.pro.limits.maxWordsPerRequest)} por petición
            </li>
            <li>Todas las herramientas, historial y sin marca de agua</li>
          </ul>
          <div className="mt-4 flex flex-col gap-2">
            <CheckoutButton
              plan="pro"
              interval="yearly"
              label="Elegir Pro anual"
            />
            <CheckoutButton
              plan="pro"
              interval="monthly"
              variant="outline"
              label="Pro mensual"
            />
          </div>
        </section>

        <section className="border-brand ring-brand rounded-xl border p-4 ring-1">
          <h2 className="flex items-center gap-2 font-semibold">
            {PLANS.unlimited.name}{" "}
            <Badge variant="brand">Prueba {TRIAL.days} días</Badge>
          </h2>
          <p className="mt-1 text-2xl font-semibold">
            {formatUsd(PRICES.unlimited.yearly.monthlyEquivalent)}
            <span className="text-muted-foreground text-base font-normal">
              {" "}
              /mes
            </span>
          </p>
          <p className="text-muted-foreground text-sm">
            {formatUsd(PRICES.unlimited.yearly.amount)} al año — ahorras{" "}
            {formatUsd(yearlySaving("unlimited"))}. Mensual:{" "}
            {formatUsd(PRICES.unlimited.monthly.amount)}
          </p>
          <ul className="text-muted-foreground mt-4 space-y-1 text-sm">
            <li>
              {words(PLANS.unlimited.limits.wordsPerMonth ?? 0)} palabras al mes
            </li>
            <li>
              Hasta {words(PLANS.unlimited.limits.maxWordsPerRequest)} por
              petición
            </li>
            <li>Prioridad de cola</li>
          </ul>
          <div className="mt-4 flex flex-col gap-2">
            <CheckoutButton
              plan="unlimited"
              interval="monthly"
              label={`Probar ${TRIAL.days} días gratis`}
            />
            <CheckoutButton
              plan="unlimited"
              interval="yearly"
              variant="outline"
              label="Ilimitado anual"
            />
          </div>
          {/* Required before collecting payment details (§6.1). */}
          <p className="mt-3 text-xs" data-testid="trial-disclosure">
            {trialDisclosure()}
          </p>
        </section>
      </div>

      <section className="mt-8 rounded-xl border p-4">
        <h2 className="font-semibold">Recarga de palabras</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {formatUsd(TOPUP.amount)} por {words(TOPUP.words)} palabras
          adicionales. No caducan. Requiere una suscripción activa.
        </p>
        <CheckoutButton
          plan="topup"
          interval="monthly"
          variant="outline"
          label="Comprar recarga"
        />
      </section>

      <p className="text-muted-foreground mt-8 text-xs">
        Precios en dólares estadounidenses, sin impuestos incluidos; los
        impuestos aplicables —incluido el impuesto sobre ventas de EE. UU. o el
        IVA de tu país cuando corresponda— se calculan en el pago. La renovación
        es automática y puedes cancelar en línea, en cualquier momento, desde tu
        cuenta. Consulta los{" "}
        <Link href="/legal/terminos" className="underline">
          términos del servicio
        </Link>
        .
      </p>
    </main>
  );
}
