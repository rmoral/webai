"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/auth/client";

// The marketing pages are statically prerendered for SEO, so the layout that
// wraps them cannot read the session on the server. Without this the header
// told every signed-in visitor to "Crear cuenta gratis" — on /precios, of all
// places. Resolving it in the browser keeps the pages static.
export function HeaderAuth() {
  // undefined = not resolved yet. Rendering the signed-out buttons during
  // that moment would flash the wrong state at the people most likely to pay.
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    supabase.auth
      .getUser()
      .then(({ data }) => active && setUser(data.user ?? null))
      .catch(() => active && setUser(null));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) =>
      setUser(session?.user ?? null),
    );

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (user === undefined) {
    // Holds the row's height so the header does not jump once it resolves.
    return <span className="h-8" aria-hidden />;
  }

  if (user) {
    return (
      <Button size="sm" asChild>
        <Link href="/app">Mi cuenta</Link>
      </Button>
    );
  }

  return (
    <>
      <Button variant="ghost" size="sm" asChild>
        <Link href="/login">Entrar</Link>
      </Button>
      <Button size="sm" asChild>
        <Link href="/login">Crear cuenta gratis</Link>
      </Button>
    </>
  );
}
