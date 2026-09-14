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
import { getPlan } from "@/lib/billing/entitlements";
import { getUserUsage } from "@/lib/usage/summary";

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const [plan, usage] = await Promise.all([
    getPlan(user.id).catch(() => null),
    getUserUsage(user.id).catch(() => null),
  ]);
  const dailyLimit = plan?.limits.wordsPerDay ?? null;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Hola, {user.email}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Badge variant={plan?.id === "pro" ? "default" : "secondary"}>
          Plan {plan?.name ?? "Gratis"}
        </Badge>
        {usage && (
          <span className="text-muted-foreground text-sm">
            {dailyLimit === null
              ? `${usage.wordsToday.toLocaleString("es-ES")} palabras hoy`
              : `Te quedan ${Math.max(0, dailyLimit - usage.wordsToday).toLocaleString("es-ES")} palabras hoy`}
          </span>
        )}
        {plan?.id !== "pro" && (
          <Link href="/precios" className="text-sm underline">
            Pásate a Pro
          </Link>
        )}
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
