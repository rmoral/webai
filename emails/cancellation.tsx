import {
  ChargeBlock,
  DataRows,
  EmailBody,
  EmailButton,
  EmailHeading,
  EmailShell,
} from "./layout";
import { Footer } from "./footer";
import { emailTranslator, type Locale } from "./translator";

import { pathFor } from "@/lib/i18n/routing";

// Sent when a subscription is cancelled, and when a trial is.
//
// No retention: no offer, no discount, no link to pricing. Somebody who
// has just cancelled is not a lead, and an email that argues with the
// decision they made is how a cancellation becomes a complaint. The one
// mention of coming back is a sentence with nothing to click.
//
// Its job is to answer the question that follows a cancellation -- will I
// be charged? -- before it is asked.

export function CancellationEmail({
  appUrl,
  locale,
  /** True while the trial was still running: nothing was ever charged. */
  trial,
  plan,
  until,
  cancelledOn,
  rows,
}: {
  appUrl: string;
  locale: Locale;
  trial: boolean;
  /** "Pro · mensual", already composed by the caller. */
  plan: string;
  /** Last day of access, in words. */
  until: string;
  cancelledOn: string;
  /** What was last charged, when there was a charge at all. */
  rows: { lastCharge?: string; freeWords: string; zero: string };
}) {
  const t = emailTranslator(locale);

  return (
    <EmailShell
      locale={locale}
      preview={
        trial
          ? t("cancelledTrialPreview", { plan, date: until })
          : t("cancelledPreview", { plan, date: until })
      }
    >
      <EmailHeading>
        {trial ? t("cancelledTrialHeading") : t("cancelledHeading")}
      </EmailHeading>
      <EmailBody>
        {trial ? t("cancelledTrialBody") : t("cancelledBody")}
      </EmailBody>

      {/* The date access ends, in the place the charge date occupies in
          the other emails: it is the fact this one exists to state. */}
      <ChargeBlock
        label={t("cancelledKeep", { plan })}
        date={until}
        amount={
          trial
            ? t("cancelledTrialCharge", { amount: rows.zero })
            : t("cancelledNoCharge")
        }
      />

      <DataRows
        rows={[
          { key: t("rowCancelledPlan"), value: plan },
          ...(rows.lastCharge
            ? [{ key: t("rowLastCharge"), value: rows.lastCharge }]
            : []),
          { key: t("rowCancelledOn"), value: cancelledOn },
          {
            key: t("rowFrom", { date: until }),
            value: t("valueFreePlan", { free: rows.freeWords }),
          },
        ]}
      />

      <EmailButton href={`${appUrl}${pathFor("/app/account", locale)}`}>
        {t("cancelledAccount")}
      </EmailButton>

      <EmailBody muted>
        {trial ? t("cancelledTrialCheck") : t("cancelledBack")}
      </EmailBody>

      <Footer locale={locale} appUrl={appUrl} notice={t("footerNotice")} />
    </EmailShell>
  );
}
