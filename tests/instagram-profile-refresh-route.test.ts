import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireApiUser: vi.fn(),
  getCurrentWorkspaceId: vi.fn(),
  encryptMetaConfigJson: vi.fn((value: unknown) => value),
  db: {
    channel: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({ requireApiUser: mocks.requireApiUser }));
vi.mock("@/lib/workspaces", () => ({ getCurrentWorkspaceId: mocks.getCurrentWorkspaceId }));
vi.mock("@/lib/db", () => ({ getDb: () => mocks.db }));
vi.mock("@/lib/channels/meta", () => ({
  buildInstagramChannelName: (username: string, fallbackPageName: string) =>
    username ? `Instagram @${username}` : `Instagram ${fallbackPageName}`,
  encryptMetaConfigJson: mocks.encryptMetaConfigJson,
  getMetaChannelConfig: (value: unknown) => value,
}));

import { POST } from "@/app/api/channels/[id]/instagram-profile/refresh/route";

function callRoute(channelId = "channel-a") {
  return POST(new Request(`http://local.test/api/channels/${channelId}/instagram-profile/refresh`, { method: "POST" }), {
    params: Promise.resolve({ id: channelId }),
  });
}

describe("Instagram profile refresh route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireApiUser.mockResolvedValue({ user: { id: "user-a" }, response: null });
    mocks.getCurrentWorkspaceId.mockResolvedValue("workspace-a");
  });

  it("uses the Instagram Graph profile endpoint first for Instagram Login channels", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "26934693839519360",
        user_id: "26934693839519360",
        username: "carry.digital.nomad",
        name: "Carry",
        profile_picture_url: "https://example.test/avatar.jpg",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    mocks.db.channel.findFirst
      .mockResolvedValueOnce({
        id: "channel-a",
        name: "Instagram ID 26934693839519360",
        configJson: {
          loginProvider: "instagram",
          userAccessToken: "token",
          instagramBusinessAccountId: "26934693839519360",
        },
      })
      .mockResolvedValueOnce(null);
    mocks.db.channel.update.mockResolvedValue({ id: "channel-a", name: "Instagram @carry.digital.nomad" });

    const response = await callRoute();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toContain("https://graph.instagram.com/");
    expect(String(fetchMock.mock.calls[0][0])).not.toContain("https://graph.facebook.com/");
    expect(mocks.db.channel.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "channel-a" },
        data: expect.objectContaining({
          name: "Instagram @carry.digital.nomad",
          enabled: true,
        }),
      }),
    );

    vi.unstubAllGlobals();
  });

  it("returns a safe Chinese error without leaking Meta fbtrace details", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        error: {
          message: "Unsupported request - method type: get",
          fbtrace_id: "Abtoc-Z9F0tUhpSEoCG12Gx",
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    mocks.db.channel.findFirst.mockResolvedValueOnce({
      id: "channel-a",
      name: "Instagram ID 26934693839519360",
      configJson: {
        loginProvider: "instagram",
        userAccessToken: "token",
        instagramBusinessAccountId: "26934693839519360",
      },
    });

    const response = await callRoute();
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("Meta 目前沒有允許");
    expect(body.error).not.toContain("Unsupported request");
    expect(body.error).not.toContain("fbtrace");
    expect(body.error).not.toContain("Abtoc");
    expect(mocks.db.channel.update).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });
});
