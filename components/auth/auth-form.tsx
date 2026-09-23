"use client";

import { Suspense, useState } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";

import { track } from "@/lib/analytics/events";
import { Button } from "@/components/ui/button";
import { planRows } from "@/lib/billing/disclosure";
import {
  PLANS,
  PRICES,
  formatUsd,
  type BillingInterval,
  type PaidTier,
} from "@/lib/billing/plans";
import { createClient } from "@/lib/auth/client";
import { Link, getPathname } from "@/lib/i18n/navigation";
import { LEGAL_SLUGS } from "@/lib/i18n/legal";
import type { Locale } from "@/lib/i18n/routing";
import { safeNext } from "@/lib/security/validation";
import { cn } from "@/lib/utils";

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

/**
 * The routes where there is text to come back to.
 *
 * "Your text is still in the editor" was printed on every sign-up,
 * including the ones reached from pricing with nothing typed anywhere --
 * a reassurance about something that had not happened, which is the kind
 * of sentence that teaches a reader to stop believing the others.
 */
const EDITOR_ROUTES = [
  "/",
  "/humanize",
  "/detect",
  "/paraphrase",
  "/correct",
] as const;

function keepsText(next: string, locale: Locale): boolean {
  const [path, query] = next.split("?");
  // /app is the fallback destination, so on its own it means nothing was
  // being written. With a tool in the query it is the editor.
  if (path === "/app") return new URLSearchParams(query ?? "").has("tool");
  return EDITOR_ROUTES.some((href) => getPathname({ href, locale }) === path);
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
    <div className={plan ? "w-full max-w-3xl" : "w-full max-w-md"}>
      <div className="flex items-center justify-between gap-4">
        <Link href="/" className="text-base font-bold tracking-tight">
          Verbaly<span className="text-brand">x</span>
        </Link>

        {/* Two steps, and this is the first. Somebody who came to buy and
            met a form asking for an email needs to know the card comes
            after it, not instead of it. */}
        {plan && (
          <ol
            aria-label={t("steps")}
            className="text-muted-foreground flex items-center gap-2 text-sm"
          >
            <li className="text-foreground flex items-center gap-1.5 font-medium">
              <b className="bg-brand text-brand-foreground flex size-5 items-center justify-center rounded-full text-xs">
                1
              </b>
              {t("stepAccount")}
            </li>
            <li aria-hidden className="bg-border h-px w-6" />
            <li className="flex items-center gap-1.5">
              <b className="border-border flex size-5 items-center justify-center rounded-full border text-xs font-normal">
                2
              </b>
              {t("stepPay")}
            </li>
          </ol>
        )}
      </div>

      <div
        className={
          plan
            ? "mt-8 grid gap-8 min-[820px]:grid-cols-[minmax(0,1fr)_18rem]"
            : "mt-8"
        }
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {plan
              ? t("planTitle")
              : signup
                ? t("signupTitle", {
                    words: format.number(PLANS.free.limits.wordsPerDay ?? 0),
                  })
                : t("signinTitle")}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm leading-normal">
            {plan ? t("planLede") : signup ? t("signupLede") : t("signinLede")}
          </p>

          {/* What the free account is worth. Not shown beside a plan: the
              panel next to it is already the argument. */}
          {signup && !plan && (
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
            {/* First, and in Google's own colours rather than ours. Styled
              as the secondary choice it read as the fallback, and it is
              the fastest way in that exists. The hex values are Google's
              identity guidelines for the button, which is why they are
              written here instead of coming from the tokens. */}
            <button
              type="button"
              onClick={withGoogle}
              className="focus-visible:ring-brand/30 flex h-12 w-full items-center justify-center gap-3 rounded-md border border-[#747775] bg-white text-sm font-medium text-[#1f1f1f] transition-colors hover:bg-[#f7f8f8] focus-visible:ring-[3px] focus-visible:outline-none dark:border-[#8e918f] dark:bg-[#131314] dark:text-[#e3e3e3] dark:hover:bg-[#1e1f20]"
            >
              <GoogleMark />
              {t("google")}
            </button>

            <div className="text-muted-foreground flex items-center gap-3 text-xs">
              <span className="bg-border h-px flex-1" />
              {t("or")}
              <span className="bg-border h-px flex-1" />
            </div>

            {status === "sent" ? (
              <div className="flex flex-col gap-2 text-sm leading-normal">
                <p role="status">{t("sent", { email })}</p>
                {/* A link that never arrives is the end of the funnel, and
                  the reader has no way back to the form without it. */}
                <p className="text-muted-foreground">
                  {t.rich("notArrived", {
                    retry: (chunks) => (
                      <button
                        type="button"
                        onClick={() => setStatus("idle")}
                        className="text-brand cursor-pointer underline underline-offset-[3px]"
                      >
                        {chunks}
                      </button>
                    ),
                  })}
                </p>
              </div>
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
                {/* Outline: Google is the first option, and two filled
                  buttons would make neither of them it. */}
                <Button
                  type="submit"
                  variant="outline"
                  disabled={status === "sending" || !email}
                >
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

          {/* Functional, not reassurance: the editor keeps what was typed,
            so this sentence is true without anybody having to recover
            anything -- but only where there is something to come back to. */}
          {keepsText(next, locale) && !plan && (
            <p className="text-muted-foreground mt-5 text-sm leading-normal">
              {t("textKept")}
            </p>
          )}
          {signup && !plan && (
            <p className="text-muted-foreground mt-3 text-xs leading-normal">
              {t("privacy")}
            </p>
          )}

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

        {/* The plan stays in view for the whole of the sign-up, so nobody
            has to take on trust that what they pressed survived the trip.
            Beside the form where there is room; above it where there is
            not, because a summary under the fold is not a summary. */}
        {plan && (
          <ChosenPlan
            tier={plan.tier}
            interval={plan.interval}
            className="order-first min-[820px]:order-none"
          />
        )}
      </div>
    </div>
  );
}

function ChosenPlan({
  tier,
  interval,
  className,
}: {
  tier: PaidTier;
  interval: BillingInterval;
  className?: string;
}) {
  const t = useTranslations("auth");
  const plans = useTranslations("plans");
  const format = useFormatter();
  const locale = useLocale() as Locale;

  const money = (amount: number) => formatUsd(amount, locale);
  const day = (date: Date) =>
    format.dateTime(date, { day: "numeric", month: "long", year: "numeric" });

  // Computed once, from the catalogue: /checkout shows the same four facts
  // and they cannot be allowed to disagree about either the date or the
  // amount.
  const rows = planRows(tier, interval);
  // A first charge exists exactly when there is a trial, so the row is the
  // condition rather than a second reading of the same rule.
  const firstCharge = rows.find((row) => row.key === "firstCharge");

  const value = (row: (typeof rows)[number]) => {
    switch (row.key) {
      case "trial":
        return t("valueTrialDays", { days: row.days });
      case "today":
        return money(row.amount);
      case "firstCharge":
      case "renewal":
        return day(row.date);
      default:
        return t("valuePerMonth", { amount: money(row.perMonth) });
    }
  };

  const LABELS = {
    trial: "rowTrial",
    today: "rowToday",
    firstCharge: "rowFirstCharge",
    renewal: "rowRenewal",
    after: "rowAfter",
    equivalent: "rowEquivalent",
  } as const;

  return (
    <aside
      aria-label={t("yourChoice")}
      className={cn("h-fit rounded-xl border p-5", className)}
    >
      <p className="text-muted-foreground text-xs font-semibold tracking-[0.06em] uppercase">
        {t("yourChoice")}
      </p>
      <p className="mt-2 font-semibold">
        {t("planCycle", {
          plan: plans(tier),
          cycle: t(interval === "yearly" ? "cycleYearly" : "cycleMonthly"),
        })}
      </p>

      <dl className="mt-4 flex flex-col gap-2 text-sm">
        {rows.map((row) => (
          <div
            key={row.key}
            className={cn(
              "flex items-baseline justify-between gap-4",
              // What is taken today is the figure the decision turns on.
              row.key === "today" && "text-foreground font-semibold",
            )}
          >
            <dt className="text-muted-foreground font-normal">
              {t(LABELS[row.key])}
            </dt>
            <dd data-testid={`plan-row-${row.key}`}>{value(row)}</dd>
          </div>
        ))}
      </dl>

      <p className="text-muted-foreground mt-4 text-sm leading-normal">
        {firstCharge
          ? t("planNoteTrial", {
              date: day(firstCharge.date),
              amount: money(PRICES[tier][interval].monthlyEquivalent),
            })
          : t("planNoteCharge")}
      </p>

      {/* Changing your mind must not mean starting over -- and it lands on
          the cycle they were looking at, not on whatever the page opens
          with. */}
      <Link
        href={{ pathname: "/pricing", query: { cycle: interval } }}
        className="text-brand mt-4 inline-block text-sm underline"
      >
        {t("changePlan")}
      </Link>
    </aside>
  );
}
