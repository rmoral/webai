import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { isAdmin } from "@/lib/auth/admin";
import { ensureUserRecord } from "@/lib/auth/ensure-user";
import { getSession } from "@/lib/auth/server";

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

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <nav className="mx-auto flex max-w-4xl flex-wrap items-center gap-x-4 gap-y-2 px-6 py-3 text-sm">
          <Link href="/app" className="font-semibold">
            Verbalyx
          </Link>
          <Link href="/app" className="hover:underline">
            Herramientas
          </Link>
          <Link href="/app/cuenta" className="hover:underline">
            Mi cuenta
          </Link>
          {isAdmin(user.email) && (
            <Link href="/admin" className="hover:underline">
              Admin
            </Link>
          )}
          <form action="/auth/signout" method="POST" className="ml-auto">
            <Button variant="outline" size="sm" type="submit">
              Salir
            </Button>
          </form>
        </nav>
      </header>
      {children}
    </div>
  );
}
