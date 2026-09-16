// Applies pending Drizzle migrations.
//
// This replaces `drizzle-kit migrate`, which ends a failed run with a
// spinner and exit code 1 and never says what Postgres refused. It also
// read its connection from drizzle.config.ts, which bypassed the TLS that
// lib/db/client.ts requires -- so the app connected and the migration
// could not. Both problems came from the migration path having its own
// idea of how to reach the database. It no longer does.

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

import { sslFor } from "../lib/db/client";
import { databaseTarget, describeDatabaseFailure } from "../lib/config/health";

async function main() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const target = databaseTarget();
  console.log(`Connecting to ${target.endpoint}`);
  if (target.problem) console.warn(`Warning: ${target.problem}`);

  // One connection, no prepared statements: the same terms the pooler
  // gives the app, so a migration cannot pass where a request would fail.
  const sql = postgres(url, { max: 1, prepare: false, ...sslFor(url) });

  try {
    await migrate(drizzle(sql), { migrationsFolder: "lib/db/migrations" });
    console.log("Migrations applied.");
  } catch (error) {
    const { detail, hint } = describeDatabaseFailure(error);
    console.error(`Migration failed. ${detail}`);
    if (hint) console.error(hint);
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
}

main();
