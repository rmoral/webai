import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isAdmin } from "@/lib/auth/admin";
import { getSession } from "@/lib/auth/server";
import {
  configHealth,
  databaseTarget,
  describeDatabaseFailure,
  stripeMode,
} from "@/lib/config/health";
import { auditStripe, type StripeAudit } from "@/lib/billing/stripe";
import { getAdminTotals, listCampaigns, listUsers } from "@/lib/usage/summary";

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

  // The configuration panel below exists to diagnose a broken deployment,
  // and a missing DATABASE_URL is one of the things it has to report. If
  // these queries could take the page down, the diagnosis would be
  // unreachable exactly when it is needed.
  const [metrics, rows, campaigns] = await Promise.all([
    // The driver's complaint is the only account of why the read failed,
    // and there is no terminal here to read it in. Keep it, unwrapped.
    getAdminTotals().then(
      (value) => ({ value, failure: null }),
      (e: unknown) => ({ value: null, failure: describeDatabaseFailure(e) }),
    ),
    listUsers().catch(() => []),
    listCampaigns().catch(() => []),
  ]);
  const totals = metrics.value;
  const db = databaseTarget();
  const config = configHealth();
  const missing = config.filter((c) => !c.present);
  const stripe = stripeMode();
  // Read-only, and it must never take the panel down: the panel exists to
  // diagnose a broken deployment, and Stripe being unreachable is one of
  // the things it has to be able to report.
  const account: StripeAudit | null = await auditStripe().catch(() => null);

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

      {/* Which Stripe account this deployment is really talking to. With
          test keys in production everything looks like it works and no
          money moves, and the only signs are inside Stripe's own iframe. */}
      {stripe.problem && (
        <div className="border-danger-line bg-danger-soft text-danger-ink mt-8 rounded-xl border px-6 py-4 text-sm">
          <p>
            <b className="font-semibold">Revisa las claves de Stripe.</b> Clave
            secreta en modo <code className="font-mono">{stripe.secret}</code>,
            publicable en modo{" "}
            <code className="font-mono">{stripe.publishable}</code>
            {stripe.production ? ", en producción" : ", fuera de producción"}.
          </p>
          <p className="mt-2">{stripe.problem}</p>
        </div>
      )}

      {/* What the account can actually do, as opposed to which variables
          are set. Going live is four changes and three of them are silent:
          prices and the tax origin are per mode, and the webhook is per
          endpoint. */}
      {account?.problem && (
        <div className="border-danger-line bg-danger-soft text-danger-ink mt-8 rounded-xl border px-6 py-4 text-sm">
          <p>
            <b className="font-semibold">
              La cuenta de Stripe no puede cobrar.
            </b>
          </p>
          <p className="mt-2">{account.problem}</p>
        </div>
      )}

      {account && (
        <details className="mt-4">
          <summary className="text-muted-foreground cursor-pointer text-xs">
            Ver la cuenta de Stripe:{" "}
            {account.prices.filter((p) => p.found).length}/
            {account.prices.length} precios · {account.webhooks.length} webhooks
          </summary>
          <ul className="mt-2 space-y-1">
            {account.prices.map((price) => (
              <li key={price.lookupKey} className="flex items-center gap-2">
                <span
                  className={
                    price.found
                      ? "bg-success size-1.5 shrink-0 rounded-full"
                      : "bg-danger size-1.5 shrink-0 rounded-full"
                  }
                />
                <span className="font-mono text-xs">{price.lookupKey}</span>
                {price.found && (
                  <span className="text-muted-foreground text-xs">
                    {price.live ? "live" : "test"}
                  </span>
                )}
              </li>
            ))}
            {account.tax && (
              <li className="flex items-center gap-2">
                <span
                  className={
                    account.tax.active
                      ? "bg-success size-1.5 shrink-0 rounded-full"
                      : "bg-danger size-1.5 shrink-0 rounded-full"
                  }
                />
                <span className="font-mono text-xs">stripe tax</span>
                <span className="text-muted-foreground text-xs">
                  {account.tax.active ? "activo" : "inactivo"}
                  {account.tax.headOffice ? "" : " · sin dirección de origen"}
                </span>
              </li>
            )}
            {account.webhooks.map((hook) => (
              <li key={hook.url} className="flex items-center gap-2">
                <span
                  className={
                    hook.enabled && hook.covers
                      ? "bg-success size-1.5 shrink-0 rounded-full"
                      : "bg-warning-fill size-1.5 shrink-0 rounded-full"
                  }
                />
                <span className="font-mono text-xs break-all">{hook.url}</span>
                <span className="text-muted-foreground text-xs">
                  {hook.live ? "live" : "test"}
                  {hook.enabled ? "" : " · desactivado"}
                  {hook.covers ? "" : " · le faltan eventos"}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}

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
          {metrics.failure?.hint && (
            <p className="mt-2">{metrics.failure.hint}</p>
          )}
          {metrics.failure && (
            <p className="mt-2 font-mono text-xs break-all">
              {metrics.failure.detail}
            </p>
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

      {/* Where the paying customers came from.
          Read from our own `events` rows, so it counts the sales Stripe
          confirmed rather than the ones a browser stayed open to report --
          and it is the only place the campaign survives a three-day trial.
          Sin clic is not a gap in the code: it is the share of the spend
          Google is only allowed to model, because the customer refused
          advertising cookies. */}
      {campaigns.length > 0 && (
        <>
          <h2 className="mt-12 text-lg font-semibold">
            Campañas (últimos 30 días)
          </h2>
          <div className="mt-4 overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">Origen</th>
                  <th className="px-3 py-2 font-medium">Campaña</th>
                  <th className="px-3 py-2 text-right font-medium">Ventas</th>
                  <th className="px-3 py-2 text-right font-medium">Cobrado</th>
                  <th className="px-3 py-2 text-right font-medium">Con clic</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((row) => (
                  <tr
                    key={`${row.source ?? ""}/${row.campaign ?? ""}`}
                    className="border-t"
                  >
                    <td className="px-3 py-2">
                      {row.source ?? (
                        <span className="text-muted-foreground">
                          Directo u orgánico
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">{row.campaign ?? "—"}</td>
                    <td className="px-3 py-2 text-right">
                      {row.purchases.toLocaleString("es-ES")}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatUsd(row.revenue)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {row.withClickId.toLocaleString("es-ES")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

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
