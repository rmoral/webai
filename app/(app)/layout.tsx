import Link from "next/link";
import { redirect } from "next/navigation";

import { QuotaBar } from "@/components/billing/quota-bar";
import { ToolTabs } from "@/components/navigation/tool-tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { isAdmin } from "@/lib/auth/admin";
import { ensureUserRecord } from "@/lib/auth/ensure-user";
import { getSession } from "@/lib/auth/server";
import { getSubscriber } from "@/lib/billing/entitlements";
import { peekWords } from "@/lib/usage/quotas";

// Shell for the signed-in area: every page under it has a guaranteed session.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user) redirect("/login");

  // Keeps the mirror row in sync for users who signed in before it existed.
  await ensureUserRecord(user.id, user.email);

  // The header must not be able to take the app down: a database blip
  // should cost the quota bar, not the page.
  const subscriber = await getSubscriber(user.id).catch(() => null);
  const { used, limit } = subscriber
    ? await peekWords(`user:${user.id}`, subscriber)
    : { used: 0, limit: null };
  const metered = subscriber?.plan.limits.wordsPerDay !== null;

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto max-w-[65rem] px-6">
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 text-sm">
            <Link href="/app" className="font-semibold tracking-tight">
              Verbalyx
            </Link>
            {subscriber && (
              <>
                <Badge variant="brand">{subscriber.plan.name}</Badge>
                <QuotaBar
                  used={used}
                  limit={limit}
                  unit={metered ? "palabras hoy" : "palabras este mes"}
                  showPlan={false}
                  className="w-40"
                />
              </>
            )}
            <Link href="/app/historial" className="ml-auto hover:underline">
              Historial
            </Link>
            <Link href="/app/cuenta" className="hover:underline">
              Mi cuenta
            </Link>
            {isAdmin(user.email) && (
              <Link href="/admin" className="hover:underline">
                Admin
              </Link>
            )}
            <form action="/auth/signout" method="POST">
              <Button variant="outline" size="sm" type="submit">
                Salir
              </Button>
            </form>
          </nav>
          <ToolTabs />
        </div>
      </header>
      {children}
    </div>
  );
}
