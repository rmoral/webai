"use client";

import { Suspense, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

import { createClient } from "@/lib/auth/client";
import { Link } from "@/lib/i18n/navigation";

// Implicit-flow landing: the tokens arrive in the URL fragment, which the
// server never receives. The browser client picks them up and writes the
// session cookies; then we do a full navigation so the server sees them.
function Finish() {
  const t = useTranslations("login");
  const [failed, setFailed] = useState(false);
  const nextParam = useSearchParams().get("next");
  const next = nextParam?.startsWith("/") ? nextParam : "/app";

  useEffect(() => {
    const supabase = createClient();
    let attempts = 0;
    const timer = setInterval(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        clearInterval(timer);
        window.location.replace(next);
      } else if (++attempts > 10) {
        clearInterval(timer);
        setFailed(true);
      }
    }, 300);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      {failed ? (
        <p className="text-sm">
          {t("finishFailed")}{" "}
          <Link href="/login" className="underline">
            {t("finishRetry")}
          </Link>
          .
        </p>
      ) : (
        <p className="text-muted-foreground text-sm">{t("finishing")}</p>
      )}
    </main>
  );
}

export default function AuthFinishPage() {
  return (
    <Suspense>
      <Finish />
    </Suspense>
  );
}
