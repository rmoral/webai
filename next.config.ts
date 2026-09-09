import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {};

// Source-map upload only runs when SENTRY_AUTH_TOKEN is configured (CI/Vercel).
export default withSentryConfig(nextConfig, {
  silent: true,
  disableLogger: true,
});
