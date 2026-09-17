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

import { getPathname } from "@/lib/i18n/navigation";
import { emailTranslator, HTML_LANG, type Locale } from "./translator";

export function TrialEndingEmail({
  appUrl,
  locale,
}: {
  appUrl: string;
  locale: Locale;
}) {
  const t = emailTranslator(locale);

  return (
    <Html lang={HTML_LANG[locale]}>
      <Head />
      <Preview>{t("trialPreview")}</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#fafafa" }}>
        <Container style={{ padding: "32px", maxWidth: "480px" }}>
          <Heading as="h2">{t("trialHeading")}</Heading>
          <Text>{t("trialBody")}</Text>
          <Text>
            {t("trialCancelBefore")}{" "}
            <Link href={`${appUrl}${getPathname({ href: "/app", locale })}`}>
              {t("trialAccount")}
            </Link>{" "}
            {t("trialCancelAfter")}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
