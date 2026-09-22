import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// What happens to the Stripe subscription when the request fails *after*
// creating it. Everything a live Stripe account would answer is mocked;
// what is under test is the order of the two writes and the undo between
// them, which is the part that strands a customer.

const insert = vi.fn();
const undoSubscription = vi.fn();
const createSubscription = vi.fn();

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));

vi.mock("@/lib/auth/server", () => ({
  getSession: () => Promise.resolve({ id: "user_1", email: "a@b.c" }),
}));

vi.mock("@/lib/usage/quotas", () => ({
  checkBurstLimit: () => Promise.resolve({ allowed: true }),
}));

vi.mock("@/lib/db/client", () => ({
  getDb: () => ({ insert: () => ({ values: insert }) }),
}));

vi.mock("@/lib/billing/subscribe", async () => {
  const actual = await vi.importActual<
    typeof import("@/lib/billing/subscribe")
  >("@/lib/billing/subscribe");
  return {
    ...actual,
    ensureCustomer: () => Promise.resolve("cus_1"),
    hasLiveSubscription: () => Promise.resolve(false),
    createSubscription,
    undoSubscription,
  };
});

const { POST } = await import("@/app/api/billing/subscribe/route");

function post() {
  return POST(
    new NextRequest("https://verbalyx.ai/api/billing/subscribe", {
      method: "POST",
      body: JSON.stringify({
        plan: "unlimited",
        cycle: "monthly",
        locale: "es",
        consent: true,
      }),
    }),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.IP_HASH_SECRET = "dGVzdC1zZWNyZXQtZm9yLXVuaXQtdGVzdHM=";
  createSubscription.mockResolvedValue({
    clientSecret: "seti_1_secret_x",
    mode: "setup",
    subscriptionId: "sub_1",
    amountTodayCents: 0,
    amountNextCents: 2999,
    nextChargeAt: new Date("2026-09-25T00:00:00Z"),
    trialDays: 3,
  });
});

describe("POST /api/billing/subscribe", () => {
  it("takes the subscription back when the consent row cannot be written", async () => {
    // A trial subscription is live the moment it exists. Left behind, the
    // webhook writes it to our table and every later attempt is refused as
    // `already_subscribed` -- an account locked out without ever having
    // entered a card.
    insert.mockRejectedValue(new Error("relation does not exist"));

    const response = await post();

    expect(response.status).toBe(500);
    expect(undoSubscription).toHaveBeenCalledWith("sub_1");
  });

  it("keeps it when the row is written", async () => {
    insert.mockResolvedValue(undefined);

    const response = await post();

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      clientSecret: "seti_1_secret_x",
      mode: "setup",
      trialDays: 3,
    });
    expect(undoSubscription).not.toHaveBeenCalled();
  });
});
