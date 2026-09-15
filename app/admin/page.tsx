import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isAdmin } from "@/lib/auth/admin";
import { getSession } from "@/lib/auth/server";
import { configHealth, databaseTarget } from "@/lib/config/health";
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

// Driver errors are not supposed to quote the connection string, but this
// text is rendered on a page, so do not depend on that.
function redactCredentials(message: string): string {
  return message.replace(/\/\/[^\/@\s]*@/g, "//…@");
}

export default async function AdminPage() {
  const user = await getSession();
  if (!user) redirect("/login?next=/admin");
  // Not an admin: behave as if the route did not exist.
  if (!isAdmin(user.email)) notFound();

  // The configuration panel below exists to diagnose a broken deployment,
  // and a missing DATABASE_URL is one of the things it has to report. If
  // these queries could take the page down, the diagnosis would be
  // unreachable exactly when it is needed.
  const [metrics, rows] = await Promise.all([
    // The driver message is the only account of why the connection failed,
    // and there is no terminal here to read it in. Keep it.
    getAdminTotals().then(
      (value) => ({ value, error: null as string | null }),
      (e: unknown) => ({
        value: null,
        error: redactCredentials(e instanceof Error ? e.message : String(e)),
      }),
    ),
    listUsers().catch(() => []),
  ]);
  const totals = metrics.value;
  const db = databaseTarget();
  const config = configHealth();
  const missing = config.filter((c) => !c.present);

  const stats = totals
    ? [
        { label: "Usuarios", value: totals.users.toLocaleString("es-ES") },
        { label: "De pago activos", value: totals.pro.toLocaleString("es-ES") },
        { label: "En prueba", value: totals.trialing.toLocaleString("es-ES") },
        { label: "MRR", value: formatUsd(totals.mrr) },
        { label: "Coste IA (mes)", value: formatUsd(totals.aiCostMonth) },
      ]
    : [];

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Backoffice</h1>
        <Link href="/app" className="text-sm underline">
          Volver a la app
        </Link>
      </div>

      <Card className={missing.length ? "border-danger mt-8" : "mt-8"}>
        <CardHeader className="pb-2">
          <CardTitle className="flex flex-wrap items-center gap-2 text-base">
            Configuración del servidor
            {missing.length === 0 ? (
              <Badge variant="success">Todo configurado</Badge>
            ) : (
              <Badge
                variant={missing.some((c) => c.critical) ? "danger" : "warning"}
              >
                {missing.length} sin configurar
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <p className="text-muted-foreground">
            Solo se comprueba si cada variable está definida; su valor nunca se
            lee ni se muestra. Una variable que falta rompe una ruta concreta y
            deja el resto del sitio con buen aspecto, así que la suele encontrar
            un usuario antes que nosotros.
          </p>
          {missing.length > 0 && (
            <ul className="mt-4 space-y-2">
              {missing.map((check) => (
                <li key={check.name} className="flex flex-col">
                  <span className="flex items-center gap-2 font-mono text-xs">
                    {check.name}
                    {check.critical && <Badge variant="danger">Crítica</Badge>}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {check.breaks}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <details className="mt-4">
            <summary className="text-muted-foreground cursor-pointer text-xs">
              Ver las {config.length} variables
            </summary>
            <ul className="mt-2 space-y-1">
              {config.map((check) => (
                <li key={check.name} className="flex items-center gap-2">
                  <span
                    className={
                      check.present
                        ? "bg-success size-1.5 shrink-0 rounded-full"
                        : "bg-danger size-1.5 shrink-0 rounded-full"
                    }
                  />
                  <span className="font-mono text-xs">{check.name}</span>
                </li>
              ))}
            </ul>
          </details>
        </CardContent>
      </Card>

      {!totals && (
        <div className="border-danger-line bg-danger-soft text-danger-ink mt-8 rounded-xl border px-6 py-4 text-sm">
          <p>
            <b className="font-semibold">No se puede leer la base de datos.</b>{" "}
            Las métricas y el listado de usuarios no se muestran.
          </p>
          {db.endpoint && (
            <p className="mt-2">
              <code className="font-mono">DATABASE_URL</code> apunta a{" "}
              <code className="font-mono break-all">{db.endpoint}</code>.
            </p>
          )}
          {db.problem && <p className="mt-2">{db.problem}</p>}
          {metrics.error && (
            <p className="mt-2 font-mono text-xs break-all">{metrics.error}</p>
          )}
        </div>
      )}

      {totals && db.problem && (
        <p className="border-warning-line bg-warning-soft text-warning-ink mt-8 rounded-xl border px-6 py-4 text-sm">
          <b className="font-semibold">Revisa DATABASE_URL.</b> Apunta a{" "}
          <code className="font-mono break-all">{db.endpoint}</code>.{" "}
          {db.problem}
        </p>
      )}

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
