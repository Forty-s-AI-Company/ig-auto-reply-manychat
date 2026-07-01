import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const profileMenuSource = readFileSync("src/components/InboxPilotProfileMenu.tsx", "utf8");
const accountChannelListSource = readFileSync("src/lib/account-channel-list.ts", "utf8");
const inboxSource = readFileSync("src/components/InboxClient.tsx", "utf8");

describe("profile menu and settings IA copy", () => {
  it("keeps the profile menu centered on mainstream SaaS account, plan, settings, and support actions", () => {
    expect(profileMenuSource).toContain("目前方案");
    expect(profileMenuSource).toContain("方案與用量");
    expect(profileMenuSource).toContain("設定與支援");
    expect(profileMenuSource).toContain("AI 設定");
    expect(profileMenuSource).toContain("API 與應用程式");
    expect(profileMenuSource).toContain("說明中心");
    expect(profileMenuSource).not.toContain("進階功能");
    expect(profileMenuSource).not.toContain("排隊中");
  });

  it("keeps profile menu controls keyboard and form friendly", () => {
    expect(profileMenuSource).toContain("aria-controls={open ? menuId : undefined}");
    expect(profileMenuSource).toContain('name="interfaceLanguage"');
    expect(profileMenuSource).toContain("focus-visible:ring");
  });

  it("keeps logout recoverable when the API request fails", () => {
    expect(profileMenuSource).toContain("登出失敗，請稍後再試。");
    expect(profileMenuSource).toContain("登出失敗，請確認網路連線後再試一次。");
    expect(profileMenuSource).toContain("disabled={loggingOut}");
    expect(profileMenuSource).toContain('aria-live="polite"');
  });

  it("uses settings language for account metadata recovery and simple-release feature gates", () => {
    expect(accountChannelListSource).toContain("可到「設定」重新讀取");
    expect(accountChannelListSource).not.toContain("可到「渠道」重新讀取");
    expect(inboxSource).toContain("Instagram 設定、分析與自動化核心流程");
  });
});
