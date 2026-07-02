import { describe, expect, it, vi } from "vitest";
import { exchangeSandboxAuthorizationCode } from "@/lib/meta-business-sandbox-code-exchange";
import { assertSbl09Redacted } from "./helpers/sbl09-redaction";

describe("SBL-04 Meta Business Login sandbox code exchange helper", () => {
  it("skips token exchange by default and redacts the authorization code", async () => {
    const result = await exchangeSandboxAuthorizationCode({
      providerId: "meta-business-facebook-sandbox",
      code: "RAW_CODE_SHOULD_NOT_APPEAR",
      redirectUri: "https://app.example.com/callback",
    });

    expect(result).toMatchObject({
      status: "skipped",
      mode: "dry_run",
      exchangeAttempted: false,
      code: "[REDACTED_CODE]",
      token: null,
      errorType: null,
    });
    expect(() => assertSbl09Redacted(JSON.stringify(result))).not.toThrow();
  });

  it("returns a safe error when code is missing", async () => {
    const result = await exchangeSandboxAuthorizationCode({
      providerId: "meta-business-instagram-sandbox",
      code: null,
      redirectUri: "https://app.example.com/callback",
    });

    expect(result).toMatchObject({
      status: "error",
      exchangeAttempted: false,
      code: null,
      token: null,
      errorType: "code_required",
    });
  });

  it("does not exchange when enabled without redirect URI or exchange client", async () => {
    await expect(
      exchangeSandboxAuthorizationCode({
        providerId: "meta-business-facebook-sandbox",
        code: "RAW_CODE_SHOULD_NOT_APPEAR",
        redirectUri: null,
        exchangeEnabled: true,
      }),
    ).resolves.toMatchObject({ status: "error", exchangeAttempted: false, errorType: "redirect_uri_required" });

    await expect(
      exchangeSandboxAuthorizationCode({
        providerId: "meta-business-facebook-sandbox",
        code: "RAW_CODE_SHOULD_NOT_APPEAR",
        redirectUri: "https://app.example.com/callback",
        exchangeEnabled: true,
      }),
    ).resolves.toMatchObject({ status: "error", exchangeAttempted: false, errorType: "exchange_client_required" });
  });

  it("redacts successful sandbox exchange output from an injected client", async () => {
    const exchangeClient = vi.fn().mockResolvedValue({
      access_token: "RAW_TOKEN_SHOULD_NOT_APPEAR",
    });
    const result = await exchangeSandboxAuthorizationCode({
      providerId: "meta-business-instagram-sandbox",
      code: "RAW_CODE_SHOULD_NOT_APPEAR",
      redirectUri: "https://app.example.com/callback",
      exchangeEnabled: true,
      exchangeClient,
    });

    expect(exchangeClient).toHaveBeenCalledWith({
      providerId: "meta-business-instagram-sandbox",
      code: "RAW_CODE_SHOULD_NOT_APPEAR",
      redirectUri: "https://app.example.com/callback",
    });
    expect(result).toMatchObject({
      status: "success",
      exchangeAttempted: true,
      code: "[REDACTED_CODE]",
      token: "[REDACTED_TOKEN]",
    });
    expect(() => assertSbl09Redacted(JSON.stringify(result))).not.toThrow();
  });

  it("classifies sandbox token exchange failures without leaking raw errors", async () => {
    const result = await exchangeSandboxAuthorizationCode({
      providerId: "meta-business-facebook-sandbox",
      code: "RAW_CODE_SHOULD_NOT_APPEAR",
      redirectUri: "https://app.example.com/callback",
      exchangeEnabled: true,
      exchangeClient: vi.fn().mockRejectedValue(new Error("Meta failed with raw code RAW_CODE_SHOULD_NOT_APPEAR")),
    });

    expect(result).toMatchObject({
      status: "error",
      exchangeAttempted: true,
      code: "[REDACTED_CODE]",
      token: null,
      errorType: "code_required",
    });
    expect(() => assertSbl09Redacted(JSON.stringify(result))).not.toThrow();
  });
});
