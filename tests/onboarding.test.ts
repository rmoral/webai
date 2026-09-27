import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render } from "@react-email/components";

import { OnboardingDay2Email, OnboardingDay5Email } from "@/emails/onboarding";
import { WelcomeEmail, welcomeWords } from "@/emails/welcome";
import { optOutToken, verifyOptOutToken } from "@/lib/email/optout";
import { suggestTool } from "@/lib/onboarding/due";
import {
  oneClickUrl,
  optOutUrl,
  unsubscribeHeaders,
} from "@/lib/onboarding/notify";

// The two emails a person is allowed to refuse, and the machinery that makes
// refusing work. Every failure here is quiet and expensive: an unsubscribe
// link that does not unsubscribe is a complaint to the AEPD, and a missing
// List-Unsubscribe header is a domain in the spam folder -- which would take
// the billing notices down with it.

const USER = "11111111-1111-4111-8111-111111111111";
const APP = "https://verbalyx.ai";

// Set here as well as in beforeEach: a describe body runs at collection time,
// before any hook has, and signing a token there would fail.
process.env.IP_HASH_SECRET = "test-secret-for-signing";

beforeEach(() => {
  process.env.IP_HASH_SECRET = "test-secret-for-signing";
});

afterEach(() => {
  delete process.env.IP_HASH_SECRET;
});

describe("the unsubscribe link", () => {
  it("survives a round trip", () => {
    expect(verifyOptOutToken(optOutToken(USER))).toBe(USER);
  });

  it("never expires, because an old email still has to work", () => {
    // Nothing in the token is a timestamp, which is what makes a link found
    // a year later still take somebody off the list. A dead link would leave
    // them no way out but writing to us, which is the friction the law is
    // about.
    expect(optOutToken(USER)).toBe(optOutToken(USER));
    expect(optOutToken(USER)).not.toContain(String(new Date().getFullYear()));
  });

  it("refuses a token that was edited", () => {
    const token = optOutToken(USER);
    const flipped = token.slice(0, -1) + (token.endsWith("a") ? "b" : "a");
    expect(verifyOptOutToken(flipped)).toBeNull();
    // A bare user id is the obvious attempt: opt out anybody you can name.
    expect(verifyOptOutToken(USER)).toBeNull();
    expect(verifyOptOutToken(`${USER}.`)).toBeNull();
    expect(verifyOptOutToken("")).toBeNull();
  });

  it("refuses another user's signature", () => {
    const other = "22222222-2222-4222-8222-222222222222";
    const stolen = optOutToken(other).split(".")[1];
    expect(verifyOptOutToken(`${USER}.${stolen}`)).toBeNull();
  });

  it("refuses everything when the server has no secret", () => {
    delete process.env.IP_HASH_SECRET;
    // Accepting here would opt people out on an unsigned link.
    expect(verifyOptOutToken(`${USER}.anything`)).toBeNull();
  });

  it("points at the page in the reader's language", () => {
    expect(optOutUrl(APP, "es", USER)).toContain("/baja-emails?t=");
    expect(optOutUrl(APP, "en", USER)).toContain("/en/unsubscribe?t=");
  });
});

describe("the write behind the link", () => {
  it("refuses an unsigned token before it reaches the database", async () => {
    // There is no DATABASE_URL here, so a query would throw: the assertion
    // is that it returns false instead, which is only possible if the
    // signature is checked first. Anything else would mean a stranger could
    // opt out anybody whose id they can guess.
    const { applyOptOut } = await import("@/lib/email/unsubscribe");
    await expect(applyOptOut("not-a-token")).resolves.toBe(false);
    await expect(applyOptOut(USER)).resolves.toBe(false);
  });
});

describe("what the mailbox providers are told", () => {
  it("offers one-click, not just a link", () => {
    const headers = unsubscribeHeaders(oneClickUrl(APP, "es", USER));
    // Without the Post header the URL is read as a link and the one-click
    // requirement is simply unmet.
    expect(headers["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
    expect(headers["List-Unsubscribe"]).toMatch(/^<https:\/\/[^>]+>, <mailto:/);
  });

  it("gives them the endpoint that accepts a POST, not the page", () => {
    const url = oneClickUrl(APP, "es", USER);
    expect(url).toContain("/api/email/unsubscribe?t=");
    // Same signed token as the visible link: two URLs, one grant.
    const token = decodeURIComponent(new URL(url).searchParams.get("t") ?? "");
    expect(verifyOptOutToken(token)).toBe(USER);
  });
});

describe("which emails may be refused", () => {
  const optOut = optOutUrl(APP, "es", USER);

  it("the onboarding ones say how to stop them", async () => {
    for (const html of [
      await render(
        OnboardingDay2Email({
          appUrl: APP,
          locale: "es",
          tool: "humanize",
          optOutHref: optOut,
        }),
      ),
      await render(
        OnboardingDay5Email({
          appUrl: APP,
          locale: "es",
          words: "1.234",
          freeWords: "500",
          proMonth: "60.000",
          proRequest: "3.000",
          proAmount: "9,99 US$",
          optOutHref: optOut,
        }),
      ),
    ]) {
      expect(html).toContain("baja-emails");
    }
  });

  it("a transactional one does not", async () => {
    // The day this stops being true is the day somebody unsubscribes from
    // being told they are about to be charged.
    const html = await render(
      WelcomeEmail({
        appUrl: APP,
        locale: "es",
        words: welcomeWords((n: number) => String(n)),
      }),
    );
    expect(html).not.toContain("baja-emails");
  });

  it("names the tool it suggests and links to it", async () => {
    const html = await render(
      OnboardingDay2Email({
        appUrl: APP,
        locale: "es",
        tool: "detect",
        optOutHref: optOut,
      }),
    );
    expect(html).toContain("/detector-de-ia");
    // And it does not quietly point at the humaniser instead.
    expect(html).not.toContain("/humanizador-de-texto-ia");
  });

  it("quotes the figures it was given rather than any of its own", async () => {
    const html = await render(
      OnboardingDay5Email({
        appUrl: APP,
        locale: "es",
        words: "1.234",
        freeWords: "500",
        proMonth: "60.000",
        proRequest: "3.000",
        proAmount: "9,99 US$",
        optOutHref: optOut,
      }),
    );
    for (const figure of ["1.234", "500", "60.000", "3.000", "9,99"]) {
      expect(html).toContain(figure);
    }
  });
});

describe("which tool the day-2 email suggests", () => {
  it("leads with the humaniser for an account that has done nothing", () => {
    expect(suggestTool(["humanize", "detect", "paraphrase", "correct"])).toBe(
      "humanize",
    );
  });

  it("sends somebody who humanised already somewhere new", () => {
    expect(suggestTool(["detect", "paraphrase", "correct"])).toBe("detect");
  });

  it("says nothing to somebody who has tried everything", () => {
    // They are activated. A mail telling them to try what they have tried is
    // the one that gets us unsubscribed.
    expect(suggestTool([])).toBeNull();
  });
});
