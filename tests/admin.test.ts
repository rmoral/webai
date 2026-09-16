import { afterEach, describe, expect, it } from "vitest";

import { isAdmin } from "@/lib/auth/admin";
import { databaseTarget, describeDatabaseFailure } from "@/lib/config/health";

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

describe("describeDatabaseFailure", () => {
  it("unwraps the driver error Drizzle hides in `cause`", () => {
    // Drizzle's own message is the SQL it tried, which diagnoses nothing.
    const driver = Object.assign(
      new Error('relation "subscriptions" does not exist'),
      { code: "42P01" },
    );
    const wrapped = new Error("Failed query: select … params: pro,unlimited", {
      cause: driver,
    });

    const { detail, hint } = describeDatabaseFailure(wrapped);
    expect(detail).toBe('42P01: relation "subscriptions" does not exist');
    expect(hint).toMatch(/migraciones/);
  });

  it("turns a wrong password into the action that fixes it", () => {
    const e = Object.assign(new Error("password authentication failed"), {
      code: "28P01",
    });
    expect(describeDatabaseFailure(e).hint).toMatch(/Contraseña/);
  });

  it("reports an unknown code without inventing advice", () => {
    const e = Object.assign(new Error("something odd"), { code: "99999" });
    const { detail, hint } = describeDatabaseFailure(e);
    expect(detail).toBe("99999: something odd");
    expect(hint).toBeNull();
  });

  it("strips credentials if the driver ever quotes the URL", () => {
    const e = new Error(
      "connect ECONNREFUSED postgresql://postgres.abc:s3cret@host:5432/postgres",
    );
    expect(describeDatabaseFailure(e).detail).not.toContain("s3cret");
  });

  it("survives a cyclic cause chain and a non-Error throw", () => {
    const a = new Error("a");
    a.cause = a;
    expect(describeDatabaseFailure(a).detail).toBe("a");
    expect(describeDatabaseFailure("plain string").detail).toBe("plain string");
  });
});
