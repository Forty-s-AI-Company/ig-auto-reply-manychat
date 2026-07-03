import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireApiUser: vi.fn(),
  getCurrentWorkspaceId: vi.fn(),
  getSelectedInstagramChannelId: vi.fn(),
  getDb: vi.fn(),
  handleInboundMessage: vi.fn(),
  assertRateLimit: vi.fn(),
  getClientIp: vi.fn(),
  hasValidSharedSecret: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ requireApiUser: mocks.requireApiUser }));
vi.mock("@/lib/workspaces", () => ({ getCurrentWorkspaceId: mocks.getCurrentWorkspaceId }));
vi.mock("@/lib/account-scope", () => ({ getSelectedInstagramChannelId: mocks.getSelectedInstagramChannelId }));
vi.mock("@/lib/db", () => ({ getDb: mocks.getDb }));
vi.mock("@/lib/messages", () => ({ handleInboundMessage: mocks.handleInboundMessage }));
vi.mock("@/lib/security", () => ({
  assertRateLimit: mocks.assertRateLimit,
  getClientIp: mocks.getClientIp,
}));
vi.mock("@/lib/webhook-security", () => ({ hasValidSharedSecret: mocks.hasValidSharedSecret }));

import { POST } from "@/app/api/webhooks/mock/route";

function request(body: unknown) {
  return new Request("http://local.test/api/webhooks/mock", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("mock webhook route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NODE_ENV", "production");
    mocks.assertRateLimit.mockResolvedValue(null);
    mocks.getClientIp.mockReturnValue("127.0.0.1");
    mocks.hasValidSharedSecret.mockReturnValue(false);
    mocks.requireApiUser.mockResolvedValue({ user: { id: "user-a" }, response: null });
    mocks.getCurrentWorkspaceId.mockResolvedValue("workspace-reviewer");
    mocks.getSelectedInstagramChannelId.mockResolvedValue(undefined);
    mocks.getDb.mockReturnValue({
      channel: {
        findMany: vi.fn().mockResolvedValue([]),
      },
    });
    mocks.handleInboundMessage.mockResolvedValue({
      conversation: { id: "conversation-a" },
    });
  });

  it("scopes authenticated production mock inbound messages to the current workspace", async () => {
    const response = await POST(
      request({
        externalId: "reviewer-contact",
        displayName: "Meta Reviewer Contact",
        text: "hello",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(202);
    expect(body).toEqual({ ok: true, queued: true, conversationId: "conversation-a" });
    expect(mocks.requireApiUser).toHaveBeenCalledTimes(1);
    expect(mocks.getCurrentWorkspaceId).toHaveBeenCalledTimes(1);
    expect(mocks.handleInboundMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        channelType: "mock",
        externalId: "reviewer-contact",
        displayName: "Meta Reviewer Contact",
        text: "hello",
        workspaceId: "workspace-reviewer",
      }),
    );
  });

  it("targets the selected instagram channel for authenticated deployed reviewer-safe mock inbound writes", async () => {
    mocks.getSelectedInstagramChannelId.mockResolvedValue("channel-instagram-1");

    const response = await POST(
      request({
        externalId: "reviewer-contact",
        displayName: "Meta Reviewer Contact",
        text: "hello",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(202);
    expect(body).toEqual({ ok: true, queued: true, conversationId: "conversation-a" });
    expect(mocks.handleInboundMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        channelType: "instagram",
        channelId: "channel-instagram-1",
        channelName: undefined,
        workspaceId: "workspace-reviewer",
      }),
    );
  });

  it("falls back to the only enabled instagram channel in the workspace when no cookie-scoped channel is selected", async () => {
    mocks.getDb.mockReturnValue({
      channel: {
        findMany: vi.fn().mockResolvedValue([{ id: "channel-instagram-only" }]),
      },
    });

    const response = await POST(
      request({
        externalId: "reviewer-contact",
        displayName: "Meta Reviewer Contact",
        text: "hello",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(202);
    expect(body).toEqual({ ok: true, queued: true, conversationId: "conversation-a" });
    expect(mocks.handleInboundMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        channelType: "instagram",
        channelId: "channel-instagram-only",
        workspaceId: "workspace-reviewer",
      }),
    );
  });

  it("returns the auth failure response before touching workspace scope or message writes", async () => {
    const unauthorized = Response.json({ error: "Unauthorized" }, { status: 401 });
    mocks.requireApiUser.mockResolvedValue({ user: null, response: unauthorized });

    const response = await POST(
      request({
        externalId: "reviewer-contact",
        displayName: "Meta Reviewer Contact",
        text: "hello",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized" });
    expect(mocks.getCurrentWorkspaceId).not.toHaveBeenCalled();
    expect(mocks.handleInboundMessage).not.toHaveBeenCalled();
  });
});
