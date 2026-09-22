import {
  ChargeBlock,
  EmailBody,
  EmailButton,
  EmailFooter,
  EmailHeading,
  EmailShell,
} from "./layout";
import { emailTranslator, type Locale } from "./translator";

import { pathFor } from "@/lib/i18n/routing";

// Sent 24 hours before the trial converts, by our own cron.
//
// Stripe's customer.subscription.trial_will_end fires three days before the
// end, which on a three-day trial is the moment the trial is created. It
// cannot be the trigger for this, and using it was sending "your trial ends
// tomorrow" on day zero.
//
// It names all three ways out, including doing nothing. A reminder that
// only offers cancelling reads as a threat; one that hides cancelling is
// the thing that produces disputes.

export function TrialReminderEmail({
  appUrl,
  locale,
  chargeDate,
  chargeAmount,
  proAmount,
}: {
  appUrl: string;
  locale: Locale;
  chargeDate: string;
  chargeAmount: string;
  proAmount: string;
}) {
  const t = emailTranslator(locale);
  const app = `${appUrl}${pathFor("/app", locale)}`;
  const account = `${appUrl}${pathFor("/app/account", locale)}`;

  return (
    <EmailShell
      locale={locale}
      preview={t("reminderPreview", { amount: chargeAmount, date: chargeDate })}
    >
      <EmailHeading>
        {t("reminderHeading", { amount: chargeAmount })}
      </EmailHeading>

      <EmailBody>{t("reminderBody", { date: chargeDate })}</EmailBody>

      <ChargeBlock
        label={t("firstCharge")}
        date={chargeDate}
        amount={chargeAmount}
      />

      <EmailBody>{t("reminderStay")}</EmailBody>
      <EmailBody>{t("reminderDowngrade", { amount: proAmount })}</EmailBody>
      <EmailBody>{t("reminderCancel", { date: chargeDate })}</EmailBody>

      <EmailButton href={app}>{t("goToApp")}</EmailButton>
      <EmailButton href={account} variant="outline">
        {t("manageOrCancel")}
      </EmailButton>

      <EmailFooter lines={[t("footerCompany"), t("footerNotice")]} />
    </EmailShell>
  );
}
