import { afterEach, describe, expect, it, vi } from "vitest";
import { POST as telegramWebhookPost } from "@/app/api/webhooks/telegram/route";
import { createSession } from "@/lib/auth";
import { getInboxPilotDeploymentEnv } from "@/lib/deployment-env";
import { encryptSecret } from "@/lib/secrets";
import { secureCompare } from "@/lib/webhook-security";

describe("security defaults", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  function stubProductionFallbackEnv() {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("INBOXPILOT_DEPLOYMENT_ENV", "");
    vi.stubEnv("INBOXPILOT_DB_ENV", "");
    vi.stubEnv("VERCEL_ENV", "");
  }

  it("rejects weak auth secrets in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("AUTH_SECRET", "short-secret");

    await expect(createSession("user-id")).rejects.toThrow("AUTH_SECRET must be set");
  });

  it("allows strong auth secrets in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("AUTH_SECRET", "production-secret-with-at-least-32-characters");

    await expect(createSession("user-id")).resolves.toEqual(expect.any(String));
  });

  it("treats NODE_ENV production as a production deployment fallback", () => {
    stubProductionFallbackEnv();

    expect(getInboxPilotDeploymentEnv()).toBe("production");
  });

  it("requires a dedicated token encryption key in production", () => {
    stubProductionFallbackEnv();
    vi.stubEnv("AUTH_SECRET", "production-secret-with-at-least-32-characters");
    vi.stubEnv("TOKEN_ENCRYPTION_KEY", "");

    expect(() => encryptSecret("access-token")).toThrow("TOKEN_ENCRYPTION_KEY must be set");
  });

  it("rejects reusing AUTH_SECRET as the production token encryption key", () => {
    const sharedSecret = "shared-production-secret-with-at-least-32-characters";
    stubProductionFallbackEnv();
    vi.stubEnv("AUTH_SECRET", sharedSecret);
    vi.stubEnv("TOKEN_ENCRYPTION_KEY", sharedSecret);

    expect(() => encryptSecret("access-token")).toThrow("TOKEN_ENCRYPTION_KEY must be separate");
  });

  it("allows a strong dedicated production token encryption key", () => {
    stubProductionFallbackEnv();
    vi.stubEnv("AUTH_SECRET", "production-auth-secret-with-at-least-32-characters");
    vi.stubEnv("TOKEN_ENCRYPTION_KEY", "production-token-encryption-key-with-at-least-32-characters");

    expect(encryptSecret("access-token")).toEqual(expect.stringMatching(/^enc:v1:/));
  });

  it("compares shared webhook secrets without plain string equality", () => {
    expect(secureCompare("expected-secret", "expected-secret")).toBe(true);
    expect(secureCompare("wrong-secret", "expected-secret")).toBe(false);
  });

  it("rejects Telegram webhook requests with an invalid secret header", async () => {
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "test-token");
    vi.stubEnv("TELEGRAM_WEBHOOK_SECRET", "expected-secret");

    const response = await telegramWebhookPost(
      new Request("http://localhost:3000/api/webhooks/telegram", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-telegram-bot-api-secret-token": "wrong-secret",
        },
        body: JSON.stringify({ message: { text: "hello", chat: { id: 1 } } }),
      }),
    );

    expect(response.status).toBe(401);
  });
});
