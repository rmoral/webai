import { EmailBody, EmailButton, EmailHeading, EmailShell } from "./layout";
import { Footer } from "./footer";
import { emailTranslator, toolTranslator, type Locale } from "./translator";

import { TOOLS, type ToolId } from "@/lib/ai/tools";
import { pathFor } from "@/lib/i18n/routing";

// The two emails that follow a signup, on day 2 and on day 5.
//
// These are the only messages this codebase sends that a person may refuse:
// they exist to get somebody using what they registered for, which is not
// the same as telling them money is about to move. So they carry the
// opt-out link and every other template does not (see EmailFooter), and the
// cron reads `marketing_opt_out_at` before choosing anybody.
//
// Both are short on purpose. The day-2 email has one idea and one link; the
// day-5 one states what the account already gives before it mentions paying
// for more. An onboarding email that opens with the price is an
// advertisement, and people unsubscribe from advertisements.

function toolUrl(appUrl: string, locale: Locale, tool: ToolId): string {
  return `${appUrl}${pathFor(TOOLS[tool].path, locale)}`;
}

/**
 * Day 2: one concrete thing to try, on the tool they have not used yet.
 *
 * `tool` is chosen from their own usage rows, so somebody who has already
 * humanised a text is pointed somewhere new rather than being told to do
 * again what they did on day one.
 */
export function OnboardingDay2Email({
  appUrl,
  locale,
  tool,
  optOutHref,
}: {
  appUrl: string;
  locale: Locale;
  tool: ToolId;
  optOutHref: string;
}) {
  const t = emailTranslator(locale);
  const name = toolTranslator(locale)(`${tool}.name`);
  const guide = `${appUrl}${pathFor("/blog/[slug]", locale).replace(
    "[slug]",
    "como-humanizar-un-texto-de-ia",
  )}`;

  return (
    <EmailShell locale={locale} preview={t("day2Preview")}>
      <EmailHeading>{t("day2Heading")}</EmailHeading>
      <EmailBody>{t("day2Body", { tool: name })}</EmailBody>
      <EmailBody>{t("day2Tip")}</EmailBody>
      <EmailButton href={toolUrl(appUrl, locale, tool)}>
        {t("day2Cta", { tool: name })}
      </EmailButton>
      <EmailBody>
        {t("day2Guide")} <a href={guide}>{t("day2GuideLink")}</a>
      </EmailBody>
      <Footer
        locale={locale}
        appUrl={appUrl}
        notice={t("footerOnboarding")}
        optOutHref={optOutHref}
      />
    </EmailShell>
  );
}

/**
 * Day 5: what the free account gives, and what paying adds.
 *
 * `words` is their own figure, taken from the aggregate usage rows -- a
 * count, never any text; CLAUDE.md forbids storing the text of a free
 * account at all. Zero is a different email and the cron does not send
 * this one for it: telling somebody who never used the tool what their
 * limits are is a price list, not onboarding.
 */
export function OnboardingDay5Email({
  appUrl,
  locale,
  words,
  freeWords,
  proMonth,
  proRequest,
  proAmount,
  optOutHref,
}: {
  appUrl: string;
  locale: Locale;
  /** Words processed so far. Never zero: see above. */
  words: string;
  /**
   * Every figure below comes from lib/billing/plans.ts through the caller.
   * CLAUDE.md forbids writing a plan limit into a component, and an email
   * is the worst place to keep a stale one: it cannot be corrected once
   * it has been sent.
   */
  freeWords: string;
  proMonth: string;
  proRequest: string;
  proAmount: string;
  optOutHref: string;
}) {
  const t = emailTranslator(locale);

  return (
    <EmailShell locale={locale} preview={t("day5Preview", { words })}>
      <EmailHeading>{t("day5Heading", { words })}</EmailHeading>
      <EmailBody>{t("day5Body", { freeWords })}</EmailBody>
      <EmailBody>
        {t("day5Pro", {
          amount: proAmount,
          month: proMonth,
          request: proRequest,
        })}
      </EmailBody>
      <EmailButton href={`${appUrl}${pathFor("/pricing", locale)}`}>
        {t("day5Cta")}
      </EmailButton>
      <EmailBody>{t("day5NoRush")}</EmailBody>
      <Footer
        locale={locale}
        appUrl={appUrl}
        notice={t("footerOnboarding")}
        optOutHref={optOutHref}
      />
    </EmailShell>
  );
}
