import { describe, expect, it, vi } from "vitest";
import type { BroadcastCandidate } from "@/lib/compliance";
import { getAppUrl } from "@/lib/app-url";
import { canReceiveBroadcast, filterBroadcastRecipients, isOfficialSendAllowed } from "@/lib/compliance";
import { segmentContactWhere } from "@/lib/segments";
import { decryptSecret, encryptSecret, isEncryptedSecret, tryDecryptSecret } from "@/lib/secrets";
import {
  billingCheckoutSchema,
  broadcastSchema,
  contactFieldDefinitionSchema,
  conversationUpdateSchema,
  sequenceSchema,
} from "@/lib/validation";
import { hasValidSharedSecret, secureCompare, verifyHmacSignature } from "@/lib/webhook-security";

describe("unit: core utilities", () => {
  it("resolves localhost app URLs from the request origin", () => {
    vi.stubEnv("APP_URL", "https://production.example.com/");

    expect(getAppUrl(new Request("http://localhost:3041/api/test"))).toBe("http://localhost:3041");
    expect(getAppUrl(new Request("http://127.0.0.1:3041/api/test"))).toBe("http://127.0.0.1:3041");
    expect(getAppUrl(new Request("https://app.example.com/api/test"))).toBe("https://production.example.com");

    vi.stubEnv("APP_URL", "");
    expect(getAppUrl(new Request("https://fallback.example.com/api/test"))).toBe("https://fallback.example.com");

    vi.unstubAllEnvs();
  });

  it("filters broadcast recipients by target tag and consent", () => {
    const contacts: BroadcastCandidate[] = [
      { id: "1", channelId: "c1", consentStatus: "opted_in", tags: [{ tagId: "lead" }] },
      { id: "2", channelId: "c1", consentStatus: "opted_out", tags: [{ tagId: "lead" }] },
      { id: "3", channelId: "c1", consentStatus: "opted_in", tags: [{ tagId: "other" }] },
    ];

    expect(canReceiveBroadcast({ consentStatus: "opted_in" })).toBe(true);
    expect(canReceiveBroadcast({ consentStatus: "unknown" })).toBe(false);
    expect(filterBroadcastRecipients(contacts, "lead").map((contact) => contact.id)).toEqual(["1"]);
  });

  it("builds Prisma where clauses for segment filters", () => {
    const now = new Date("2026-05-31T00:00:00.000Z");
    vi.setSystemTime(now);

    expect(
      segmentContactWhere("workspace-1", {
        channelId: "channel-1",
        tagId: "vip",
        consentStatus: "opted_in",
        lastInboundWithinDays: 3,
      }),
    ).toEqual({
      channel: { workspaceId: "workspace-1" },
      channelId: "channel-1",
      consentStatus: "opted_in",
      tags: { some: { tagId: "vip" } },
      lastInboundAt: { gte: new Date("2026-05-28T00:00:00.000Z") },
    });
    expect(segmentContactWhere("workspace-1", null)).toEqual({
      channel: { workspaceId: "workspace-1" },
    });

    vi.useRealTimers();
  });

  it("round-trips encrypted secrets and rejects corrupted payloads", () => {
    vi.stubEnv("AUTH_SECRET", "unit-test-secret-with-more-than-32-characters");

    const encrypted = encryptSecret("super-secret-token");
    expect(isEncryptedSecret(encrypted)).toBe(true);
    expect(decryptSecret("plain-token")).toBe("plain-token");
    expect(decryptSecret(encrypted)).toBe("super-secret-token");
    expect(() => decryptSecret("enc:v1:bad")).toThrow("Invalid encrypted secret format.");
    expect(tryDecryptSecret(`${encrypted.slice(0, -2)}xx`)).toBeNull();

    vi.unstubAllEnvs();
  });

  it("verifies optional and signed webhook HMAC signatures", async () => {
    const body = JSON.stringify({ event: "created" });
    const wrongLengthSignature = `sha256=${Buffer.from("not-the-right-length", "utf8").toString("hex")}`;
    const validSignature = `sha256=${(await import("node:crypto")).createHmac("sha256", "secret").update(body).digest("hex")}`;

    expect(secureCompare("same", "same")).toBe(true);
    expect(secureCompare("same", "different")).toBe(false);
    expect(hasValidSharedSecret(new Request("http://local.test", { headers: { "x-secret": "shared" } }), "x-secret", "shared")).toBe(true);
    expect(hasValidSharedSecret(new Request("http://local.test"), "x-secret", "shared")).toBe(false);
    expect(verifyHmacSignature({ body, signatureHeader: null })).toBe(true);
    expect(verifyHmacSignature({ body, secret: "secret", signatureHeader: null })).toBe(false);
    expect(verifyHmacSignature({ body, secret: "secret", signatureHeader: "sha256=bad" })).toBe(false);
    expect(verifyHmacSignature({ body, secret: "secret", signatureHeader: wrongLengthSignature })).toBe(false);
    expect(verifyHmacSignature({ body, secret: "secret", signatureHeader: validSignature })).toBe(true);
  });

  it("validates high-risk request schemas", () => {
    expect(billingCheckoutSchema.parse({ planKey: "pro", addonKeys: "extra" }).addonKeys).toEqual(["extra"]);
    expect(billingCheckoutSchema.parse({ planKey: "pro", addonKeys: ["extra", "seat"], useCredits: false }).useCredits).toBe(false);
    expect(contactFieldDefinitionSchema.safeParse({ key: "1bad", label: "Bad" }).success).toBe(false);
    expect(contactFieldDefinitionSchema.parse({ key: "good_key", label: "Good" }).type).toBe("text");
    expect(conversationUpdateSchema.safeParse({}).success).toBe(false);
    expect(
      sequenceSchema.parse({
        name: "Welcome",
        steps: [{ order: "1", type: "send_message", messageJson: { text: "Hi" } }],
      }).steps[0].delaySeconds,
    ).toBe(0);
    expect(
      broadcastSchema.safeParse({
        name: "Promo",
        targetConfigJson: { tagId: "tag-1" },
        messageJson: { text: "Hello" },
        scheduledAt: "not-a-date",
      }).success,
    ).toBe(false);
  });

  it("does not fake official delivery for disabled channels", () => {
    expect(isOfficialSendAllowed({ type: "mock", enabled: true })).toBe(true);
    expect(isOfficialSendAllowed({ type: "telegram", enabled: false })).toBe(false);
    expect(isOfficialSendAllowed({ type: "instagram", enabled: false })).toBe(false);
  });
});
