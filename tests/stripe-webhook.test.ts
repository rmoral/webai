import Stripe from "stripe";
import { describe, expect, it } from "vitest";

// Signature verification is the security boundary of the webhook, and it
// can be exercised without any Stripe credentials: the SDK can both sign
// and verify a payload locally.

const SECRET = "whsec_test_secret_for_unit_tests";
const stripe = new Stripe("sk_test_placeholder");

function sign(payload: string, secret = SECRET, timestamp?: number) {
  return stripe.webhooks.generateTestHeaderString({
    payload,
    secret,
    ...(timestamp ? { timestamp } : {}),
  });
}

const payload = JSON.stringify({
  id: "evt_test_1",
  object: "event",
  type: "checkout.session.completed",
  data: { object: { id: "cs_test_1", mode: "subscription" } },
});

describe("stripe webhook signature", () => {
  it("accepts a correctly signed payload", () => {
    const event = stripe.webhooks.constructEvent(
      payload,
      sign(payload),
      SECRET,
    );
    expect(event.id).toBe("evt_test_1");
    expect(event.type).toBe("checkout.session.completed");
  });

  it("rejects a payload signed with another secret", () => {
    expect(() =>
      stripe.webhooks.constructEvent(
        payload,
        sign(payload, "whsec_wrong"),
        SECRET,
      ),
    ).toThrow();
  });

  it("rejects a tampered payload under a valid signature", () => {
    const header = sign(payload);
    const tampered = payload.replace("evt_test_1", "evt_test_2");
    expect(() =>
      stripe.webhooks.constructEvent(tampered, header, SECRET),
    ).toThrow();
  });

  it("rejects a replayed signature outside the tolerance window", () => {
    const old = Math.floor(Date.now() / 1000) - 60 * 60;
    expect(() =>
      stripe.webhooks.constructEvent(
        payload,
        sign(payload, SECRET, old),
        SECRET,
        300,
      ),
    ).toThrow();
  });
});
