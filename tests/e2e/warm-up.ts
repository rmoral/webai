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
];

export default async function warmUp(config: FullConfig) {
  const base =
    process.env.PLAYWRIGHT_BASE_URL ??
    config.projects[0]?.use?.baseURL ??
    "http://localhost:3000";

  await Promise.all(
    ROUTES.map((route) =>
      // A redirect or a 404 still compiles the route, which is the point.
      fetch(new URL(route, base)).catch(() => undefined),
    ),
  );
}
