import { defineConfig } from "@playwright/test";

// PLAYWRIGHT_CHROMIUM_PATH lets a sandbox with a preinstalled browser run
// the suite without downloading a matching build.
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH;

export default defineConfig({
  testDir: "tests/e2e",
  // Compiles the routes before the first test, so a dev-server build pause
  // cannot land inside an assertion. See tests/e2e/warm-up.ts.
  globalSetup: "./tests/e2e/warm-up.ts",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    ...(executablePath ? { launchOptions: { executablePath } } : {}),
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "pnpm dev",
        url: "http://localhost:3000",
        reuseExistingServer: true,
      },
});
