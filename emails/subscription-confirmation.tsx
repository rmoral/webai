import {
  CancelLink,
  ChargeBlock,
  DataRows,
  EmailBody,
  EmailButton,
  EmailHeading,
  EmailShell,
  type DataRow,
} from "./layout";
import { Footer } from "./footer";
import { emailTranslator, type Locale } from "./translator";

import { pathFor } from "@/lib/i18n/routing";

// Sent the moment a subscription becomes real: a card saved for a trial,
// or a first invoice paid. Its job is one fact -- when, and how much --
// said where it cannot be missed, plus, when money actually moved, the
// receipt that keeps somebody from asking their bank what the charge was.

export function SubscriptionConfirmationEmail({
  appUrl,
  locale,
  /** null when money moved today; the trial length otherwise. */
  trialDays,
  chargeDate,
  chargeAmount,
  paidToday,
  plan,
  /** Read off the invoice, never computed here. Absent for a trial. */
  receipt,
}: {
  appUrl: string;
  locale: Locale;
  trialDays: number | null;
  chargeDate: string;
  chargeAmount: string;
  paidToday: string;
  /** "Pro · anual", composed by the caller from the plan metadata. */
  plan: string;
  receipt?: DataRow[];
}) {
  const t = emailTranslator(locale);
  const trial = trialDays !== null;
  const cancel = `${appUrl}${pathFor("/app/account", locale)}?cancel=1`;

  return (
    <EmailShell
      locale={locale}
      preview={
        trial
          ? t("confirmTrialPreview", { date: chargeDate, amount: chargeAmount })
          : t("receiptPreview", { date: chargeDate, amount: chargeAmount })
      }
    >
      <EmailHeading>
        {trial ? t("confirmTrialHeading") : t("receiptHeading", { plan })}
      </EmailHeading>

      <EmailBody>
        {trial
          ? t("confirmTrialBody", { days: trialDays })
          : t("receiptPaidToday", { amount: paidToday })}
      </EmailBody>

      <ChargeBlock
        label={trial ? t("firstCharge") : t("nextRenewal")}
        date={chargeDate}
        amount={chargeAmount}
      />

      {receipt && receipt.length > 0 && <DataRows rows={receipt} />}

      <EmailButton href={`${appUrl}${pathFor("/app", locale)}`}>
        {t("goToApp")}
      </EmailButton>

      {/* The way out, in the body: a paragraph that says where it is and
          a link that goes straight there, rather than a second button
          competing with the first. */}
      <EmailBody>
        {trial ? (
          // During a trial the sentence that matters is a different one:
          // cancelling now costs nothing, which the paid wording -- "you
          // keep access until the end of the period you paid for" -- does
          // not say and must not be made to.
          t("confirmTrialCancel", { date: chargeDate })
        ) : (
          <>
            <b>{t("howToCancelLead")}</b>
            {t("howToCancelBody")}
          </>
        )}{" "}
        <CancelLink href={cancel}>
          {trial ? t("cancelTrialLink") : t("cancelSubscriptionLink")}
        </CancelLink>
      </EmailBody>

      {trial && <EmailBody muted>{t("confirmTrialReminder")}</EmailBody>}

      <Footer locale={locale} appUrl={appUrl} notice={t("footerNotice")} />
    </EmailShell>
  );
}
