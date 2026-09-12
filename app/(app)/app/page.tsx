import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/server";
import { getPlan } from "@/lib/billing/entitlements";
import { TOOLS } from "@/lib/ai/tools";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  const plan = await getPlan(user.id).catch(() => null);

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Hola, {user.email}</h1>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant={plan?.id === "pro" ? "default" : "secondary"}>
              Plan {plan?.name ?? "Gratis"}
            </Badge>
            {plan?.id !== "pro" && (
              <Link href="/precios" className="text-sm underline">
                Pásate a Pro
              </Link>
            )}
            {plan?.id === "pro" && (
              <form action="/api/stripe/portal" method="POST">
                <Button variant="link" size="sm" type="submit">
                  Gestionar suscripción
                </Button>
              </form>
            )}
          </div>
        </div>
        <form action="/auth/signout" method="POST">
          <Button variant="outline" size="sm" type="submit">
            Cerrar sesión
          </Button>
        </form>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {Object.values(TOOLS).map((tool) => {
          const available = tool.id === "humanize";
          const card = (
            <Card
              key={tool.id}
              className={
                available ? "hover:bg-accent/40 transition-colors" : ""
              }
            >
              <CardHeader>
                <CardTitle>{tool.name}</CardTitle>
                <CardDescription>
                  {available ? "Abrir →" : "Muy pronto"}
                </CardDescription>
              </CardHeader>
            </Card>
          );
          return available ? (
            <Link key={tool.id} href={tool.path}>
              {card}
            </Link>
          ) : (
            card
          );
        })}
      </div>
    </main>
  );
}
