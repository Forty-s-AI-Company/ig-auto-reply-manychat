import { describe, expect, it } from "vitest";
import {
  buildMetaBusinessSandboxDryRunPayload,
  validateMetaBusinessSandboxDryRunPayload,
} from "@/lib/meta-business-sandbox-dry-run";
import { assertSbl09Redacted } from "./helpers/sbl09-redaction";

describe("SBL-06 Meta Business Login sandbox dry-run payload builder", () => {
  it("builds a redacted success payload without production writes", () => {
    const payload = buildMetaBusinessSandboxDryRunPayload({
      providerId: "meta-business-instagram-sandbox",
      flowType: "instagram_business_login",
      transport: "popup",
      workspaceId: "default-workspace",
      requestId: "req-real-value",
      selectedAssets: {
        businessId: "123456789",
        pageId: "987654321",
        instagramAccountId: "111222333",
      },
    });

    expect(payload.status).toBe("success");
    expect(payload.selectedBusinessId).toMatch(/^business_[a-f0-9]{8}$/);
    expect(payload.selectedPageId).toMatch(/^page_[a-f0-9]{8}$/);
    expect(payload.selectedInstagramAccountId).toMatch(/^ig_[a-f0-9]{8}$/);
    expect(validateMetaBusinessSandboxDryRunPayload(payload)).toEqual([]);
    expect(() => assertSbl09Redacted(JSON.stringify(payload))).not.toThrow();
  });

  it("builds a redacted error payload with safe error type only", () => {
    const payload = buildMetaBusinessSandboxDryRunPayload({
      providerId: "meta-business-facebook-sandbox",
      flowType: "facebook_login_for_business",
      transport: "redirect",
      workspaceId: "default-workspace",
      requestId: "req-real-value",
      errorType: "workspace_not_allowed",
    });

    expect(payload.status).toBe("error");
    expect(payload.errorType).toBe("workspace_not_allowed");
    expect(payload.selectedAssetCount).toBe(0);
    expect(validateMetaBusinessSandboxDryRunPayload(payload)).toEqual([]);
  });
});
