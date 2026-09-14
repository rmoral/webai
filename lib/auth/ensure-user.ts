import * as Sentry from "@sentry/nextjs";

import { getDb } from "@/lib/db/client";
import { users } from "@/lib/db/schema";

// Mirrors the Supabase auth user into our `users` table so billing, usage
// and the admin backoffice can join on it. Safe to call on every sign-in.
export async function ensureUserRecord(
  id: string,
  email: string | null | undefined,
): Promise<void> {
  if (!process.env.DATABASE_URL || !email) return;
  try {
    await getDb()
      .insert(users)
      .values({ id, email })
      .onConflictDoUpdate({ target: users.id, set: { email } });
  } catch (error) {
    Sentry.captureException(error);
  }
}
