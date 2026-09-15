import {
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const planEnum = pgEnum("plan", ["free", "pro", "unlimited"]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "trialing",
  "active",
  "past_due",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "unpaid",
  "paused",
]);

export const toolEnum = pgEnum("tool", [
  "humanize",
  "detect",
  "paraphrase",
  "correct",
]);

// Mirrors Supabase auth.users (id comes from Supabase Auth).
export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  locale: text("locale").notNull().default("es"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  stripeCustomerId: text("stripe_customer_id").unique(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  plan: planEnum("plan").notNull().default("free"),
  status: subscriptionStatusEnum("status"),
  /** Billing interval: "month" | "year". Needed to compute MRR. */
  interval: text("interval"),
  /**
   * Entitlements resolved from the Stripe product metadata at webhook time.
   * Read by lib/billing/entitlements.ts so limits can change in Stripe
   * without a deploy and without calling Stripe on every request.
   */
  entitlements: jsonb("entitlements"),
  /** Anchors the monthly word quota to the billing period. */
  currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
  /** Purchased words that never expire; consumed after the monthly quota. */
  topupWords: integer("topup_words").notNull().default(0),
  /** Set on a chargeback: access drops to free until cleared by hand. */
  suspendedAt: timestamp("suspended_at", { withTimezone: true }),
  /** When the subscription was cancelled, for the win-back campaign. */
  canceledAt: timestamp("canceled_at", { withTimezone: true }),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  cancelAtPeriodEnd: integer("cancel_at_period_end").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// One row per user (or anonymous ip hash) per day per tool.
export const usageDaily = pgTable(
  "usage_daily",
  {
    // Exactly one of userId / ipHash is set; subjectKey is user id or ip hash.
    subjectKey: text("subject_key").notNull(),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    date: date("date").notNull(),
    tool: toolEnum("tool").notNull(),
    wordsIn: integer("words_in").notNull().default(0),
    wordsOut: integer("words_out").notNull().default(0),
    requests: integer("requests").notNull().default(0),
    costCents: real("cost_cents").notNull().default(0),
  },
  (table) => [
    primaryKey({ columns: [table.subjectKey, table.date, table.tool] }),
  ],
);

// Saved documents. Pro plan only — never persist free/anonymous text.
export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tool: toolEnum("tool").notNull(),
  title: text("title"),
  inputText: text("input_text").notNull(),
  outputText: text("output_text").notNull(),
  mode: text("mode"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const detections = pgTable("detections", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  ipHash: text("ip_hash"),
  aiProbability: real("ai_probability").notNull(),
  sentenceScores: jsonb("sentence_scores"),
  provider: text("provider").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Processed Stripe webhook event ids, for idempotency.
export const stripeEvents = pgTable("stripe_events", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Minimal mirror of PostHog events for Ads conversion attribution (gclid).
export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  props: jsonb("props"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
