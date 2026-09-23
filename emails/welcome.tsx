import {
  DataRows,
  EmailBody,
  EmailButton,
  EmailHeading,
  EmailShell,
} from "./layout";
import { Footer } from "./footer";
import { emailTranslator, type Locale } from "./translator";

import { PLANS } from "@/lib/billing/plans";
import { pathFor } from "@/lib/i18n/routing";

// Sent once, when the account is created.
//
// It sells nothing. The only thing a new account needs to know is what it
// can do and when the words come back, and the one promise worth making
// here is the one about never emailing to sell -- which is only worth
// making because this email keeps it.

export function WelcomeEmail({
  appUrl,
  locale,
  words,
}: {
  appUrl: string;
  locale: Locale;
  /** Pre-formatted, so the number reads the same here as on the page. */
  words: { free: string; anonymous: string; perRequest: string };
}) {
  const t = emailTranslator(locale);

  return (
    <EmailShell locale={locale} preview={t("welcomePreview")}>
      <EmailHeading>{t("welcomeHeading")}</EmailHeading>
      <EmailBody>{t("welcomeBody")}</EmailBody>

      <DataRows
        rows={[
          {
            key: t("welcomeRowDay"),
            value: t("welcomeValueDay", {
              free: words.free,
              anon: words.anonymous,
            }),
            lead: true,
          },
          {
            key: t("welcomeRowRequest"),
            value: t("welcomeValueRequest", { words: words.perRequest }),
          },
          { key: t("welcomeRowTools"), value: t("welcomeValueTools") },
          { key: t("welcomeRowReset"), value: t("welcomeValueReset") },
          { key: t("welcomeRowTexts"), value: t("welcomeValueTexts") },
        ]}
      />

      <EmailButton href={`${appUrl}${pathFor("/app", locale)}`}>
        {t("welcomeOpen")}
      </EmailButton>

      <EmailBody>{t("welcomeHowIn")}</EmailBody>
      <EmailBody muted>{t("welcomeNoSpam")}</EmailBody>

      <Footer
        locale={locale}
        appUrl={appUrl}
        notice={t("footerNoticeSignup")}
      />
    </EmailShell>
  );
}

/** The figures this email states, formatted by the caller's formatter. */
export function welcomeWords(format: (value: number) => string) {
  return {
    free: format(PLANS.free.limits.wordsPerDay ?? 0),
    anonymous: format(PLANS.anonymous.limits.wordsPerDay ?? 0),
    perRequest: format(PLANS.free.limits.maxWordsPerRequest),
  };
}
