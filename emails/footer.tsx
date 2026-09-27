import { EmailFooter } from "./layout";
import { emailTranslator, type Locale } from "./translator";

import { LEGAL_SLUGS } from "@/lib/i18n/legal";
import { pathFor } from "@/lib/i18n/routing";

// The footer every template ends with, wired to the one privacy policy
// there is. Only the first line changes: it says why this particular email
// arrived, which is what keeps a transactional message transactional.

export function Footer({
  locale,
  appUrl,
  notice,
  optOutHref,
}: {
  locale: Locale;
  appUrl: string;
  notice: string;
  /** Only the onboarding emails pass one. See EmailFooter. */
  optOutHref?: string;
}) {
  const t = emailTranslator(locale);
  const privacy = `${appUrl}${pathFor("/legal/[slug]", locale).replace(
    "[slug]",
    LEGAL_SLUGS[locale].privacy,
  )}`;

  return (
    <EmailFooter
      notice={notice}
      company={t("footerCompany")}
      privacyHref={privacy}
      privacyLabel={t("footerPrivacy")}
      optOut={
        optOutHref ? { href: optOutHref, label: t("footerOptOut") } : undefined
      }
    />
  );
}
