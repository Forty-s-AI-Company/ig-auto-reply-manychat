import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireApiUser: vi.fn(),
  getCurrentWorkspaceId: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ requireApiUser: mocks.requireApiUser }));
vi.mock("@/lib/workspaces", () => ({ getCurrentWorkspaceId: mocks.getCurrentWorkspaceId }));

import * as authorizeRoute from "@/app/api/internal/oauth/[provider]/authorize/route";
import * as callbackRoute from "@/app/api/internal/oauth/[provider]/callback/route";

function routeContext(provider: string) {
  return { params: Promise.resolve({ provider }) };
}

describe("SBL-01 internal-only route skeleton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NODE_ENV", "test");
    mocks.requireApiUser.mockResolvedValue({
      user: { id: "user-1", email: "admin@example.com", role: "admin" },
      response: null,
    });
    mocks.getCurrentWorkspaceId.mockResolvedValue("default-workspace");
  });

  it("returns a redacted authorize dry-run payload for an internal sandbox request", async () => {
    const response = await authorizeRoute.GET(
      new Request("http://local.test/api/internal/oauth/meta-business-facebook-sandbox/authorize?transport=popup", {
        headers: { "x-inboxpilot-sandbox": "sbl-01", "x-request-id": "req-route-test" },
      }),
      routeContext("meta-business-facebook-sandbox"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.mode).toBe("dry_run");
    expect(body.provider).toBe("meta-business-facebook-sandbox");
    expect(body.authorize.redactedUrl).toBe("[REDACTED_AUTHORIZE_URL]");
    expect(body.auth.state).toBe("[REDACTED_STATE]");
    expect(body.stateRecord.state).toBe("[REDACTED_STATE]");
    expect(body.stateRecord.nonce).toBe("[REDACTED_NONCE]");
    expect(body.writes.wouldCreateChannel).toBe(false);
  });

  it("returns a redacted callback dry-run payload without code exchange", async () => {
    const response = await callbackRoute.GET(
      new Request("http://local.test/api/internal/oauth/meta-business-instagram-sandbox/callback?code=RAW_CODE&state=RAW_STATE", {
        headers: { "x-inboxpilot-sandbox": "sbl-01", "x-request-id": "req-route-test" },
      }),
      routeContext("meta-business-instagram-sandbox"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.mode).toBe("dry_run");
    expect(body.provider).toBe("meta-business-instagram-sandbox");
    expect(body.auth.code).toBe("[REDACTED_CODE]");
    expect(body.auth.exchangeAttempted).toBe(false);
    expect(body.codeExchange).toMatchObject({ status: "skipped", exchangeAttempted: false, code: "[REDACTED_CODE]" });
    expect(body.dryRunEvidence.mode).toBe("dry_run");
    expect(body.productionWriteGuard.blocked).toBe(true);
    expect(body.productionWriteGuard.attemptedWrites).toEqual([]);
    expect(body.productionWriteGuard.guardedOperations).toContain("channel.create");
  });

  it("blocks requests without the sandbox header", async () => {
    const response = await authorizeRoute.GET(
      new Request("http://local.test/api/internal/oauth/meta-business-facebook-sandbox/authorize"),
      routeContext("meta-business-facebook-sandbox"),
    );
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.errorType).toBe("sandbox_header_required");
  });

  it("blocks unsupported providers before any dry-run payload is created", async () => {
    const response = await authorizeRoute.GET(
      new Request("http://local.test/api/internal/oauth/meta-instagram/authorize", {
        headers: { "x-inboxpilot-sandbox": "sbl-01" },
      }),
      routeContext("meta-instagram"),
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.errorType).toBe("unsupported_provider");
  });

  it("rejects query workspace spoofing", async () => {
    const response = await authorizeRoute.GET(
      new Request("http://local.test/api/internal/oauth/meta-business-facebook-sandbox/authorize?workspaceId=workspace-other", {
        headers: { "x-inboxpilot-sandbox": "sbl-01" },
      }),
      routeContext("meta-business-facebook-sandbox"),
    );
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.errorType).toBe("workspace_spoofing_detected");
  });
});
