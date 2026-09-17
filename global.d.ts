import type { routing } from "@/lib/i18n/routing";
import type messages from "./messages/es.json";

// Makes every message key and every localised pathname a compile-time fact:
// t("landing.detect.h1") is checked, and <Link href="/detect"> only accepts
// a route that exists. Spanish is the reference because it is the default
// locale; tests/messages.test.ts is what keeps English in step with it.
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
