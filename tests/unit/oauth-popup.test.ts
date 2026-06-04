import { afterEach, describe, expect, it, vi } from "vitest";
import { getOAuthProvider, listOAuthProviders } from "@/lib/oauth/registry";
import { mockProvider } from "@/lib/oauth/providers/mock";
import { telegramBotProvider } from "@/lib/oauth/providers/telegram-bot";
import { getProviderCallbackUrl } from "@/lib/oauth/utils";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("unit: oauth popup module", () => {
  it("registers all supported providers", () => {
    const providers = listOAuthProviders().map((item) => item.id).sort();
    expect(providers).toEqual(["meta-facebook", "meta-instagram", "mock", "telegram-bot"]);
    expect(getOAuthProvider("meta-instagram")?.mode).toBe("oauth");
    expect(getOAuthProvider("telegram-bot")?.mode).toBe("token");
    expect(getOAuthProvider("missing-provider")).toBeNull();
  });

  it("builds callback URLs from the request origin", () => {
    const request = new Request("http://localhost:3041/api/test");
    expect(getProviderCallbackUrl(request, "meta-instagram")).toBe("http://localhost:3041/api/oauth/meta-instagram/callback");
  });

  it("decodes mock provider callback payloads", async () => {
    const code = Buffer.from(
      JSON.stringify({ id: "mock-user-001", name: "Mock Workspace Owner", username: "mock_owner" }),
      "utf8",
    ).toString("base64url");

    const result = await mockProvider.handleCallback?.({
      request: new Request("http://localhost:3041/api/oauth/mock/callback"),
      code,
      state: "state",
      popupOrigin: "http://localhost:3041",
    });

    expect(result?.providerAccountId).toBe("mock-user-001");
    expect(result?.displayName).toBe("Mock Workspace Owner");
    expect(result?.metadata?.oauthProvider).toBe("mock");
  });

  it("validates telegram bot tokens before storing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            ok: true,
            result: {
              id: 123456,
              is_bot: true,
              first_name: "InboxPilot Bot",
              username: "inboxpilot_bot",
            },
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    const result = await telegramBotProvider.connectWithToken?.({
      request: new Request("http://localhost:3041/api/oauth/telegram-bot/token"),
      popupOrigin: "http://localhost:3041",
      token: "123456:ABC",
      label: "客服機器人",
    });

    expect(result?.providerAccountId).toBe("123456");
    expect(result?.displayName).toBe("客服機器人");
    expect(result?.username).toBe("inboxpilot_bot");
  });
});
