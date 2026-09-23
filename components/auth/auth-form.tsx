"use client";

import { Suspense, useState } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";

import { track } from "@/lib/analytics/events";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PLANS,
  PRICES,
  formatUsd,
  trialDaysFor,
  type BillingInterval,
  type PaidTier,
} from "@/lib/billing/plans";
import { createClient } from "@/lib/auth/client";
import { Link } from "@/lib/i18n/navigation";
import { LEGAL_SLUGS } from "@/lib/i18n/legal";
import type { Locale } from "@/lib/i18n/routing";
import { safeNext } from "@/lib/security/validation";

// Sign up and sign in: two routes, one form.
//
// No passwords and no name field. Every field here costs conversion and
// none of them does any work: the account is an email address and a plan.
//
// The title carries the benefit rather than the action. "Sign in" tells
// somebody who just pressed "create a free account" nothing about whether
// they are in the right place.

/**
 * The plan they were buying, read back out of `next`.
 *
 * Somebody who pressed "try it free" and landed on a sign-up form has no
 * way to tell whether the thing they chose survived the trip -- and until
 * C2 it did not. Showing it here is what makes the answer visible rather
 * than a promise the next page has to keep.
 */
function chosenPlan(
  next: string,
): { tier: PaidTier; interval: BillingInterval } | null {
  const query = next.slice(next.indexOf("?") + 1);
  if (!next.includes("?")) return null;
  const params = new URLSearchParams(query);
  const plan = params.get("plan");
  const cycle = params.get("cycle");
  if (plan !== "pro" && plan !== "unlimited") return null;
  return {
    tier: plan,
    interval: cycle === "yearly" ? "yearly" : "monthly",
  };
}

/** Google's mark. A provider button without it reads as a second option. */
function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className="size-5">
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  );
}

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

  // Where they came from, so they land back on their own text -- or on the
  // plan they had already chosen -- rather than on a dashboard. Validated
  // here as well as in the callback: this one goes into an href.
  const requested = useSearchParams().get("next");
  const next = safeNext(requested);
  const locale = useLocale() as Locale;
  const signup = mode === "signup";
  // Only on the way in: somebody signing in is going back to something,
  // not buying it.
  const plan = signup ? chosenPlan(next) : null;
  // The crossing link keeps the intention. Without it, somebody who came
  // here to buy and realised they already have an account arrives at the
  // other form with the plan dropped -- which is the whole leak, moved one
  // screen along.
  const crossQuery = requested ? { next } : undefined;

  const redirectTo = () =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  async function withGoogle() {
    track(posthog, signup ? "signup_start" : "signin_start", {
      method: "google",
      next,
    });
    await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo() },
    });
  }

  async function withEmail(event: React.FormEvent) {
    event.preventDefault();
    setStatus("sending");
    track(posthog, signup ? "signup_start" : "signin_start", {
      method: "magic_link",
      next,
    });
    const { error } = await createClient().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo() },
    });
    setStatus(error ? "error" : "sent");
  }

  return (
    <div
      className={
        plan
          ? "grid w-full max-w-3xl gap-10 md:grid-cols-[minmax(0,1fr)_18rem]"
          : "w-full max-w-md"
      }
    >
      <div>
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
          {/* The mark and the weight of a first option. Styled as the
            secondary choice and unbranded, it read as the fallback -- and
            it is the fastest way in that exists. */}
          <Button onClick={withGoogle} className="w-full">
            <GoogleMark />
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
            href={{
              pathname: signup ? "/login" : "/signup",
              query: crossQuery,
            }}
            className="text-brand underline"
          >
            {signup ? t("crossToSignin") : t("crossToSignup")}
          </Link>
        </p>

        {signup && (
          <p className="text-muted-foreground mt-4 text-xs leading-normal">
            {/* Named as documents and not linked to them, which is an
              acceptance of something the reader cannot read. */}
            {t.rich("legal", {
              terms: (chunks) => (
                <Link
                  href={{
                    pathname: "/legal/[slug]",
                    params: { slug: LEGAL_SLUGS[locale].terms },
                  }}
                  target="_blank"
                  className="underline"
                >
                  {chunks}
                </Link>
              ),
              privacy: (chunks) => (
                <Link
                  href={{
                    pathname: "/legal/[slug]",
                    params: { slug: LEGAL_SLUGS[locale].privacy },
                  }}
                  target="_blank"
                  className="underline"
                >
                  {chunks}
                </Link>
              ),
            })}
          </p>
        )}
      </div>

      {/* The plan stays in view for the whole of the sign-up, so nobody has
          to take on trust that what they pressed survived the trip. */}
      {plan && <ChosenPlan tier={plan.tier} interval={plan.interval} />}
    </div>
  );
}

function ChosenPlan({
  tier,
  interval,
}: {
  tier: PaidTier;
  interval: BillingInterval;
}) {
  const t = useTranslations("auth");
  const plans = useTranslations("plans");
  const locale = useLocale() as Locale;
  const amount = PRICES[tier][interval].amount;
  const trialDays = trialDaysFor(tier, interval);

  return (
    <aside className="h-fit rounded-xl border p-5">
      <p className="text-muted-foreground text-xs font-semibold tracking-[0.06em] uppercase">
        {t("planChosen")}
      </p>
      <p className="mt-2 flex items-center gap-2 font-semibold">
        {plans(tier)}
        {trialDays !== null && (
          <Badge variant="brand">
            {t("planTrialBadge", { days: trialDays })}
          </Badge>
        )}
      </p>
      <p className="text-muted-foreground mt-1 text-sm">
        {interval === "yearly"
          ? t("planBilledYearly", { amount: formatUsd(amount, locale) })
          : t("planBilledMonthly", { amount: formatUsd(amount, locale) })}
      </p>
      {trialDays !== null && (
        <p className="text-success-ink mt-2 text-sm leading-normal">
          {t("planTrialNote", { days: trialDays })}
        </p>
      )}
      {/* Changing your mind must not mean starting over. */}
      <Link
        href="/pricing"
        className="text-brand mt-4 inline-block text-sm underline"
      >
        {t("planChange")}
      </Link>
    </aside>
  );
}
