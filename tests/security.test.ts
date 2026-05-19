import { afterEach, describe, expect, it, vi } from "vitest";
import { POST as telegramWebhookPost } from "@/app/api/webhooks/telegram/route";
import { createSession } from "@/lib/auth";
import { secureCompare } from "@/lib/webhook-security";

describe("security defaults", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

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
