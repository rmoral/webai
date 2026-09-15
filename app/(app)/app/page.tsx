import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TOOLS } from "@/lib/ai/tools";
import { getSession } from "@/lib/auth/server";
import { getSubscriber } from "@/lib/billing/entitlements";
import { getUserUsage } from "@/lib/usage/summary";

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const [subscriber, usage] = await Promise.all([
    getSubscriber(user.id).catch(() => null),
    getUserUsage(user.id).catch(() => null),
  ]);
  const plan = subscriber?.plan ?? null;
  const dailyLimit = plan?.limits.wordsPerDay ?? null;
  const monthlyLimit = plan?.limits.wordsPerMonth ?? null;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Hola, {user.email}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Badge variant={plan?.id === "pro" ? "default" : "secondary"}>
          Plan {plan?.name ?? "Gratis"}
        </Badge>
        {usage && (
          <span className="text-muted-foreground text-sm">
            {dailyLimit !== null
              ? `Te quedan ${Math.max(0, dailyLimit - usage.wordsToday).toLocaleString("es-ES")} palabras hoy`
              : monthlyLimit !== null
                ? `Te quedan ${Math.max(0, monthlyLimit - usage.wordsMonth).toLocaleString("es-ES")} palabras este mes`
                : `${usage.wordsMonth.toLocaleString("es-ES")} palabras este mes`}
          </span>
        )}
        {subscriber && subscriber.topupWords > 0 && (
          <span className="text-muted-foreground text-sm">
            + {subscriber.topupWords.toLocaleString("es-ES")} de recarga
          </span>
        )}
        {plan?.id === "free" && (
          <Link href="/precios" className="text-sm underline">
            Ver planes
          </Link>
        )}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {Object.values(TOOLS).map((tool) => {
          const available =
            tool.id === "humanize" &&
            (plan?.limits.tools.includes(tool.id) ?? true);
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
