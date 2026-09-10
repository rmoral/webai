import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TOOLS } from "@/lib/ai/tools";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-10 px-6 py-16">
      <div className="flex flex-col items-center gap-4 text-center">
        <Badge variant="secondary">En construcción</Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Escribe mejor con IA, en español
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Humaniza, detecta, parafrasea y corrige tus textos. Hecho para el
          español de España y LATAM.
        </p>
        <Button size="lg" asChild>
          <Link href="/app">Probar gratis</Link>
        </Button>
      </div>

      <div className="grid w-full gap-4 sm:grid-cols-2">
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
                  {available ? "Pruébalo gratis →" : "Disponible muy pronto"}
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
