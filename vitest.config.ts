import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
    // next-intl ships ESM that imports "next/navigation" without an
    // extension. Node's resolver refuses it, so anything importing a
    // client component fails to load; transformed by vite it resolves.
    server: { deps: { inline: ["next-intl"] } },
    include: ["tests/**/*.test.{ts,tsx}"],
  },
});
