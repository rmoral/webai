import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from "@react-email/components";

import { PLANS, TRIAL } from "@/lib/billing/plans";
import { getPathname } from "@/lib/i18n/navigation";
import { emailTranslator, HTML_LANG, type Locale } from "./translator";

export function WelcomeEmail({
  appUrl,
  locale,
}: {
  appUrl: string;
  locale: Locale;
}) {
  const t = emailTranslator(locale);
  // The trial grants the Unlimited limits, so they are read from the plan
  // rather than typed into the copy, where they would go stale silently.
  const words = PLANS.unlimited.limits.maxWordsPerRequest.toLocaleString(
    locale === "en" ? "en-US" : "es-ES",
  );

  return (
    <Html lang={HTML_LANG[locale]}>
      <Head />
      <Preview>{t("welcomePreview")}</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#fafafa" }}>
        <Container style={{ padding: "32px", maxWidth: "480px" }}>
          <Heading as="h2">{t("welcomeHeading")}</Heading>
          <Text>{t("welcomeBody", { days: TRIAL.days, words })}</Text>
          <Text>
            <Link href={`${appUrl}${getPathname({ href: "/app", locale })}`}>
              {t("welcomeCta")}
            </Link>
          </Text>
          <Text style={{ color: "#666", fontSize: "12px" }}>
            {t("welcomeNote")}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
