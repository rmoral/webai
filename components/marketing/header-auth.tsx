"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import type { User } from "@supabase/supabase-js";

import { LanguageSwitcher } from "@/components/navigation/language-switcher";
import { Button } from "@/components/ui/button";
import { TOOLS } from "@/lib/ai/tools";
import { createClient } from "@/lib/auth/client";
import { Link, usePathname } from "@/lib/i18n/navigation";

// The marketing pages are statically prerendered for SEO, so the layout that
// wraps them cannot read the session on the server. Without this the header
// told every signed-in visitor to sign up — on the pricing page, of all
// places. Resolving it in the browser keeps the pages static.
//
// Below 640 the bar is logo · one button · ☰ (F1). Four controls did not
// fit in 390 and pushed the page sideways; the language, signing in and
// pricing are things a visitor looks for, not things the bar has to show.
export function HeaderAuth() {
  const t = useTranslations("nav");
  const tools = useTranslations("tools");
  const here = usePathname();
  // undefined = not resolved yet. Rendering the signed-out buttons during
  // that moment would flash the wrong state at the people most likely to pay.
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [open, setOpen] = useState(false);

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

  // A link in the menu that stays on the same page still has to close it.
  useEffect(() => setOpen(false), [here]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const row =
    "flex h-12 items-center px-4 text-base font-medium hover:bg-accent";

  return (
    <>
      <LanguageSwitcher className="hidden sm:flex" />
      {user === undefined ? (
        // Holds the row's height so the header does not jump once it
        // resolves.
        <span className="h-8" aria-hidden />
      ) : user ? (
        <Button
          size="sm"
          asChild
          className="max-sm:h-9 max-sm:px-3.5 max-sm:font-semibold"
        >
          <Link href="/app">{t("account")}</Link>
        </Button>
      ) : (
        <>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="hidden sm:inline-flex"
          >
            <Link href="/login">{t("login")}</Link>
          </Button>
          <Button size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/signup">{t("signup")}</Link>
          </Button>
          <Button
            size="sm"
            asChild
            className="h-9 px-3.5 font-semibold sm:hidden"
          >
            <Link href={{ pathname: "/signup", query: { next: here } }}>
              {t("signupShort")}
            </Link>
          </Button>
        </>
      )}

      <button
        type="button"
        aria-label={t("menu")}
        aria-expanded={open}
        aria-controls="marketing-menu"
        onClick={() => setOpen(!open)}
        className="-mr-1 flex size-10 items-center justify-center rounded-md sm:hidden"
      >
        {open ? (
          <X className="size-[18px]" aria-hidden />
        ) : (
          <Menu className="size-[18px]" aria-hidden />
        )}
      </button>

      {open && (
        // Below the bar, not over it: the header keeps its button and the
        // ☰ that closes this. Sized rather than pinned to the bottom,
        // because the header's backdrop blur makes it the containing block
        // of anything fixed inside it.
        <div className="fixed inset-x-0 top-14 z-30 h-[calc(100dvh-3.5rem)] sm:hidden">
          <button
            type="button"
            aria-label={t("closeMenu")}
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-[#0a0a0a]/28"
          />
          <nav
            id="marketing-menu"
            className="bg-background relative border-b py-2"
          >
            {user === null && (
              <Link href="/login" className={row}>
                {t("login")}
              </Link>
            )}
            <Link href="/pricing" className={row}>
              {t("pricing")}
            </Link>
            <Link href={TOOLS.detect.path} className={row}>
              {tools("detect.name")}
            </Link>
            <LanguageSwitcher chips className="px-4 py-2" />
          </nav>
        </div>
      )}
    </>
  );
}
