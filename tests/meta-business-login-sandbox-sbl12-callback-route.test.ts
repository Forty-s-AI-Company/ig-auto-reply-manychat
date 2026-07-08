import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createSandboxCallbackCaptureState } from "@/lib/meta-business-sandbox-callback-capture";

const mocks = vi.hoisted(() => ({
  cookieGet: vi.fn(),
  cookieDelete: vi.fn(),
  readPopupState: vi.fn(),
  clearPopupState: vi.fn(),
  getDefaultWorkspaceId: vi.fn(),
  getCurrentUser: vi.fn(),
  recordAuditEvent: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: mocks.cookieGet,
    delete: mocks.cookieDelete,
  })),
}));

vi.mock("@/lib/oauth/state", () => ({
  readPopupState: mocks.readPopupState,
  clearPopupState: mocks.clearPopupState,
}));

vi.mock("@/lib/workspaces", () => ({
  getDefaultWorkspaceId: mocks.getDefaultWorkspaceId,
}));

vi.mock("@/lib/auth", () => ({
  getCurrentUser: mocks.getCurrentUser,
}));

vi.mock("@/lib/audit", () => ({
  recordAuditEvent: mocks.recordAuditEvent,
}));

describe("SBL-12 production callback sandbox capture guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.stubEnv("APP_URL", "https://inboxpilot.example.test");
    vi.stubEnv("META_INSTAGRAM_APP_ID", "instagram-app-id");
    vi.stubEnv("META_INSTAGRAM_APP_SECRET", "instagram-app-secret");
    mocks.cookieGet.mockImplementation((name: string) => {
      if (name === "meta_oauth_workspace") return { value: "default-workspace" };
      if (name === "meta_oauth_mode") return { value: "instagram" };
      return undefined;
    });
    mocks.readPopupState.mockResolvedValue({});
    mocks.getDefaultWorkspaceId.mockResolvedValue("default-workspace");
    mocks.getCurrentUser.mockResolvedValue(null);
  });

  it("does not log the raw OAuth callback URL in Instagram debug context", () => {
    const source = readFileSync("src/app/api/meta/oauth/callback/route.ts", "utf8");

    expect(source).not.toContain("requestUrl: request.url");
    expect(source).toContain("requestPath:");
    expect(source).toContain("queryKeys:");
    expect(source).not.toContain("appSecretFingerprint");
  });

  it("returns redacted sandbox evidence before state validation, token exchange, or production writes", async () => {
    const { GET } = await import("@/app/api/meta/oauth/callback/route");
    const state = createSandboxCallbackCaptureState({
      providerId: "meta-business-instagram-sandbox",
      workspaceId: "default-workspace",
      requestId: "req-route-capture",
    });
    const request = new Request(
      `https://inboxpilot.example.test/api/instagram/oauth/callback?code=RAW_CODE&state=${encodeURIComponent(state)}`,
      { headers: { "x-request-id": "req-route-header" } },
    );

    const response = await GET(request);
    const body = await response.json();
    const serialized = JSON.stringify(body);

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(body.status).toBe("success");
    expect(body.mode).toBe("sandbox_callback_capture");
    expect(body.code).toBe("[REDACTED_CODE]");
    expect(body.state).toBe("[REDACTED_STATE]");
    expect(body.callbackUrl).toBe("[REDACTED_CALLBACK_URL]");
    expect(body.exchangeAttempted).toBe(false);
    expect(Object.values(body.productionWrites).every((value) => value === false)).toBe(true);
    expect(serialized).not.toContain("RAW_CODE");
    expect(serialized).not.toContain(state);
    expect(serialized).not.toContain("inboxpilot.example.test/api/instagram/oauth/callback");
    expect(mocks.recordAuditEvent).not.toHaveBeenCalled();
  });

  it("keeps the existing invalid-state redirect path for non-sandbox callbacks", async () => {
    const { GET } = await import("@/app/api/meta/oauth/callback/route");
    const request = new Request(
      "https://inboxpilot.example.test/api/instagram/oauth/callback?code=RAW_CODE&state=regular-oauth-state",
    );

    const response = await GET(request);

    expect(response.status).toBe(307);
    const location = response.headers.get("location") || "";
    const redirectUrl = new URL(location);
    expect(redirectUrl.pathname).toBe("/channels/connect/social");
    expect(redirectUrl.searchParams.get("meta_error_code")).toBe("invalid_state");
    expect(redirectUrl.searchParams.get("meta_error")).toContain("登入驗證已失效");
    expect(mocks.recordAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "oauth_callback_failed",
        metadata: expect.objectContaining({ reason: "invalid_state" }),
      }),
    );
  });

  it("surfaces Instagram token exchange error_message in popup mode instead of falling back to a raw generic error", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error_type: "OAuthException", error_message: "Invalid redirect_uri" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      }),
    );

    mocks.cookieGet.mockImplementation((name: string) => {
      if (name === "meta_oauth_workspace") return { value: "default-workspace" };
      if (name === "meta_oauth_mode") return { value: "instagram" };
      if (name === "meta_oauth_state") return { value: "expected-state" };
      return undefined;
    });
    mocks.readPopupState.mockResolvedValue({ provider: "meta-instagram", transport: "popup" });
    mocks.clearPopupState.mockResolvedValue(undefined);
    mocks.getCurrentUser.mockResolvedValue({ id: "user-reviewer" });

    const { GET } = await import("@/app/api/meta/oauth/callback/route");
    const request = new Request(
      "https://inboxpilot.example.test/api/instagram/oauth/callback?code=RAW_CODE&state=expected-state",
    );

    const response = await GET(request);

    expect(response.status).toBe(307);
    const location = response.headers.get("location") || "";
    expect(location).toContain("/oauth/popup/callback");
    expect(location).toContain("provider=meta-instagram");
    expect(location).toContain("message=Invalid+redirect_uri");
    expect(decodeURIComponent(location)).not.toContain("Instagram OAuth request failed.");
    expect(mocks.recordAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "oauth_callback_failed",
        success: false,
        metadata: expect.objectContaining({
          provider: "meta-instagram",
          reason: "Invalid redirect_uri",
        }),
      }),
    );
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
