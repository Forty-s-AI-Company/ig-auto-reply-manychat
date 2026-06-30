import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireApiUser: vi.fn(),
  getCurrentWorkspaceId: vi.fn(),
  getSelectedInstagramChannelId: vi.fn(),
  getAnalyticsSummary: vi.fn(),
  assertWorkspaceLimit: vi.fn(),
  db: {
    auditEvent: {
      create: vi.fn(),
    },
    tag: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    broadcast: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({ requireApiUser: mocks.requireApiUser }));
vi.mock("@/lib/workspaces", () => ({ getCurrentWorkspaceId: mocks.getCurrentWorkspaceId }));
vi.mock("@/lib/account-scope", () => ({ getSelectedInstagramChannelId: mocks.getSelectedInstagramChannelId }));
vi.mock("@/lib/dashboard-summary", () => ({ getAnalyticsSummary: mocks.getAnalyticsSummary }));
vi.mock("@/lib/billing/entitlements", () => ({ assertWorkspaceLimit: mocks.assertWorkspaceLimit }));
vi.mock("@/lib/db", () => ({ getDb: () => mocks.db }));

import * as analyticsRoute from "@/app/api/analytics/route";
import * as broadcastsRoute from "@/app/api/broadcasts/route";
import * as tagsRoute from "@/app/api/tags/route";

function jsonRequest(url: string, body: unknown) {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("integration: API route handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireApiUser.mockResolvedValue({ user: { id: "user-1" }, response: null });
    mocks.getCurrentWorkspaceId.mockResolvedValue("workspace-1");
    mocks.getSelectedInstagramChannelId.mockResolvedValue(undefined);
    mocks.getAnalyticsSummary.mockResolvedValue({
      contacts: 0,
      messages: 0,
      recentMessages: 0,
      openConversations: 0,
      broadcasts: 0,
      queuedBroadcasts: 0,
      sentCount: 0,
      failedCount: 0,
      automations: 0,
      enabledAutomations: 0,
      connectedInstagramChannels: 0,
      selectedChannelDisplayName: null,
    });
    mocks.assertWorkspaceLimit.mockResolvedValue(undefined);
  });

  it("returns 401 before touching workspace state", async () => {
    mocks.requireApiUser.mockResolvedValue({
      user: null,
      response: Response.json({ error: "Unauthorized" }, { status: 401 }),
    });

    const response = await tagsRoute.GET();

    expect(response.status).toBe(401);
    expect(mocks.getCurrentWorkspaceId).not.toHaveBeenCalled();
  });

  it("returns analytics state for the active workspace", async () => {
    mocks.getAnalyticsSummary.mockResolvedValue({
      contacts: 12,
      messages: 34,
      recentMessages: 8,
      openConversations: 3,
      broadcasts: 2,
      queuedBroadcasts: 1,
      sentCount: 9,
      failedCount: 1,
      automations: 4,
      enabledAutomations: 2,
      connectedInstagramChannels: 1,
      selectedChannelDisplayName: "Carry",
    });
    mocks.getSelectedInstagramChannelId.mockResolvedValue("channel-1");

    const response = await analyticsRoute.GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      contacts: 12,
      messages: 34,
      connectedInstagramChannels: 1,
      state: {
        scopeBadge: "單一 IG 帳號：Carry",
        bannerTitle: "目前只看「Carry」的資料",
      },
    });
    expect(mocks.getAnalyticsSummary).toHaveBeenCalledWith({
      workspaceId: "workspace-1",
      selectedChannelId: "channel-1",
    });
  });

  it("returns 401 for broadcast routes before validation", async () => {
    mocks.requireApiUser.mockResolvedValue({
      user: null,
      response: Response.json({ error: "Unauthorized" }, { status: 401 }),
    });

    const getResponse = await broadcastsRoute.GET();
    const postResponse = await broadcastsRoute.POST(jsonRequest("http://local.test/api/broadcasts", {}));

    expect(getResponse.status).toBe(401);
    expect(postResponse.status).toBe(401);
    expect(mocks.getCurrentWorkspaceId).not.toHaveBeenCalled();
  });

  it("lists tags for the active workspace", async () => {
    mocks.db.tag.findMany.mockResolvedValue([{ id: "tag-1", workspaceId: "workspace-1", name: "VIP" }]);

    const response = await tagsRoute.GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([{ id: "tag-1", workspaceId: "workspace-1", name: "VIP" }]);
    expect(mocks.db.tag.findMany).toHaveBeenCalledWith({
      where: { workspaceId: "workspace-1" },
      orderBy: { name: "asc" },
    });
  });

  it("validates and creates tags", async () => {
    mocks.db.tag.create.mockResolvedValue({ id: "tag-2", workspaceId: "workspace-1", name: "Lead", color: "#2563eb" });

    const invalid = await tagsRoute.POST(jsonRequest("http://local.test/api/tags", { name: "" }));
    const created = await tagsRoute.POST(jsonRequest("http://local.test/api/tags", { name: "Lead" }));

    expect(invalid.status).toBe(400);
    expect(created.status).toBe(200);
    expect(await created.json()).toMatchObject({ id: "tag-2", name: "Lead" });
    expect(mocks.db.tag.create).toHaveBeenCalledWith({
      data: { name: "Lead", color: "#2563eb", workspaceId: "workspace-1" },
    });
  });

  it("lists broadcasts and enforces plan limits when creating one", async () => {
    const scheduledAt = new Date("2026-06-01T02:00:00.000Z");
    mocks.db.broadcast.findMany.mockResolvedValue([{ id: "broadcast-1", name: "Promo" }]);
    mocks.db.broadcast.create.mockResolvedValue({ id: "broadcast-2", name: "Promo", scheduledAt });

    const listResponse = await broadcastsRoute.GET();
    const createResponse = await broadcastsRoute.POST(
      jsonRequest("http://local.test/api/broadcasts", {
        name: "Promo",
        targetConfigJson: { tagId: "tag-1" },
        messageJson: { text: "Hello" },
        scheduledAt,
      }),
    );

    expect(await listResponse.json()).toEqual([{ id: "broadcast-1", name: "Promo" }]);
    expect(createResponse.status).toBe(200);
    expect(mocks.assertWorkspaceLimit).toHaveBeenCalledWith("workspace-1", "broadcasts");
    expect(mocks.db.broadcast.create).toHaveBeenCalledWith({
      data: {
        workspaceId: "workspace-1",
        name: "Promo",
        targetConfigJson: { tagId: "tag-1" },
        messageJson: { text: "Hello" },
        scheduledAt,
      },
    });
  });

  it("rejects malformed broadcast payloads before checking plan limits", async () => {
    const response = await broadcastsRoute.POST(
      jsonRequest("http://local.test/api/broadcasts", {
        name: "",
        targetConfigJson: {},
        messageJson: { text: "" },
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "廣播資料格式錯誤，請重新確認。" });
    expect(mocks.assertWorkspaceLimit).not.toHaveBeenCalled();
    expect(mocks.db.broadcast.create).not.toHaveBeenCalled();
  });

  it("returns billing errors without creating broadcasts", async () => {
    mocks.assertWorkspaceLimit.mockRejectedValue(new Error("已達方案限制。"));

    const response = await broadcastsRoute.POST(
      jsonRequest("http://local.test/api/broadcasts", {
        name: "Promo",
        targetConfigJson: { segmentId: "segment-1" },
        messageJson: { text: "Hello" },
      }),
    );

    expect(response.status).toBe(402);
    expect(await response.json()).toEqual({ error: "已達方案限制。" });
    expect(mocks.db.broadcast.create).not.toHaveBeenCalled();
  });
});
