import { beforeAll, describe, expect, it } from "vitest";

import {
  anonymousSubject,
  decryptText,
  encryptText,
  hashIp,
  quotaNetwork,
} from "@/lib/security/crypto";
import {
  aiToolRequestSchema,
  countWords,
  MAX_INPUT_CHARS,
  safeNext,
  truncateToWords,
} from "@/lib/security/validation";

beforeAll(() => {
  process.env.DATA_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
  process.env.IP_HASH_SECRET = "test-secret";
});

describe("encryptText / decryptText", () => {
  it("round-trips text", () => {
    const plain = "Texto confidencial con acentos: ñ, á, 中文";
    expect(decryptText(encryptText(plain))).toBe(plain);
  });

  it("produces different ciphertext each time (random IV)", () => {
    expect(encryptText("hola")).not.toBe(encryptText("hola"));
  });

  it("rejects tampered payloads", () => {
    const payload = encryptText("hola");
    const tampered = payload.slice(0, -2) + "AA";
    expect(() => decryptText(tampered)).toThrow();
  });
});

describe("hashIp", () => {
  it("is deterministic and does not contain the IP", () => {
    const hash = hashIp("203.0.113.7");
    expect(hash).toBe(hashIp("203.0.113.7"));
    expect(hash).not.toContain("203");
  });
});

describe("anonymous quota subjects", () => {
  it("keeps an IPv4 address whole", () => {
    expect(quotaNetwork("203.0.113.7")).toBe("203.0.113.7");
    expect(quotaNetwork("::ffff:203.0.113.7")).toBe("203.0.113.7");
  });

  it("keys IPv6 by its /64, so rotating privacy addresses are one visitor", () => {
    const a = "2001:db8:85a3:12:a1b2:c3d4:e5f6:1";
    const b = "2001:0db8:85a3:0012:9999:8888:7777:2";
    expect(quotaNetwork(a)).toBe("2001:db8:85a3:12::/64");
    expect(quotaNetwork(b)).toBe(quotaNetwork(a));
    expect(anonymousSubject(a)).toBe(anonymousSubject(b));
    // Compressed forms expand before the cut.
    expect(quotaNetwork("2001:db8::1")).toBe("2001:db8:0:0::/64");
    // Another /64 is another visitor.
    expect(anonymousSubject("2001:db8:85a3:13::1")).not.toBe(
      anonymousSubject(a),
    );
  });

  it("never carries the address in clear", () => {
    expect(anonymousSubject("203.0.113.7")).toMatch(/^ip:/);
    expect(anonymousSubject("203.0.113.7")).not.toContain("203");
  });
});

describe("aiToolRequestSchema", () => {
  it("accepts a valid request", () => {
    const result = aiToolRequestSchema.safeParse({
      tool: "humanize",
      text: "Un texto cualquiera",
      mode: "neutro",
    });
    expect(result.success).toBe(true);
  });

  it("rejects unknown tools and invalid modes", () => {
    expect(
      aiToolRequestSchema.safeParse({ tool: "summarize", text: "x" }).success,
    ).toBe(false);
    expect(
      aiToolRequestSchema.safeParse({
        tool: "detect",
        text: "x",
        mode: "academico",
      }).success,
    ).toBe(false);
  });

  it("rejects oversized and empty input", () => {
    expect(
      aiToolRequestSchema.safeParse({
        tool: "correct",
        text: "a".repeat(MAX_INPUT_CHARS + 1),
      }).success,
    ).toBe(false);
    expect(
      aiToolRequestSchema.safeParse({ tool: "correct", text: "   " }).success,
    ).toBe(false);
  });
});

describe("countWords", () => {
  it("counts words across whitespace", () => {
    expect(countWords("  hola   mundo\ncruel ")).toBe(3);
    expect(countWords("")).toBe(0);
  });
});

describe("truncateToWords", () => {
  const text = "Uno dos tres   cuatro\ncinco\tseis siete ocho nueve diez";

  it("keeps exactly the number of words the notice promises", () => {
    // Wall A tells the reader "we processed the first 300 words of the 812
    // you pasted". Both figures come from countWords, so the cut has to
    // agree with it or the sentence is a lie about what the model saw.
    for (const n of [1, 3, 7, 10]) {
      expect(countWords(truncateToWords(text, n))).toBe(n);
    }
  });

  it("cuts at the end of the last kept word", () => {
    expect(truncateToWords(text, 3)).toBe("Uno dos tres");
    // Irregular whitespace before the cut is preserved; the editor renders
    // this same prefix underneath the textarea, so a collapsed run of
    // spaces would misalign the dimmed overflow against the real text.
    expect(truncateToWords(text, 4)).toBe("Uno dos tres   cuatro");
  });

  it("returns the text untouched when it is within the limit", () => {
    expect(truncateToWords(text, 10)).toBe(text);
    expect(truncateToWords(text, 50)).toBe(text);
    expect(truncateToWords("", 5)).toBe("");
  });

  it("keeps nothing when the limit is zero", () => {
    expect(truncateToWords(text, 0)).toBe("");
  });
});

describe("safeNext", () => {
  it("keeps an internal path, query and all", () => {
    // This is the whole point of C2: the plan chosen on the pricing page
    // has to survive the round trip through the sign-up form.
    expect(safeNext("/pago?plan=unlimited&cycle=yearly")).toBe(
      "/pago?plan=unlimited&cycle=yearly",
    );
    expect(safeNext("/en/checkout?plan=pro&cycle=monthly")).toBe(
      "/en/checkout?plan=pro&cycle=monthly",
    );
  });

  it("refuses anything that leaves the site", () => {
    // A protocol-relative URL starts with a slash and is another origin:
    // a sign-in form on our domain that hands the visitor to theirs.
    for (const hostile of [
      "https://evil.example/login",
      "//evil.example",
      "/\\evil.example",
      "javascript:alert(1)",
      "evil.example",
    ]) {
      expect(safeNext(hostile)).toBe("/app");
    }
  });

  it("refuses whitespace, control characters and absurd lengths", () => {
    expect(safeNext("/app\r\nLocation: https://evil.example")).toBe("/app");
    expect(safeNext("/app con espacio")).toBe("/app");
    expect(safeNext(`/${"a".repeat(600)}`)).toBe("/app");
  });

  it("falls back when there is nothing to honour", () => {
    expect(safeNext(null)).toBe("/app");
    expect(safeNext(undefined)).toBe("/app");
    expect(safeNext("")).toBe("/app");
    // The caller decides the fallback: a redirect with no destination is
    // how the checkout page asks for "no next at all".
    expect(safeNext("//evil.example", "")).toBe("");
  });
});
