import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { DeleteAccountButton } from "@/components/app/delete-account-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSession } from "@/lib/auth/server";
import { getPlan } from "@/lib/billing/entitlements";
import { getUserUsage } from "@/lib/usage/summary";

export const metadata: Metadata = { title: "Mi cuenta" };

export default async function AccountPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const [plan, usage] = await Promise.all([
    getPlan(user.id).catch(() => null),
    getUserUsage(user.id).catch(() => null),
  ]);
  const isPro = plan?.id === "pro";

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Mi cuenta</h1>

      <div className="mt-8 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Datos</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Cuenta creada el{" "}
            {new Date(user.created_at).toLocaleDateString("es-ES")}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Suscripción</CardTitle>
            <CardDescription>Plan {plan?.name ?? "Gratis"}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <p className="text-muted-foreground">
              {isPro
                ? `${plan!.limits.wordsPerRequest.toLocaleString("es-ES")} palabras por petición, sin límite diario.`
                : `${plan?.limits.wordsPerDay ?? 0} palabras al día.`}
            </p>
            {isPro ? (
              <form action="/api/stripe/portal" method="POST">
                <Button type="submit" variant="outline">
                  Gestionar suscripción y facturas
                </Button>
              </form>
            ) : (
              <Button asChild>
                <Link href="/precios">Probar Pro 3 días</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Uso este mes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <dl className="grid grid-cols-3 gap-4">
              <div>
                <dt className="text-muted-foreground">Hoy</dt>
                <dd className="text-lg font-medium">
                  {(usage?.wordsToday ?? 0).toLocaleString("es-ES")}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Este mes</dt>
                <dd className="text-lg font-medium">
                  {(usage?.wordsMonth ?? 0).toLocaleString("es-ES")}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Peticiones</dt>
                <dd className="text-lg font-medium">
                  {(usage?.requestsMonth ?? 0).toLocaleString("es-ES")}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle>Eliminar mi cuenta y datos</CardTitle>
            <CardDescription>
              Borra tu cuenta, tu suscripción y todos tus datos de forma
              permanente. No se puede deshacer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DeleteAccountButton />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
