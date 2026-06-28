import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireApiUser: vi.fn(),
  getCurrentWorkspaceId: vi.fn(),
  getSelectedInstagramChannelId: vi.fn(),
  assertRateLimit: vi.fn(),
  assertSameOriginRequest: vi.fn(),
  addInternalNote: vi.fn(),
  db: {
    conversation: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    workspaceUser: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({ requireApiUser: mocks.requireApiUser }));
vi.mock("@/lib/workspaces", () => ({ getCurrentWorkspaceId: mocks.getCurrentWorkspaceId }));
vi.mock("@/lib/db", () => ({ getDb: () => mocks.db }));
vi.mock("@/lib/messages", () => ({ addInternalNote: mocks.addInternalNote }));
vi.mock("@/lib/channels/public", () => ({ publicChannelSelect: { id: true, name: true } }));
vi.mock("@/lib/account-scope", () => ({
  getSelectedInstagramChannelId: mocks.getSelectedInstagramChannelId,
  instagramChannelWhere: (channelId?: string, workspaceId?: string) =>
    channelId
      ? { channelId, ...(workspaceId ? { channel: { workspaceId } } : {}) }
      : { channel: { workspaceId, type: "instagram", enabled: true } },
}));
vi.mock("@/lib/security", () => ({
  assertRateLimit: mocks.assertRateLimit,
  assertSameOriginRequest: mocks.assertSameOriginRequest,
}));

import { POST as notesPost } from "@/app/api/conversations/[id]/notes/route";
import { PATCH as conversationPatch } from "@/app/api/conversations/[id]/route";

describe("conversation routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireApiUser.mockResolvedValue({ user: { id: "user-a" }, response: null });
    mocks.getCurrentWorkspaceId.mockResolvedValue("workspace-a");
    mocks.getSelectedInstagramChannelId.mockResolvedValue(undefined);
    mocks.assertSameOriginRequest.mockReturnValue(null);
    mocks.assertRateLimit.mockResolvedValue(null);
  });

  it("blocks conversation updates when same-origin validation fails", async () => {
    const response = new Response(null, { status: 403 });
    mocks.assertSameOriginRequest.mockReturnValue(response);

    const result = await conversationPatch(
      new Request("http://local.test/api/conversations/conversation-a", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "closed" }),
      }),
      { params: Promise.resolve({ id: "conversation-a" }) },
    );

    expect(result.status).toBe(403);
    expect(mocks.requireApiUser).not.toHaveBeenCalled();
    expect(mocks.assertRateLimit).not.toHaveBeenCalled();
  });

  it("rate limits internal note writes before touching the database", async () => {
    const response = new Response(null, { status: 429 });
    mocks.assertRateLimit.mockResolvedValue(response);

    const result = await notesPost(
      new Request("http://local.test/api/conversations/conversation-a/notes", {
        method: "POST",
        headers: { "content-type": "application/json", origin: "http://local.test" },
        body: JSON.stringify({ text: "follow up tomorrow" }),
      }),
      { params: Promise.resolve({ id: "conversation-a" }) },
    );

    expect(result.status).toBe(429);
    expect(mocks.assertRateLimit).toHaveBeenCalledWith({
      key: "conversation-note:user-a",
      limit: 120,
      windowMs: 60 * 1000,
    });
    expect(mocks.db.conversation.findFirst).not.toHaveBeenCalled();
    expect(mocks.addInternalNote).not.toHaveBeenCalled();
  });

  it("rejects assigning a conversation to a user outside the workspace", async () => {
    mocks.db.conversation.findFirst.mockResolvedValue({ id: "conversation-a" });
    mocks.db.workspaceUser.findFirst.mockResolvedValue(null);

    const result = await conversationPatch(
      new Request("http://local.test/api/conversations/conversation-a", {
        method: "PATCH",
        headers: { "content-type": "application/json", origin: "http://local.test" },
        body: JSON.stringify({ assignedToId: "user-b" }),
      }),
      { params: Promise.resolve({ id: "conversation-a" }) },
    );
    const body = await result.json();

    expect(result.status).toBe(400);
    expect(body).toEqual({ error: "指派對象不屬於目前工作區。" });
    expect(mocks.db.workspaceUser.findFirst).toHaveBeenCalledWith({
      where: { workspaceId: "workspace-a", userId: "user-b" },
      select: { userId: true },
    });
    expect(mocks.db.conversation.update).not.toHaveBeenCalled();
  });
});
