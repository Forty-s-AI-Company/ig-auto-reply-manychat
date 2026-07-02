import { describe, expect, it } from "vitest";
import { getAuthenticatedRouteSmokeGuard } from "./e2e/authenticated-route-smoke-guard";

describe("authenticated route smoke guard", () => {
  it("requires TEST_DATABASE_URL", () => {
    const guard = getAuthenticatedRouteSmokeGuard({});

    expect(guard.shouldSkip).toBe(true);
    expect(guard.reason).toMatch(/TEST_DATABASE_URL/);
  });

  it("refuses the production Supabase project ref", () => {
    const guard = getAuthenticatedRouteSmokeGuard({
      TEST_DATABASE_URL: "postgresql://postgres:secret@db.lmwvzskffzozuiamjxvc.supabase.co:5432/postgres",
      INBOXPILOT_DB_ENV: "staging",
    });

    expect(guard.shouldSkip).toBe(true);
    expect(guard.reason).toMatch(/production database/);
  });

  it("refuses explicit production DB env marker", () => {
    const guard = getAuthenticatedRouteSmokeGuard({
      TEST_DATABASE_URL: "postgresql://inboxpilot:inboxpilot@localhost:5432/inboxpilot_ci",
      INBOXPILOT_DB_ENV: "production",
    });

    expect(guard.shouldSkip).toBe(true);
    expect(guard.reason).toMatch(/production database/);
  });

  it("allows non-production TEST_DATABASE_URL", () => {
    const guard = getAuthenticatedRouteSmokeGuard({
      TEST_DATABASE_URL: "postgresql://inboxpilot:inboxpilot@localhost:5432/inboxpilot_ci",
      INBOXPILOT_DB_ENV: "test",
    });

    expect(guard.shouldSkip).toBe(false);
  });
});
