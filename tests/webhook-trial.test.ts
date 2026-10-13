import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// F1-01: the trial now runs on Ilimitado yearly too. When its card is
// saved, the webhook is the one place that records the sale and sends the
// confirmation, so it has to read the cycle off the subscription: a yearly
// trial reported as monthly is a revenue figure off by six times, and an
// email that quotes "/mes" over the whole year.
//
// Stripe, the database, analytics and the mailer are mocked; what is under
// test is what the handler does with a trialing yearly subscription.

const trackServer = vi.fn();
const sendEmail = vi.fn();

const SUB = {
  id: "sub_1",
  customer: "cus_1",
  status: "trialing",
  start_date: 1_790_000_000,
  trial_end: 1_790_000_000 + 3 * 86_400,
  cancel_at_period_end: false,
  metadata: { user_id: "user_1", plan: "unlimited", locale: "es" },
  items: {
    data: [
      {
        current_period_start: 1_790_000_000,
        current_period_end: 1_790_000_000 + 3 * 86_400,
        price: {
          product: { metadata: {} },
          unit_amount: 17_988,
          recurring: { interval: "year" },
        },
      },
    ],
  },
};

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

vi.mock("@/lib/analytics/server", () => ({ trackServer }));
vi.mock("@/lib/email", () => ({ sendEmail }));

vi.mock("@/lib/billing/stripe", () => ({
  getStripe: () => ({
    webhooks: {
      constructEvent: (body: string) => JSON.parse(body),
    },
    subscriptions: { list: () => Promise.resolve({ data: [SUB] }) },
    customers: {
      retrieve: () => Promise.resolve({ email: "a@b.c", deleted: false }),
    },
  }),
}));

// Every chain the handler builds resolves to the same thing: one row, for
// user_1. That answers the idempotency insert (not a duplicate), the
// update that finds the subscription row, and the event insert.
vi.mock("@/lib/db/client", () => {
  const rows = [{ id: "evt_1", userId: "user_1" }];
  const chain: Record<string, unknown> = {};
  for (const step of [
    "insert",
    "values",
    "onConflictDoNothing",
    "onConflictDoUpdate",
    "update",
    "set",
    "where",
  ]) {
    chain[step] = () => chain;
  }
  chain.returning = () => Promise.resolve(rows);
  chain.then = (resolve: (value: unknown) => void) => resolve(rows);
  return { getDb: () => chain };
});

const { POST } = await import("@/app/api/stripe/webhook/route");

function deliver(event: object) {
  return POST(
    new NextRequest("https://verbalyx.ai/api/stripe/webhook", {
      method: "POST",
      headers: { "stripe-signature": "t=1,v1=x" },
      body: JSON.stringify(event),
    }),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
});

describe("a yearly trial whose card was saved", () => {
  it("is recorded as a yearly trial sale of nothing today", async () => {
    const res = await deliver({
      id: "evt_1",
      type: "setup_intent.succeeded",
      data: { object: { customer: "cus_1" } },
    });
    expect(res.status).toBe(200);

    expect(trackServer).toHaveBeenCalledWith("user_1", "purchase", {
      plan: "unlimited",
      cycle: "yearly",
      amount: 0,
      trial: true,
    });
  });

  it("is confirmed with the whole year as the first charge", async () => {
    await deliver({
      id: "evt_2",
      type: "setup_intent.succeeded",
      data: { object: { customer: "cus_1" } },
    });

    expect(sendEmail).toHaveBeenCalledTimes(1);
    const { subject, react } = sendEmail.mock.calls[0][0];
    expect(subject).toContain("primer cobro");
    const { render } = await import("@react-email/components");
    const body = await render(react);
    expect(body).toContain("US$179,88, el año entero");
    expect(body).not.toContain("/mes");
  });
});
