import { describe, expect, it } from "vitest";
import { buildAccountDropdownChannels } from "@/lib/account-channel-list";
import { readFileSync } from "node:fs";

describe("buildAccountDropdownChannels", () => {
  it("keeps Instagram channels even when profile details are incomplete", () => {
    const channels = buildAccountDropdownChannels([
      {
        id: "channel-with-id-only",
        name: "Instagram ID 26934693839519360",
        configJson: {
          loginProvider: "instagram",
          instagramBusinessAccountId: "26934693839519360",
        },
      },
      {
        id: "channel-with-username",
        name: "Instagram @carry.digital.nomad",
        configJson: {
          loginProvider: "instagram",
          instagramUsername: "carry.digital.nomad",
          instagramName: "Carry",
        },
      },
    ]);

    expect(channels).toHaveLength(2);
    expect(channels).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "channel-with-id-only",
          displayName: "Instagram 帳號 26934693839519360",
          subtitle: "尚未取得帳號名稱與頭像，可到「設定」重新讀取",
          username: "",
          avatarFallback: "IG",
          metadataStatus: "partial",
          metadataHint: "資料未完整",
        }),
        expect.objectContaining({
          id: "channel-with-username",
          displayName: "Carry",
          subtitle: "@carry.digital.nomad",
          username: "carry.digital.nomad",
          avatarFallback: "CA",
          metadataStatus: "complete",
          metadataHint: "",
        }),
      ]),
    );
  });
});

describe("InboxPilotAccountDropdown feedback", () => {
  it("keeps Instagram account switch failures visible to users", () => {
    const source = readFileSync("src/components/InboxPilotAccountDropdown.tsx", "utf8");

    expect(source).toContain("切換 Instagram 帳號失敗，請稍後再試。");
    expect(source).toContain("切換 Instagram 帳號失敗，請確認網路連線後再試一次。");
    expect(source).toContain('aria-live="polite"');
    expect(source).not.toContain("if (!response.ok) return;");
  });
});

describe("IgAccountSwitcher feedback", () => {
  it("keeps legacy Instagram switch failures visible to users", () => {
    const source = readFileSync("src/components/IgAccountSwitcher.tsx", "utf8");

    expect(source).toContain("切換 Instagram 帳號失敗，請稍後再試。");
    expect(source).toContain("切換 Instagram 帳號失敗，請確認網路連線後再試一次。");
    expect(source).toContain('aria-live="polite"');
    expect(source).not.toContain("if (!response.ok) {\\n      setValue(selectedChannelId || \"all\");\\n      return;\\n    }");
  });
});
