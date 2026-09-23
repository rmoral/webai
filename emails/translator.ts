import { createTranslator } from "next-intl";

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

export { HTML_LANG };
export type { Locale };
