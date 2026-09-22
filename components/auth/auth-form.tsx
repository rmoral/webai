"use client";

import { Suspense, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";

import { Button } from "@/components/ui/button";
import { PLANS } from "@/lib/billing/plans";
import { createClient } from "@/lib/auth/client";
import { Link } from "@/lib/i18n/navigation";

// Sign up and sign in: two routes, one form.
//
// No passwords and no name field. Every field here costs conversion and
// none of them does any work: the account is an email address and a plan.
//
// The title carries the benefit rather than the action. "Sign in" tells
// somebody who just pressed "create a free account" nothing about whether
// they are in the right place.

export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  return (
    <Suspense>
      <Form mode={mode} />
    </Suspense>
  );
}

function Form({ mode }: { mode: "signin" | "signup" }) {
  const t = useTranslations("auth");
  const format = useFormatter();
  const posthog = usePostHog();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  // Where they came from, so they land back on their own text rather than
  // on a dashboard. The callback only honours a path, never a URL.
  const next = useSearchParams().get("next") ?? "/app";
  const signup = mode === "signup";

  const redirectTo = () =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  async function withGoogle() {
    posthog?.capture(signup ? "signup_started" : "signin_started", {
      method: "google",
    });
    await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo() },
    });
  }

  async function withEmail(event: React.FormEvent) {
    event.preventDefault();
    setStatus("sending");
    posthog?.capture(signup ? "signup_started" : "signin_started", {
      method: "email",
    });
    const { error } = await createClient().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo() },
    });
    setStatus(error ? "error" : "sent");
  }

  return (
    <div className="w-full max-w-md">
      <Link href="/" className="text-base font-bold tracking-tight">
        Verbaly<span className="text-brand">x</span>
      </Link>

      <h1 className="mt-8 text-2xl font-semibold tracking-tight">
        {signup
          ? t("signupTitle", {
              words: format.number(PLANS.free.limits.wordsPerDay ?? 0),
            })
          : t("signinTitle")}
      </h1>
      <p className="text-muted-foreground mt-2 text-sm leading-normal">
        {signup ? t("signupLede") : t("signinLede")}
      </p>

      {signup && (
        <ul className="border-brand-line bg-brand-soft text-brand-ink mt-5 space-y-1.5 rounded-xl border p-4 text-sm leading-normal">
          <li>
            {t("benefitWords", {
              from: format.number(PLANS.anonymous.limits.wordsPerDay ?? 0),
              to: format.number(PLANS.free.limits.wordsPerDay ?? 0),
            })}
          </li>
          <li>{t("benefitTools")}</li>
        </ul>
      )}

      <div className="mt-5 flex flex-col gap-4">
        <Button variant="outline" onClick={withGoogle} className="w-full">
          {t("google")}
        </Button>

        <div className="text-muted-foreground text-center text-xs">
          {t("or")}
        </div>

        {status === "sent" ? (
          <p className="text-sm leading-normal">{t("sent", { email })}</p>
        ) : (
          <form onSubmit={withEmail} className="flex flex-col gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t("emailPlaceholder")}
              aria-label={t("emailPlaceholder")}
              className="border-input focus-visible:ring-brand/30 focus-visible:border-brand h-11 rounded-md border bg-transparent px-3 text-base outline-none focus-visible:ring-[3px] md:text-sm"
            />
            <Button type="submit" disabled={status === "sending" || !email}>
              {status === "sending" ? t("sending") : t("send")}
            </Button>
            {status === "error" && (
              <p className="text-danger-ink text-sm" role="alert">
                {t("error")}
              </p>
            )}
          </form>
        )}
      </div>

      {/* Functional, not reassurance: the editor keeps what was typed, so
          this sentence is true without anybody having to recover anything. */}
      <p className="text-muted-foreground mt-5 text-sm leading-normal">
        {t("textKept")}
      </p>
      <p className="text-muted-foreground mt-3 text-xs leading-normal">
        {t("privacy")}
      </p>

      <p className="mt-6 text-sm">
        <Link
          href={signup ? "/login" : "/signup"}
          className="text-brand underline"
        >
          {signup ? t("crossToSignin") : t("crossToSignup")}
        </Link>
      </p>

      {signup && (
        <p className="text-muted-foreground mt-4 text-xs leading-normal">
          {t("legal")}
        </p>
      )}
    </div>
  );
}
