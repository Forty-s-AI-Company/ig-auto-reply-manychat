import { createHmac } from "crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  db: {
    channel: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/db", () => ({ getDb: () => mocks.db }));

import { buildWebhookChannelConfig, POST as metaWebhookPost } from "@/app/api/webhooks/meta/route";
import { metaAdapter, parseMetaWebhookComments, parseMetaWebhookMessages } from "@/lib/channels/meta";

function sign(body: string, secret: string) {
  return `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
}

describe("Meta webhook", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    mocks.db.channel.findUnique.mockResolvedValue(null);
  });

  it("parses Instagram text messages and ignores echoes", () => {
    const messages = parseMetaWebhookMessages({
      object: "instagram",
      entry: [
        {
          messaging: [
            {
              sender: { id: "igsid-user-1" },
              recipient: { id: "17841480614995177" },
              message: { mid: "mid-1", text: "價格" },
            },
            {
              sender: { id: "17841480614995177" },
              recipient: { id: "igsid-user-1" },
              message: { mid: "mid-2", text: "echo", is_echo: true },
            },
          ],
        },
      ],
    });

    expect(messages).toEqual([
      expect.objectContaining({
        channelType: "instagram",
        channelName: "Instagram Official",
        externalId: "igsid-user-1",
        text: "價格",
        providerMessageId: "mid-1",
      }),
    ]);
  });

  it("parses Instagram comment webhook changes", () => {
    const comments = parseMetaWebhookComments({
      object: "instagram",
      entry: [
        {
          id: "17841480614995177",
          changes: [
            {
              field: "comments",
              value: {
                id: "comment-1",
                text: "canva",
                from: { id: "commenter-1", username: "tester" },
                media: { id: "media-1" },
              },
            },
          ],
        },
      ],
    });

    expect(comments).toEqual([
      expect.objectContaining({
        instagramBusinessAccountId: "17841480614995177",
        externalId: "commenter-1",
        username: "tester",
        text: "canva",
        commentId: "comment-1",
        mediaId: "media-1",
      }),
    ]);
  });

  it("rejects Meta webhook requests with an invalid signature", async () => {
    const secret = "test-meta-app-secret";
    vi.stubEnv("META_APP_SECRET", secret);

    const body = JSON.stringify({ object: "instagram", entry: [] });
    const response = await metaWebhookPost(
      new Request("http://localhost:3000/api/webhooks/meta", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-hub-signature-256": sign(body, "wrong-secret"),
        },
        body,
      }),
    );

    expect(response.status).toBe(401);
  });

  it("sends Instagram replies through the Meta Send API", async () => {
    vi.stubEnv("META_PAGE_ACCESS_TOKEN", "page-token");
    vi.stubEnv("META_INSTAGRAM_BUSINESS_ACCOUNT_ID", "17841480614995177");
    vi.stubEnv("META_GRAPH_API_VERSION", "v25.0");
    const fetchMock = vi.fn(async () =>
      Response.json({ recipient_id: "igsid-user-1", message_id: "sent-mid-1" }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await metaAdapter("instagram").sendMessage({
      channelId: "channel-1",
      externalId: "igsid-user-1",
      text: "您好，這裡是自動回覆。",
    });

    expect(result.providerMessageId).toBe("sent-mid-1");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://graph.facebook.com/v25.0/me/messages",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          authorization: "Bearer page-token",
          "content-type": "application/json",
        }),
      }),
    );
    const calls = (fetchMock as unknown as { mock: { calls: Array<[string, RequestInit]> } }).mock.calls;
    const requestInit = calls[0][1];
    expect(JSON.parse(String(requestInit.body))).toEqual({
      messaging_type: "RESPONSE",
      recipient: { id: "igsid-user-1" },
      message: { text: "您好，這裡是自動回覆。" },
    });
  });

  it("sends Instagram private replies when a comment id is provided", async () => {
    vi.stubEnv("META_PAGE_ACCESS_TOKEN", "page-token");
    vi.stubEnv("META_INSTAGRAM_BUSINESS_ACCOUNT_ID", "17841480614995177");
    vi.stubEnv("META_GRAPH_API_VERSION", "v25.0");
    const fetchMock = vi.fn(async () =>
      Response.json({ recipient_id: "comment-1", message_id: "sent-private-reply" }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await metaAdapter("instagram").sendMessage({
      channelId: "channel-1",
      externalId: "commenter-1",
      commentId: "comment-1",
      text: "私訊傳給你囉",
    });

    const calls = (fetchMock as unknown as { mock: { calls: Array<[string, RequestInit]> } }).mock.calls;
    expect(JSON.parse(String(calls[0][1].body))).toEqual({
      messaging_type: "RESPONSE",
      recipient: { comment_id: "comment-1" },
      message: { text: "私訊傳給你囉" },
    });
  });

  it("does not add global Meta fallback env markers to webhook channel config in production", () => {
    vi.stubEnv("INBOXPILOT_DEPLOYMENT_ENV", "production");
    vi.stubEnv("META_PAGE_ID", "global-page-id");
    vi.stubEnv("META_PAGE_ACCESS_TOKEN", "global-page-token");
    vi.stubEnv("META_INSTAGRAM_BUSINESS_ACCOUNT_ID", "global-ig-id");

    expect(buildWebhookChannelConfig({}, false)).toEqual({});
  });

  it("can add global Meta fallback env markers outside production for local smoke paths", () => {
    vi.stubEnv("INBOXPILOT_DEPLOYMENT_ENV", "development");
    vi.stubEnv("META_PAGE_ID", "local-page-id");
    vi.stubEnv("META_INSTAGRAM_BUSINESS_ACCOUNT_ID", "local-ig-id");

    expect(buildWebhookChannelConfig({}, false)).toEqual({
      pageId: "local-page-id",
      instagramBusinessAccountId: "local-ig-id",
      tokenEnv: "META_PAGE_ACCESS_TOKEN",
    });
  });
});
