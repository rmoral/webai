import { createFormatter, createTranslator } from "next-intl";

import { HTML_LANG, type Locale } from "@/lib/i18n/routing";
import en from "@/messages/en.json";
import es from "@/messages/es.json";

// Emails are rendered from a Stripe webhook, which has no request and no
// URL, so there is no locale context to read. The language travels in the
// subscription's Stripe metadata from the moment of checkout -- the last
// point at which we knew what the customer was reading -- and lands here.
//
// createTranslator works outside React, which is what makes the same message
// catalogue usable in an email as on a page. One catalogue, no second copy
// of the wording to fall out of step.

const MESSAGES = { es, en };

export function emailTranslator(locale: Locale) {
  return createTranslator({
    locale,
    messages: MESSAGES[locale],
    namespace: "emails",
  });
}

/**
 * Plan names, for the emails that have to say which plan.
 *
 * Same catalogue as the pages: "Ilimitado" cannot be one word on screen
 * and another in the inbox.
 */
export function planTranslator(locale: Locale) {
  return createTranslator({
    locale,
    messages: MESSAGES[locale],
    namespace: "plans",
  });
}

/**
 * Numbers as the reader's language writes them, outside a request.
 *
 * Here rather than in one of the senders because both of them need it: a
 * word count is "1.234" in an email to Spain and "1,234" in one to the US,
 * and the two must not be formatted by two different pieces of code.
 */
export function numberIn(locale: Locale): (value: number) => string {
  const format = createFormatter({ locale, timeZone: "UTC" });
  return (value) => format.number(value);
}

/**
 * Tool names, for the onboarding emails that suggest one.
 *
 * Same catalogue again: a tool called "Humanizador" on the page cannot be
 * something else in the inbox.
 */
export function toolTranslator(locale: Locale) {
  return createTranslator({
    locale,
    messages: MESSAGES[locale],
    namespace: "tools",
  });
}

export { HTML_LANG };
export type { Locale };
