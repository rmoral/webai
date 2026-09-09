import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// CSP must be extended when adding third-party scripts (GTM, Stripe.js…).
// 'unsafe-inline' is required by Next.js hydration; 'unsafe-eval' only in dev.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com https://js.stripe.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://eu.i.posthog.com https://*.ingest.sentry.io https://*.ingest.de.sentry.io https://challenges.cloudflare.com https://api.stripe.com",
  "frame-src https://challenges.cloudflare.com https://js.stripe.com https://checkout.stripe.com",
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

// Source-map upload only runs when SENTRY_AUTH_TOKEN is configured (CI/Vercel).
export default withSentryConfig(nextConfig, {
  silent: true,
  disableLogger: true,
});
