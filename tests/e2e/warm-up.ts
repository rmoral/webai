import type { FullConfig } from "@playwright/test";

// Compiles every route the suite touches before the first test runs.
//
// Next's dev server builds a route on its first request, and that pause
// lands in the middle of whichever test asked for it first. The symptom is
// a click that is swallowed because the page has not hydrated yet -- which
// looks exactly like a real bug in the thing being tested, and is not.
//
// Against a production build this would be unnecessary, but the suite runs
// on the dev server so that Turnstile does not fail closed on the tool
// endpoints.
//
// One route at a time. Fired all at once against a cold server, the
// compiles overlapped and one of them left a JSON file under .next
// half-written: from then on every page rendered "SyntaxError: Unexpected
// non-whitespace character after JSON" as a 500, and 99 of 107 specs
// failed in CI. Every route a spec visits is listed, so none compiles for
// the first time while two workers are already making requests.

const ROUTES = [
  "/",
  "/humanizador-de-texto-ia",
  "/detector-de-ia",
  "/parafrasear-texto",
  "/corrector-ortografico-gramatical",
  "/precios",
  "/login",
  "/registro",
  "/pago",
  "/pago/listo",
  "/en",
  "/en/ai-humanizer",
  "/en/ai-detector",
  "/en/pricing",
  "/sitemap.xml",
  "/robots.txt",
  "/app/historial",
  "/baja-emails",
  "/blog",
  "/blog/como-humanizar-un-texto-de-ia",
  "/legal/terminos",
  "/no-existe",
  "/en/blog",
  "/en/paraphrasing-tool",
];

export default async function warmUp(config: FullConfig) {
  const base =
    process.env.PLAYWRIGHT_BASE_URL ??
    config.projects[0]?.use?.baseURL ??
    "http://localhost:3000";

  for (const route of ROUTES) {
    // A redirect or a 404 still compiles the route, which is the point.
    await fetch(new URL(route, base)).catch(() => undefined);
  }
}
