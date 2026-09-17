import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";

// Resolves the locale for a server render and loads its messages. Called once
// per request by next-intl; the messages are a plain module import, so they
// are bundled and there is no I/O here.
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    // Formatting follows the language, not the visitor's machine: a price
    // has to read the same for everyone looking at the same page.
    timeZone: "UTC",
  };
});
