import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const profileMenuSource = readFileSync("src/components/InboxPilotProfileMenu.tsx", "utf8");
const profilePageSource = readFileSync("src/app/profile/page.tsx", "utf8");
const accountChannelListSource = readFileSync("src/lib/account-channel-list.ts", "utf8");
const inboxSource = readFileSync("src/components/InboxClient.tsx", "utf8");
const mobileNavSource = readFileSync("src/components/AdminMobileNav.tsx", "utf8");
const channelsPageSource = readFileSync("src/app/channels/page.tsx", "utf8");

describe("profile menu and settings IA copy", () => {
  it("keeps the profile menu centered on mainstream SaaS account, plan, settings, and support actions", () => {
    expect(profileMenuSource).toContain("目前方案");
    expect(profileMenuSource).toContain("方案與用量");
    expect(profileMenuSource).toContain("設定與支援");
    expect(profileMenuSource).toContain("AI 設定");
    expect(profileMenuSource).toContain("API 與模型設定");
    expect(profileMenuSource).toContain("說明中心");
    expect(profileMenuSource).toContain("English（即將推出）");
    expect(profileMenuSource).not.toContain("英文介面會在翻譯");
    expect(profileMenuSource).not.toContain('label="社群平台"');
    expect(profileMenuSource).not.toContain("進階功能");
    expect(profileMenuSource).not.toContain("排隊中");
  });

  it("keeps profile menu controls keyboard and form friendly", () => {
    expect(profileMenuSource).toContain("aria-controls={open ? menuId : undefined}");
    expect(profileMenuSource).toContain('name="interfaceLanguage"');
    expect(profileMenuSource).toContain("focus-visible:ring");
  });

  it("keeps mobile navigation controls keyboard visible", () => {
    expect(mobileNavSource).toContain('aria-label="開啟選單"');
    expect(mobileNavSource).toContain('aria-label="關閉選單"');
    expect(mobileNavSource).toContain("focus-visible:ring-[var(--primary)]");
    expect(mobileNavSource).toContain("focus-visible:ring-[#19d3d8]");
    expect(mobileNavSource).toContain("focus-visible:ring-offset-[var(--sidebar-bg-dark)]");
    expect(mobileNavSource).toContain('aria-hidden="true"');
  });

  it("keeps logout recoverable when the API request fails", () => {
    expect(profileMenuSource).toContain("登出失敗，請稍後再試。");
    expect(profileMenuSource).toContain("登出失敗，請確認網路連線後再試一次。");
    expect(profileMenuSource).toContain("disabled={loggingOut}");
    expect(profileMenuSource).toContain('role="alert"');
  });

  it("keeps the profile page from presenting read-only account facts as editable inputs", () => {
    expect(profilePageSource).toContain("function ProfileFact");
    expect(profilePageSource).not.toContain("readOnly");
    expect(profilePageSource).not.toContain("<input");
    expect(profilePageSource).toContain("focus-visible:ring-[#006fe6]");
    expect(profilePageSource).toContain("新增登入方式受控開通");
    expect(profilePageSource).toContain("aria-describedby=\"profile-login-provider-disabled-reason\"");
    expect(profilePageSource).not.toContain("Apple、Telegram 登入方式先保留入口");
  });

  it("uses settings language for account metadata recovery and simple-release feature gates", () => {
    expect(accountChannelListSource).toContain("可到「設定」重新讀取");
    expect(accountChannelListSource).not.toContain("可到「渠道」重新讀取");
    expect(inboxSource).toContain("Instagram 設定、分析與自動化核心流程");
  });

  it("keeps reviewer-facing owner and contact details at the bottom of settings", () => {
    expect(channelsPageSource).toContain("關於 InboxPilot");
    expect(channelsPageSource).toContain("2026 Luo Shih Lin All rights reserved.");
    expect(channelsPageSource).toContain("Copyright© Luo Shih Lin");
    expect(channelsPageSource).toContain("InboxPilot is operated by Luo Shih Lin.");
    expect(channelsPageSource).toContain("zeroyuanbrothers@gmail.com");
    expect(channelsPageSource).toContain("https://inboxpilot.carry-digital-nomad.in.net/");
  });

  it("keeps the settings left nav reduced to top-level sections only", () => {
    expect(channelsPageSource).toContain('label: "方案與用量", href: "/billing"');
    expect(channelsPageSource).toContain('label: "AI 設定", href: "/ai-settings"');
    expect(channelsPageSource).toContain('label: "社群平台"');
    expect(channelsPageSource).toContain('label: "關於 InboxPilot"');
    expect(channelsPageSource).not.toContain('title: "主要設定"');
    expect(channelsPageSource).not.toContain("工作區設定");
    expect(channelsPageSource).not.toContain("通知設定");
    expect(channelsPageSource).not.toContain("操作紀錄");
  });

  it("keeps settings mobile navigation and header CTA concise", () => {
    expect(channelsPageSource).toContain('aria-label="設定快速導覽"');
    expect(channelsPageSource).toContain("snap-mandatory");
    expect(channelsPageSource).toContain("新增帳號");
    expect(channelsPageSource).toContain("+ 新增平台帳號");
    expect(channelsPageSource).toContain("lg:overflow-y-auto");
  });

  it("keeps platform cards and connected account details readable across desktop and mobile", () => {
    expect(channelsPageSource).toContain("flex h-full flex-col rounded-lg border border-[#d7dbe0] bg-white p-4");
    expect(channelsPageSource).toContain("md:flex-col md:items-end");
    expect(channelsPageSource).toContain("sm:grid-cols-2 xl:grid-cols-4");
    expect(channelsPageSource).toContain("未開放");
    expect(channelsPageSource).not.toContain("Mock OAuth Provider");
    expect(channelsPageSource).not.toContain("規劃中");
  });
});
