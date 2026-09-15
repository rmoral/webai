import { afterEach, describe, expect, it } from "vitest";

import { isAdmin } from "@/lib/auth/admin";
import { databaseTarget } from "@/lib/config/health";

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

describe("databaseTarget", () => {
  const original = process.env.DATABASE_URL;
  afterEach(() => {
    if (original === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = original;
  });

  function target(url: string | undefined) {
    if (url === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = url;
    return databaseTarget();
  }

  it("accepts the session pooler string", () => {
    const t = target(
      "postgresql://postgres.abc:s3cret@aws-0-eu-west-3.pooler.supabase.com:5432/postgres",
    );
    expect(t.problem).toBeNull();
    expect(t.endpoint).toBe("aws-0-eu-west-3.pooler.supabase.com:5432");
  });

  it("names the direct connection, which Vercel cannot reach", () => {
    const t = target(
      "postgresql://postgres:s3cret@db.abc.supabase.co:5432/postgres",
    );
    expect(t.problem).toMatch(/IPv6/);
  });

  it("warns about the transaction pooler, which cannot run migrations", () => {
    const t = target(
      "postgresql://postgres.abc:s3cret@aws-0-eu-west-3.pooler.supabase.com:6543/postgres",
    );
    expect(t.problem).toMatch(/transaction pooler/);
  });

  it("catches the placeholder password left in place", () => {
    const t = target(
      "postgresql://postgres.abc:[YOUR-PASSWORD]@aws-0-eu-west-3.pooler.supabase.com:5432/postgres",
    );
    expect(t.problem).toMatch(/YOUR-PASSWORD/);
  });

  it("never reveals the password", () => {
    for (const url of [
      "postgresql://postgres.abc:s3cret@db.abc.supabase.co:5432/postgres",
      "postgresql://postgres.abc:s3cret@aws-0-eu-west-3.pooler.supabase.com:6543/postgres",
    ]) {
      const t = target(url);
      expect(JSON.stringify(t)).not.toContain("s3cret");
    }
  });

  it("reports a missing or unparseable value instead of throwing", () => {
    expect(target(undefined).problem).toMatch(/No está definida/);
    expect(target("not a url").endpoint).toBeNull();
  });
});
