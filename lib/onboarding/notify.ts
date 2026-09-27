import { OnboardingDay2Email, OnboardingDay5Email } from "@/emails/onboarding";
import { emailTranslator, numberIn } from "@/emails/translator";
import type { ToolId } from "@/lib/ai/tools";
import { PLANS, PRICES, formatUsd } from "@/lib/billing/plans";
import { sendEmail } from "@/lib/email";
import { optOutToken } from "@/lib/email/optout";
import { getPathname } from "@/lib/i18n/navigation";
import type { Locale } from "@/lib/i18n/routing";

// Sending the two onboarding emails.
//
// Every plan figure a template shows is read here, from
// lib/billing/plans.ts. A limit written into a template is a limit that goes
// stale, and an email is the one surface where that cannot be corrected
// after the fact.
//
// The templates are called as functions rather than rendered as JSX, which
// is what the billing sender does and what keeps these modules plain .ts.

/**
 * Where the "stop sending these" line in an email points.
 *
 * Here rather than beside the signing because it needs the routing table,
 * and keeping that out of lib/email/optout.ts is what lets the token be
 * signed and checked from anywhere -- a page, this cron, a test.
 */
export function optOutUrl(
  appUrl: string,
  locale: Locale,
  userId: string,
): string {
  const path = getPathname({ href: "/email/unsubscribe", locale });
  return `${appUrl}${path}?t=${encodeURIComponent(optOutToken(userId))}`;
}

/**
 * The headers that make a bulk email legitimate.
 *
 * `List-Unsubscribe-Post` is what turns the header into the one-click
 * unsubscribe Gmail and Yahoo require of bulk senders; without it the header
 * is read as a link and the requirement is unmet. The mailto is the fallback
 * for clients that do not POST. Getting this wrong is what gets a domain
 * filtered, and a filtered domain takes the billing notices down with it.
 */
export function unsubscribeHeaders(oneClick: string): Record<string, string> {
  return {
    "List-Unsubscribe": `<${oneClick}>, <mailto:hola@verbalyx.ai?subject=baja>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}

/**
 * The API route honours the same signed token as the page.
 *
 * Exported, like subscriptionParams in lib/billing/subscribe.ts, because the
 * rule that matters here cannot be asserted through a send: without a Resend
 * key the send is a no-op, so the only place a wrong header would show up is
 * a mailbox provider's spam folder, months later.
 */
export function oneClickUrl(
  appUrl: string,
  locale: Locale,
  userId: string,
): string {
  const { search } = new URL(optOutUrl(appUrl, locale, userId));
  return `${appUrl}/api/email/unsubscribe${search}`;
}

export async function sendOnboardingDay2(args: {
  to: string;
  userId: string;
  locale: Locale;
  appUrl: string;
  tool: ToolId;
}): Promise<void> {
  const t = emailTranslator(args.locale);

  await sendEmail({
    to: args.to,
    subject: t("day2Subject"),
    react: OnboardingDay2Email({
      appUrl: args.appUrl,
      locale: args.locale,
      tool: args.tool,
      optOutHref: optOutUrl(args.appUrl, args.locale, args.userId),
    }),
    headers: unsubscribeHeaders(
      oneClickUrl(args.appUrl, args.locale, args.userId),
    ),
  });
}

export async function sendOnboardingDay5(args: {
  to: string;
  userId: string;
  locale: Locale;
  appUrl: string;
  /** Their own figure, from the aggregate usage rows. Never zero. */
  words: number;
}): Promise<void> {
  const t = emailTranslator(args.locale);
  const n = numberIn(args.locale);
  const pro = PLANS.pro.limits;

  await sendEmail({
    to: args.to,
    subject: t("day5Subject", { words: n(args.words) }),
    react: OnboardingDay5Email({
      appUrl: args.appUrl,
      locale: args.locale,
      words: n(args.words),
      freeWords: n(PLANS.free.limits.wordsPerDay ?? 0),
      proMonth: n(pro.wordsPerMonth ?? 0),
      proRequest: n(pro.maxWordsPerRequest),
      proAmount: formatUsd(PRICES.pro.monthly.amount, args.locale),
      optOutHref: optOutUrl(args.appUrl, args.locale, args.userId),
    }),
    headers: unsubscribeHeaders(
      oneClickUrl(args.appUrl, args.locale, args.userId),
    ),
  });
}
