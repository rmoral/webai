CREATE TABLE "billing_consents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"accepted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_hash" text,
	"user_agent" text,
	"terms_version" text NOT NULL,
	"plan" "plan" NOT NULL,
	"interval" text NOT NULL,
	"amount_today_cents" integer NOT NULL,
	"amount_next_cents" integer NOT NULL,
	"next_charge_at" timestamp with time zone,
	"stripe_subscription_id" text,
	"locale" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "trial_end" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "trial_reminder_sent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "billing_consents" ADD CONSTRAINT "billing_consents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

-- Deny by default, like every other table (see 0001_enable_rls.sql). The
-- consent log gets no policy at all: it is written by the server before a
-- payment is confirmed and read only when a charge is disputed. Nothing
-- reaching Postgres as the anon or authenticated role has any business
-- with it -- not even the owner of the row, who would otherwise be able to
-- read the evidence about their own dispute.
ALTER TABLE "billing_consents" ENABLE ROW LEVEL SECURITY;
