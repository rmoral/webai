-- Row Level Security: deny-by-default for the Supabase anon/authenticated
-- roles. The app's server connection (DATABASE_URL) and the service role
-- bypass RLS; every server-side authorization check goes through
-- lib/billing/entitlements.ts instead.

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "usage_daily" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "detections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

-- Users can read their own profile and subscription; all writes are server-side.
CREATE POLICY "users_select_own" ON "users"
  FOR SELECT TO authenticated USING (id = auth.uid());
--> statement-breakpoint
CREATE POLICY "subscriptions_select_own" ON "subscriptions"
  FOR SELECT TO authenticated USING (user_id = auth.uid());
--> statement-breakpoint
CREATE POLICY "usage_daily_select_own" ON "usage_daily"
  FOR SELECT TO authenticated USING (user_id = auth.uid());
--> statement-breakpoint

-- Documents (Pro history): full ownership for the owner.
CREATE POLICY "documents_own" ON "documents"
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
--> statement-breakpoint
CREATE POLICY "detections_select_own" ON "detections"
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- "events" gets no policies on purpose: internal attribution data,
-- server-only access.
