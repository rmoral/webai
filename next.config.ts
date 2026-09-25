import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";

// CSP must be extended when adding third-party scripts (GTM, Stripe.js…).
// googletagmanager.com serves gtag.js; the analytics and region subdomains
// are where it posts. Consent Mode keeps the tag from storing anything
// before the visitor allows it, but the tag still loads, so the origins
// have to be here either way.
// hooks.stripe.com is where the 3-D Secure challenge is framed: without it
// every card that asks for authentication -- which in the EU is most of
// them -- fails at the last step. *.js.stripe.com is the set of origins
// Stripe.js spreads the Element frames over.
// 'unsafe-inline' is required by Next.js hydration; 'unsafe-eval' only in dev.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com https://js.stripe.com https://*.js.stripe.com https://www.googletagmanager.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.google-analytics.com https://www.googletagmanager.com",
  "font-src 'self'",
  // auth.verbalyx.ai is the Supabase custom domain. It is listed beside
  // the *.supabase.co wildcard rather than instead of it, because the
  // wildcard does not cover it and switching NEXT_PUBLIC_SUPABASE_URL must
  // not depend on a deploy landing in the same minute.
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://auth.verbalyx.ai wss://auth.verbalyx.ai https://eu.i.posthog.com https://*.ingest.sentry.io https://*.ingest.de.sentry.io https://challenges.cloudflare.com https://api.stripe.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
  "frame-src https://challenges.cloudflare.com https://js.stripe.com https://*.js.stripe.com https://hooks.stripe.com https://checkout.stripe.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

// Points next-intl at lib/i18n/request.ts instead of the default location,
// so everything about languages lives under lib/i18n.
const withNextIntl = createNextIntlPlugin("./lib/i18n/request.ts");

// Source-map upload only runs when SENTRY_AUTH_TOKEN is configured (CI/Vercel).
export default withSentryConfig(withNextIntl(nextConfig), {
  silent: true,
  disableLogger: true,
});
