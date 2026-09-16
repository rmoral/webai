import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

// Server-only. Uses the pooled Supabase connection string (DATABASE_URL).
const globalForDb = globalThis as unknown as {
  dbClient?: ReturnType<typeof postgres>;
};

/**
 * postgres-js opens a plaintext connection when the string carries no
 * sslmode, and Supabase's pooler answers that with ESSLREQUIRED. Beyond
 * the error: a remote database means credentials and user rows crossing
 * the public internet, so TLS is not optional there. A local database is
 * the one case that legitimately has no certificate.
 *
 * An explicit sslmode in the string wins, so a stricter `verify-full` is
 * never quietly downgraded to `require`.
 */
export function sslFor(
  url: string,
): { ssl: "require" } | Record<string, never> {
  let host: string;
  try {
    const parsed = new URL(url);
    if (parsed.searchParams.has("sslmode")) return {};
    host = parsed.hostname;
  } catch {
    // Unparseable: leave it to postgres-js, whose error names the problem.
    return {};
  }
  const local = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(host);
  return local ? {} : { ssl: "require" };
}

function getConnection() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  // Supabase transaction pooler does not support prepared statements.
  globalForDb.dbClient ??= postgres(url, { prepare: false, ...sslFor(url) });
  return globalForDb.dbClient;
}

export function getDb() {
  return drizzle(getConnection(), { schema });
}

export type Db = ReturnType<typeof getDb>;
