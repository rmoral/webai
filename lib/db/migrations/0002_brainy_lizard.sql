CREATE TABLE "stripe_events" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

--> statement-breakpoint
-- Server-only table: RLS on, no client policies.
ALTER TABLE "stripe_events" ENABLE ROW LEVEL SECURITY;
