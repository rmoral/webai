import { render } from "@react-email/components";
import { createTranslator } from "next-intl";
import { describe, expect, it } from "vitest";

import { SubscriptionConfirmationEmail } from "@/emails/subscription-confirmation";
import { TrialReminderEmail } from "@/emails/trial-reminder";
import { longDate } from "@/lib/billing/notify";
import es from "@/messages/es.json";
import en from "@/messages/en.json";

// These two emails exist to carry one fact each -- when, and how much --
// and the whole value of the phase is that the fact is impossible to miss.
// They are rendered here rather than asserted as message strings, because
// a string that never reaches the markup says nothing.

const APP = "https://verbalyx.ai";
const CHARGE = new Date("2026-09-21T10:00:00Z");

function subject(
  locale: "es" | "en",
  key: string,
  values: Record<string, string>,
) {
  const t = createTranslator({
    locale,
    messages: locale === "es" ? es : en,
    namespace: "emails",
  }) as unknown as (k: string, v?: Record<string, string>) => string;
  return t(key, values);
}

describe("longDate", () => {
  it("writes the month in words, in both languages", () => {
    // 09/21/2026 and 21/09/2026 are the same day written two ways and a
    // first-charge date cannot be ambiguous.
    expect(longDate("es", CHARGE)).toContain("septiembre");
    expect(longDate("en", CHARGE)).toContain("September");
    expect(longDate("es", CHARGE)).not.toMatch(/\d{2}\/\d{2}/);
    expect(longDate("en", CHARGE)).not.toMatch(/\d{2}\/\d{2}/);
  });
});

describe("subscription confirmation", () => {
  async function html(locale: "es" | "en") {
    return render(
      SubscriptionConfirmationEmail({
        appUrl: APP,
        locale,
        trialDays: 3,
        chargeDate: longDate(locale, CHARGE),
        chargeAmount: locale === "es" ? "29,99 US$" : "$29.99",
        paidToday: locale === "es" ? "0,00 US$" : "$0.00",
      }),
    );
  }

  it("states the date and the amount of the first charge", async () => {
    const body = await html("es");
    expect(body).toContain("septiembre");
    expect(body).toContain("29,99");
    expect(body).toContain("Primer cobro");
  });

  it("says cancelling is two clicks, and works during the trial", async () => {
    const body = await html("es");
    expect(body).toContain("dos clics");
    expect(body).toContain("durante la prueba");
  });

  it("makes cancelling a button rather than a buried link", async () => {
    // The industry hides this one. An <a> carrying its own box still looks
    // like a button with images blocked, which a background image would not.
    const body = await html("es");
    const anchor = body.match(
      /<a\b[^>]*>(?:(?!<\/a>)[\s\S])*Gestionar o cancelar/,
    );
    expect(anchor).not.toBeNull();
    expect(anchor![0]).toContain("border-radius");
  });

  it("carries no images, so a blocked client loses nothing", async () => {
    expect(await html("es")).not.toContain("<img");
    expect(await html("en")).not.toContain("<img");
  });

  it("identifies the company and calls itself a billing notice", async () => {
    // What keeps a transactional message out of the marketing rules, and
    // out of an unsubscribe that would let someone opt out of being told
    // they are about to be charged.
    const body = await html("es");
    expect(body).toContain("YBB Solutions, LLC");
    expect(body).toContain("no publicidad");
    expect(await html("en")).toContain("not marketing");
  });

  it("asks for no webfont: mail clients do not fetch them reliably", async () => {
    expect(await html("es")).not.toContain("Geist");
  });
});

describe("trial reminder", () => {
  async function html(locale: "es" | "en") {
    return render(
      TrialReminderEmail({
        appUrl: APP,
        locale,
        chargeDate: longDate(locale, CHARGE),
        chargeAmount: locale === "es" ? "29,99 US$" : "$29.99",
        proAmount: locale === "es" ? "14,99 US$" : "$14.99",
      }),
    );
  }

  it("names all three ways out, doing nothing included", async () => {
    const body = await html("es");
    // A reminder that only offers cancelling reads as a threat; one that
    // hides cancelling is what produces disputes.
    expect(body).toContain("No hagas nada");
    expect(body).toContain("Bajar a Pro");
    expect(body).toContain("Cancelar");
  });

  it("puts the figure in the subject and the preheader", async () => {
    // A good share of people decide whether this matters from the inbox
    // list alone, without opening it.
    expect(subject("es", "reminderSubject", { amount: "29,99 US$" })).toContain(
      "29,99 US$",
    );
    expect(await html("es")).toContain("29,99 US$");
    expect(subject("en", "reminderSubject", { amount: "$29.99" })).toContain(
      "$29.99",
    );
  });

  it("states the exact end date, not 'tomorrow' alone", async () => {
    expect(await html("es")).toContain("21 de septiembre de 2026");
  });
});
