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
  /**
   * When the welcome email went out, and the lock that keeps it to one.
   *
   * A magic link is the same link every time, so nothing in the callback
   * can tell a first sign-in from a later one on its own. Claiming this
   * column is what decides it, and the claim is a conditional update: two
   * tabs finishing at once, or Supabase replaying the callback, leaves one
   * winner and one no-op.
   */
  welcomeSentAt: timestamp("welcome_sent_at", { withTimezone: true }),
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
  /**
   * End of the free trial, mirrored from Stripe.
   *
   * Two things read it and neither can ask Stripe on the hot path: the
   * end-of-trial wall, which has to appear before the charge and not after,
   * and the 24-hour reminder cron. Stripe's own trial_will_end fires three
   * days out, which on a three-day trial is the moment it starts.
   */
  trialEnd: timestamp("trial_end", { withTimezone: true }),
  /** Set when the 24-hour reminder went out, so the cron cannot send twice. */
  trialReminderSentAt: timestamp("trial_reminder_sent_at", {
    withTimezone: true,
  }),
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

/**
 * What the customer was shown at the moment they agreed to be charged.
 *
 * This is the record that answers a chargeback: the date, the exact amount
 * due today, the date and amount of the first recurring charge, and the
 * version of the terms on screen. Written before the payment is confirmed,
 * because a consent recorded after the fact proves nothing.
 *
 * The IP is stored hashed (lib/security/crypto.ts). CLAUDE.md forbids
 * persisting one in the clear anywhere, and a hash still shows that a
 * disputed charge came from the same address as the session.
 */
export const billingConsents = pgTable("billing_consents", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  acceptedAt: timestamp("accepted_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  ipHash: text("ip_hash"),
  userAgent: text("user_agent"),
  termsVersion: text("terms_version").notNull(),
  plan: planEnum("plan").notNull(),
  interval: text("interval").notNull(),
  /** Charged today, in cents. Zero when a trial starts. */
  amountTodayCents: integer("amount_today_cents").notNull(),
  /** Amount of the first recurring charge, in cents. */
  amountNextCents: integer("amount_next_cents").notNull(),
  nextChargeAt: timestamp("next_charge_at", { withTimezone: true }),
  stripeSubscriptionId: text("stripe_subscription_id"),
  /** The language the disclosure was read in. */
  locale: text("locale").notNull(),
});
