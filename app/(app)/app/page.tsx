import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/server";

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Hola, {user.email}</h1>
      <p className="text-muted-foreground mt-2">
        Las herramientas llegarán en el Sprint 1.
      </p>
    </main>
  );
}
