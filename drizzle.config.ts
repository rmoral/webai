import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// Only `drizzle-kit generate` reads this, and generating a migration does
// not open a connection. Applying them goes through scripts/migrate.ts,
// which connects on the same terms as the app -- TLS included. Do not
// point anything that connects at these credentials without that.

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  strict: true,
  verbose: true,
});
