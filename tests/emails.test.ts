import { render } from "@react-email/components";
import { createTranslator } from "next-intl";
import { describe, expect, it } from "vitest";

import { CancellationEmail } from "@/emails/cancellation";
import { SubscriptionConfirmationEmail } from "@/emails/subscription-confirmation";
import { TrialReminderEmail } from "@/emails/trial-reminder";
import { WelcomeEmail, welcomeWords } from "@/emails/welcome";
import { longDate } from "@/lib/billing/notify";
import es from "@/messages/es.json";
import en from "@/messages/en.json";

// These two emails exist to carry one fact each -- when, and how much --
// and the whole value of the phase is that the fact is impossible to miss.
// They are rendered here rather than asserted as message strings, because
// a string that never reaches the markup says nothing.

const APP = "https://verbalyx.ai";
const CHARGE = new Date("2026-09-21T10:00:00Z");

/**
 * How many anchors in this email look like a button.
 *
 * The rule is one per email, and the shape is what says so: an <a> that
 * carries its own box still reads as a button when images are blocked,
 * which a background image would not.
 */
function buttons(html: string): number {
  return (html.match(/<a\b[^>]*padding:\s*14px 24px/g) ?? []).length;
}

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
        plan: locale === "es" ? "Ilimitado · mensual" : "Unlimited · monthly",
      }),
    );
  }

  it("states the date and the amount of the first charge", async () => {
    const body = await html("es");
    expect(body).toContain("septiembre");
    expect(body).toContain("29,99");
    expect(body).toContain("Primer cobro");
  });

  it("says cancelling during the trial costs nothing", async () => {
    // The paid wording -- access until the end of the period you paid for
    // -- is not true of a trial, and saying it there would be telling
    // somebody they had paid for something they have not.
    const body = await html("es");
    expect(body).toContain("durante la prueba");
    expect(body).not.toContain("periodo pagado");
  });

  it("puts cancelling in the body, as a visible link", async () => {
    // The industry hides this one in the footer. Here it sits in the
    // paragraph that explains it, underlined and in brand ink, and it goes
    // straight to the cancellation flow rather than to the portal's front
    // page -- which is what makes "two clicks" true.
    const body = await html("es");
    expect(body).toContain("Cancelar la prueba");
    expect(body).toContain("cancel=1");
  });

  it("carries one button, and only one", async () => {
    // Two calls to action is a decision the reader has to make before
    // they have read anything.
    expect(buttons(await html("es"))).toBe(1);
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

describe("receipt", () => {
  // The same template with money actually moved: what a customer looks at
  // when a charge they do not recognise appears on a statement.
  async function html(locale: "es" | "en") {
    return render(
      SubscriptionConfirmationEmail({
        appUrl: APP,
        locale,
        trialDays: null,
        chargeDate: longDate(locale, CHARGE),
        chargeAmount: locale === "es" ? "89,88 US$" : "$89.88",
        paidToday: locale === "es" ? "89,88 US$" : "$89.88",
        plan: locale === "es" ? "Pro · anual" : "Pro · yearly",
        receipt: [
          { key: "Importe pagado", value: "89,88 US$", lead: true },
          { key: "De los cuales, impuestos", value: "15,60 US$" },
          { key: "En tu extracto bancario", value: "VERBALYX" },
          {
            key: "Factura",
            value: "Descargar factura (PDF)",
            href: "https://invoice.stripe.com/i/abc",
          },
        ],
      }),
    );
  }

  it("states what was paid and when the next charge falls", async () => {
    const body = await html("es");
    expect(body).toContain("89,88");
    expect(body).toContain("21 de septiembre de 2026");
    expect(body).toContain("Próxima renovación");
  });

  it("carries the receipt rows, the statement line among them", async () => {
    // "What is this charge?" is the question that becomes a dispute. The
    // string the bank prints is in the email that announced it.
    const body = await html("es");
    expect(body).toContain("VERBALYX");
    expect(body).toContain("15,60");
    expect(body).toContain("https://invoice.stripe.com/i/abc");
  });

  it("puts cancelling in the body and sends it straight to the flow", async () => {
    const body = await html("es");
    expect(body).toContain("Cómo cancelar");
    expect(body).toContain("Cancelar la suscripción");
    expect(body).toContain("cancel=1");
  });

  it("carries one button, and only one", async () => {
    expect(buttons(await html("es"))).toBe(1);
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

  it("puts the figure and the date in the subject and the preheader", async () => {
    // A good share of people decide whether this matters from the inbox
    // list alone, without opening it.
    const es = subject("es", "reminderSubject", {
      amount: "29,99 US$",
      date: "21 de septiembre de 2026",
    });
    expect(es).toContain("29,99 US$");
    expect(es).toContain("21 de septiembre de 2026");
    expect(await html("es")).toContain("29,99 US$");

    const en = subject("en", "reminderSubject", {
      amount: "$29.99",
      date: "21 September 2026",
    });
    expect(en).toContain("$29.99");
    expect(en).toContain("21 September 2026");
  });

  it("names the date rather than saying 'tomorrow'", async () => {
    // The cron runs once a day, which is all a Vercel Hobby account
    // allows, so this lands anywhere between one and two days before the
    // charge. "Tomorrow" would be wrong about half the time, in the one
    // message whose whole job is to be exact about when money moves.
    const body = await html("es");
    expect(body).toContain("21 de septiembre de 2026");
    expect(body).not.toMatch(/\bMañana\b/i);
    expect(await html("en")).not.toMatch(/\btomorrow\b/i);
  });
});

describe("welcome", () => {
  async function html(locale: "es" | "en") {
    return render(
      WelcomeEmail({
        appUrl: APP,
        locale,
        words: welcomeWords((value) => String(value)),
      }),
    );
  }

  it("says what the free account gives, with the figures", async () => {
    const body = await html("es");
    expect(body).toContain("500");
    expect(body).toContain("300");
    expect(body).toContain("Humanizador y detector");
  });

  it("promises not to email about the plans, and keeps it here", async () => {
    // The one promise worth making to a new free account, and the email
    // that makes it is the email that has to keep it: no price, no
    // discount, no link to pricing.
    const body = await html("es");
    expect(body).toContain("No te escribiremos para vendértelos");
    expect(body).not.toMatch(/href="[^"]*\/precios/);
    expect(buttons(body)).toBe(1);
  });

  it("says it subscribes the reader to nothing", async () => {
    expect(await html("es")).toContain("no te suscribe a nada");
    expect(await html("en")).toContain("subscribes you to nothing");
  });
});

describe("cancellation", () => {
  async function html(locale: "es" | "en", trial: boolean) {
    return render(
      CancellationEmail({
        appUrl: APP,
        locale,
        trial,
        plan: locale === "es" ? "Pro · mensual" : "Pro · monthly",
        until: longDate(locale, CHARGE),
        cancelledOn: longDate(locale, new Date("2026-09-14T10:00:00Z")),
        rows: {
          lastCharge: trial
            ? undefined
            : "14 de septiembre de 2026 · 14,99 US$",
          freeWords: "500",
          zero: locale === "es" ? "0,00 US$" : "$0.00",
        },
      }),
    );
  }

  it("answers the question a cancellation provokes", async () => {
    // Will I be charged again? Said before it is asked, and said as a
    // date rather than as a reassurance.
    const body = await html("es", false);
    expect(body).toContain("No se te cobrará nada más");
    expect(body).toContain("21 de septiembre de 2026");
  });

  it("is unambiguous that a cancelled trial cost nothing", async () => {
    const body = await html("es", true);
    expect(body).toContain("No se te ha cobrado nada");
    expect(body).toContain("0,00 US$");
  });

  it("does not try to win the customer back", async () => {
    // Somebody who has just cancelled is not a lead, and arguing with the
    // decision is how a cancellation becomes a complaint. The one mention
    // of coming back has nothing to click.
    for (const trial of [true, false]) {
      const body = await html("es", trial);
      expect(body).not.toMatch(/href="[^"]*\/precios/);
      expect(body).not.toContain("Ver planes");
      expect(body).not.toContain("descuento");
      expect(buttons(body)).toBe(1);
    }
  });
});
