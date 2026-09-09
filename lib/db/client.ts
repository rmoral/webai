import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

// Server-only. Uses the pooled Supabase connection string (DATABASE_URL).
const globalForDb = globalThis as unknown as {
  dbClient?: ReturnType<typeof postgres>;
};

function getConnection() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  // Supabase transaction pooler does not support prepared statements.
  globalForDb.dbClient ??= postgres(url, { prepare: false });
  return globalForDb.dbClient;
}

export function getDb() {
  return drizzle(getConnection(), { schema });
}

export type Db = ReturnType<typeof getDb>;
