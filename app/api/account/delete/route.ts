import { createClient as createAdminClient } from "@supabase/supabase-js";
import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { createClient, getSession } from "@/lib/auth/server";
import { getStripe } from "@/lib/billing/stripe";
import { getDb } from "@/lib/db/client";
import { subscriptions, users } from "@/lib/db/schema";

// GDPR: erases the account, its subscription and every row that belongs to
// it (FKs cascade from `users`). Irreversible.
export async function POST() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  try {
    const db = getDb();

    const [subscription] = await db
      .select({ id: subscriptions.stripeSubscriptionId })
      .from(subscriptions)
      .where(eq(subscriptions.userId, user.id))
      .limit(1);

    if (subscription?.id && process.env.STRIPE_SECRET_KEY) {
      await getStripe().subscriptions.cancel(subscription.id);
    }

    await db.delete(users).where(eq(users.id, user.id));

    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      { auth: { persistSession: false } },
    );
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw error;

    await (await createClient()).auth.signOut();
    return NextResponse.json({ deleted: true });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
}
