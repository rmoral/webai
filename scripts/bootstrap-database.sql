-- Verbalyx — bootstrap de la base de datos
--
-- Aplica TODAS las migraciones pendientes de una vez, para arrancar sin
-- terminal: pégalo en Supabase → SQL Editor → Run.
--
-- Además registra cada migración en el journal de Drizzle, para que el
-- workflow "Migrate database" no intente volver a aplicarlas y falle.
-- Solo para una base de datos VACÍA: si ya existen tablas, usa el workflow.
--
-- Generado desde lib/db/migrations/. No editar a mano.

BEGIN;

CREATE SCHEMA IF NOT EXISTS "drizzle";
CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
	id SERIAL PRIMARY KEY,
	hash text NOT NULL,
	created_at bigint
);

-- ───────────── 0000_concerned_toad_men ─────────────

CREATE TYPE "public"."plan" AS ENUM('free', 'pro');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('trialing', 'active', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid', 'paused');--> statement-breakpoint
CREATE TYPE "public"."tool" AS ENUM('humanize', 'detect', 'paraphrase', 'correct');--> statement-breakpoint
CREATE TABLE "detections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"ip_hash" text,
	"ai_probability" real NOT NULL,
	"sentence_scores" jsonb,
	"provider" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tool" "tool" NOT NULL,
	"title" text,
	"input_text" text NOT NULL,
	"output_text" text NOT NULL,
	"mode" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"name" text NOT NULL,
	"props" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"plan" "plan" DEFAULT 'free' NOT NULL,
	"status" "subscription_status",
	"current_period_end" timestamp with time zone,
	"cancel_at_period_end" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "subscriptions_stripe_customer_id_unique" UNIQUE("stripe_customer_id"),
	CONSTRAINT "subscriptions_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
CREATE TABLE "usage_daily" (
	"subject_key" text NOT NULL,
	"user_id" uuid,
	"date" date NOT NULL,
	"tool" "tool" NOT NULL,
	"words_in" integer DEFAULT 0 NOT NULL,
	"words_out" integer DEFAULT 0 NOT NULL,
	"requests" integer DEFAULT 0 NOT NULL,
	"cost_cents" real DEFAULT 0 NOT NULL,
	CONSTRAINT "usage_daily_subject_key_date_tool_pk" PRIMARY KEY("subject_key","date","tool")
);
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"locale" text DEFAULT 'es' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
ALTER TABLE "detections" ADD CONSTRAINT "detections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_daily" ADD CONSTRAINT "usage_daily_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

-- ───────────── 0001_enable_rls ─────────────

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

-- Users can read their own profile and subscription; all writes are server-side.
CREATE POLICY "users_select_own" ON "users"
  FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "subscriptions_select_own" ON "subscriptions"
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "usage_daily_select_own" ON "usage_daily"
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Documents (Pro history): full ownership for the owner.
CREATE POLICY "documents_own" ON "documents"
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "detections_select_own" ON "detections"
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- "events" gets no policies on purpose: internal attribution data,
-- server-only access.

-- ───────────── 0002_brainy_lizard ─────────────

CREATE TABLE "stripe_events" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Server-only table: RLS on, no client policies.
ALTER TABLE "stripe_events" ENABLE ROW LEVEL SECURITY;

-- ───────────── 0003_goofy_lily_hollister ─────────────

ALTER TABLE "subscriptions" ADD COLUMN "interval" text;

-- ───────────── registro de migraciones aplicadas ─────────────

INSERT INTO "drizzle"."__drizzle_migrations" ("hash", "created_at") VALUES
	('eb838454e90fbafecedb693d4b7acd047df7440b59cbaace1b95e62a366af07c', 1788972297036),
	('0cefe8c83d3fc214319417592a8977304e19f791c647f7b3cd89cce656f5a508', 1788973514132),
	('519d136c7e1ac5d1a6d4b5ba8ded6b9446d7b9217b218f8cede6f3aa63127825', 1789057194499),
	('aa703691514151fc2563de549b1953a9376c497efe1c6911ffedd1868ff946be', 1789396473762);

COMMIT;
