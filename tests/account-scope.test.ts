import { describe, expect, it } from "vitest";
import { inboxChannelWhere, instagramChannelWhere } from "@/lib/account-scope";

describe("account scope helpers", () => {
  it("keeps explicit Instagram channel scope when a channel is selected", () => {
    expect(inboxChannelWhere("channel-1", "workspace-1")).toEqual(
      instagramChannelWhere("channel-1", "workspace-1"),
    );
  });

  it("uses all enabled workspace channels when no Instagram account is selected", () => {
    expect(inboxChannelWhere(undefined, "workspace-1")).toEqual({
      channel: {
        workspaceId: "workspace-1",
        enabled: true,
      },
    });
  });
});
