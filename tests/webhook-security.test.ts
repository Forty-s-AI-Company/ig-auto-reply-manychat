import { createHmac } from "crypto";
import { describe, expect, it } from "vitest";
import { verifyHmacSignature } from "@/lib/webhook-security";

describe("webhook HMAC verification", () => {
  it("accepts a valid sha256 signature", () => {
    const body = JSON.stringify({ externalId: "user-1" });
    const secret = "automation-webhook-secret";
    const signature = createHmac("sha256", secret).update(body).digest("hex");

    expect(
      verifyHmacSignature({
        body,
        secret,
        signatureHeader: `sha256=${signature}`,
      }),
    ).toBe(true);
  });

  it("rejects an invalid signature when a secret is configured", () => {
    expect(
      verifyHmacSignature({
        body: "{}",
        secret: "automation-webhook-secret",
        signatureHeader: "sha256=bad",
      }),
    ).toBe(false);
  });

  it("allows unsigned requests only when no secret is configured", () => {
    expect(verifyHmacSignature({ body: "{}", signatureHeader: null })).toBe(true);
  });
});
