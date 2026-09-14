import { afterEach, describe, expect, it } from "vitest";

import { isAdmin } from "@/lib/auth/admin";

afterEach(() => {
  delete process.env.ADMIN_EMAILS;
});

describe("isAdmin", () => {
  it("denies everyone when ADMIN_EMAILS is unset", () => {
    expect(isAdmin("someone@example.com")).toBe(false);
  });

  it("matches listed emails case-insensitively and ignores spacing", () => {
    process.env.ADMIN_EMAILS = " Owner@Example.com , second@example.com ";
    expect(isAdmin("owner@example.com")).toBe(true);
    expect(isAdmin("SECOND@example.com")).toBe(true);
  });

  it("denies unlisted emails and empty values", () => {
    process.env.ADMIN_EMAILS = "owner@example.com";
    expect(isAdmin("intruder@example.com")).toBe(false);
    expect(isAdmin(null)).toBe(false);
    expect(isAdmin("")).toBe(false);
  });
});
