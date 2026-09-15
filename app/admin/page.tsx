import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isAdmin } from "@/lib/auth/admin";
import { getSession } from "@/lib/auth/server";
import { getAdminTotals, listUsers } from "@/lib/usage/summary";

export const metadata: Metadata = {
  title: "Backoffice",
  robots: { index: false },
};

import { formatUsd } from "@/lib/billing/plans";

const STATUS_LABELS: Record<string, string> = {
  trialing: "En prueba",
  active: "Activa",
  past_due: "Pago pendiente",
  canceled: "Cancelada",
  unpaid: "Impagada",
  paused: "Pausada",
  incomplete: "Incompleta",
  incomplete_expired: "Caducada",
};

export default async function AdminPage() {
  const user = await getSession();
  if (!user) redirect("/login?next=/admin");
  // Not an admin: behave as if the route did not exist.
  if (!isAdmin(user.email)) notFound();

  const [totals, rows] = await Promise.all([getAdminTotals(), listUsers()]);

  const stats = [
    { label: "Usuarios", value: totals.users.toLocaleString("es-ES") },
    { label: "De pago activos", value: totals.pro.toLocaleString("es-ES") },
    { label: "En prueba", value: totals.trialing.toLocaleString("es-ES") },
    { label: "MRR", value: formatUsd(totals.mrr) },
    { label: "Coste IA (mes)", value: formatUsd(totals.aiCostMonth) },
  ];

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Backoffice</h1>
        <Link href="/app" className="text-sm underline">
          Volver a la app
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map(({ label, value }) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm font-normal">
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {value}
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="mt-12 text-lg font-semibold">
        Usuarios ({rows.length.toLocaleString("es-ES")})
      </h2>
      <div className="mt-4 overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-3 py-2 font-medium">Email</th>
              <th className="px-3 py-2 font-medium">Plan</th>
              <th className="px-3 py-2 font-medium">Estado</th>
              <th className="px-3 py-2 font-medium">Renueva</th>
              <th className="px-3 py-2 text-right font-medium">Palabras/mes</th>
              <th className="px-3 py-2 text-right font-medium">Coste IA</th>
              <th className="px-3 py-2 font-medium">Alta</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="px-3 py-2">{row.email}</td>
                <td className="px-3 py-2">
                  <Badge
                    variant={row.plan === "free" ? "secondary" : "default"}
                  >
                    {row.plan === "unlimited"
                      ? "Ilimitado"
                      : row.plan === "pro"
                        ? "Pro"
                        : "Gratis"}
                  </Badge>
                  {row.interval && (
                    <span className="text-muted-foreground ml-2">
                      {row.interval === "year" ? "anual" : "mensual"}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {row.status ? (STATUS_LABELS[row.status] ?? row.status) : "—"}
                  {row.cancelAtPeriodEnd && (
                    <span className="text-destructive ml-1">(cancela)</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {row.currentPeriodEnd
                    ? row.currentPeriodEnd.toLocaleDateString("es-ES")
                    : "—"}
                </td>
                <td className="px-3 py-2 text-right">
                  {row.wordsMonth.toLocaleString("es-ES")}
                </td>
                <td className="px-3 py-2 text-right">
                  {formatUsd(row.costCentsMonth / 100)}
                </td>
                <td className="px-3 py-2">
                  {row.createdAt.toLocaleDateString("es-ES")}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="text-muted-foreground px-3 py-6 text-center"
                >
                  Todavía no hay usuarios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-muted-foreground mt-4 text-xs">
        El coste de IA es el acumulado del mes en curso. Las suscripciones se
        gestionan en Stripe; aquí solo se consultan.
      </p>
    </main>
  );
}
