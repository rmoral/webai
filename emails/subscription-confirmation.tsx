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

// Sent the moment a subscription becomes real: a card saved for a trial, or
// a first invoice paid. Its job is one fact -- when, and how much -- said
// where it cannot be missed.

export function SubscriptionConfirmationEmail({
  appUrl,
  locale,
  /** null when money moved today; the trial length otherwise. */
  trialDays,
  chargeDate,
  chargeAmount,
  paidToday,
}: {
  appUrl: string;
  locale: Locale;
  trialDays: number | null;
  chargeDate: string;
  chargeAmount: string;
  paidToday: string;
}) {
  const t = emailTranslator(locale);
  const app = `${appUrl}${pathFor("/app", locale)}`;
  const account = `${appUrl}${pathFor("/app/account", locale)}`;
  const trial = trialDays !== null;

  return (
    <EmailShell
      locale={locale}
      preview={
        trial
          ? t("confirmTrialPreview", { date: chargeDate, amount: chargeAmount })
          : t("confirmPaidPreview", { date: chargeDate, amount: paidToday })
      }
    >
      <EmailHeading>
        {trial ? t("confirmTrialHeading") : t("confirmPaidHeading")}
      </EmailHeading>

      <EmailBody>
        {trial
          ? t("confirmTrialBody", { days: trialDays })
          : t("confirmPaidBody", { amount: paidToday })}
      </EmailBody>

      <ChargeBlock
        label={trial ? t("firstCharge") : t("nextRenewal")}
        date={chargeDate}
        amount={chargeAmount}
      />

      <EmailBody>
        {trial
          ? t("confirmTrialCancel", { date: chargeDate })
          : t("confirmPaidCancel")}
      </EmailBody>

      {trial && <EmailBody>{t("confirmTrialReminder")}</EmailBody>}

      <Buttons app={app} account={account} t={t} />

      <EmailFooter lines={[t("footerCompany"), t("footerNotice")]} />
    </EmailShell>
  );
}

function Buttons({
  app,
  account,
  t,
}: {
  app: string;
  account: string;
  t: ReturnType<typeof emailTranslator>;
}) {
  return (
    <>
      <EmailButton href={app}>{t("goToApp")}</EmailButton>
      {/* Cancelling is a button, not a link buried in a paragraph. */}
      <EmailButton href={account} variant="outline">
        {t("manageOrCancel")}
      </EmailButton>
    </>
  );
}
