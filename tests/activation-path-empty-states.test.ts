import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const dashboardSource = readFileSync("src/app/dashboard/page.tsx", "utf8");
const inboxSource = readFileSync("src/components/InboxClient.tsx", "utf8");
const contactsSource = readFileSync("src/components/ContactsListClient.tsx", "utf8");
const automationsSource = readFileSync("src/components/AutomationBuilderClient.tsx", "utf8");
const socialConnectSource = readFileSync("src/app/channels/connect/social/page.tsx", "utf8");

describe("new-user activation empty states", () => {
  it("gives dashboard empty CTAs visible focus and decorative icons", () => {
    expect(dashboardSource).toContain('data-testid="dashboard-recent-messages-empty-cta"');
    expect(dashboardSource).toContain('data-testid="dashboard-recent-automations-empty-cta"');
    expect(dashboardSource).toContain("focus-visible:ring-[var(--primary)]");
    expect(dashboardSource).toContain('<ArrowRight className="h-4 w-4" aria-hidden="true" />');
  });

  it("turns a totally empty Inbox into an onboarding path instead of a filter dead end", () => {
    expect(inboxSource).toContain('data-testid={conversations.length === 0 ? "inbox-empty-onboarding" : "inbox-filter-empty"}');
    expect(inboxSource).toContain("還沒有任何對話");
    expect(inboxSource).toContain("先連接 Instagram 帳號");
    expect(inboxSource).toContain('data-testid="inbox-empty-connect-instagram"');
    expect(inboxSource).toContain('data-testid="inbox-empty-open-dashboard"');
    expect(inboxSource).toContain('data-testid="inbox-empty-manage-tags"');
    expect(inboxSource).toContain("目前沒有符合條件的對話。");
  });

  it("keeps post-connect Inbox icon actions accessible", () => {
    expect(inboxSource).toContain('data-testid="inbox-favorite-toggle"');
    expect(inboxSource).toContain('aria-label={selected.isFavorite ? "取消收藏對話" : "收藏對話"}');
    expect(inboxSource).toContain('<Video className="h-5 w-5" aria-hidden="true" />');
    expect(inboxSource).toContain('data-testid="inbox-reminder-toggle"');
    expect(inboxSource).toContain('aria-label={reminderOpen ? "關閉提醒選單" : "開啟提醒選單"}');
    expect(inboxSource).toContain('data-testid="inbox-mark-read-button"');
    expect(inboxSource).toContain('aria-label="標記這則對話為已讀"');
  });

  it("keeps Contacts empty-state CTAs keyboard-visible", () => {
    expect(contactsSource).toContain('data-testid={action.testId}');
    expect(contactsSource).toContain("focus-visible:ring-[#006fe6]");
    expect(contactsSource).toContain("前往標籤管理");
    expect(contactsSource).toContain("flex min-h-[calc(100vh-100px)] overflow-hidden");
    expect(contactsSource).toContain("flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap");
    expect(contactsSource).toContain('data-testid="contacts-create-segment-button"');
  });

  it("gives Automations first-run empty state a next step and a safer fallback path", () => {
    expect(automationsSource).toContain('data-testid="automation-list-empty"');
    expect(automationsSource).toContain("新工作區可以先從 Instagram 預設回覆或空白流程開始");
    expect(automationsSource).toContain('data-testid="automation-header-create-cta"');
    expect(automationsSource).toContain('data-testid="automation-empty-create-cta"');
    expect(automationsSource).toContain('data-testid="automation-empty-basic-cta"');
    expect(automationsSource).toContain('setTemplateDialogOpen(true)');
    expect(automationsSource).toContain('setActiveTab("basic")');
  });

  it("keeps Social connect actions keyboard-visible and decorative icons quiet", () => {
    expect(socialConnectSource).toContain("focus-visible:ring-[#006fe6]");
    expect(socialConnectSource).toContain("focus-visible:ring-[#b54708]");
    expect(socialConnectSource).toContain('<Icon className="h-5 w-5" aria-hidden="true" />');
    expect(socialConnectSource).toContain('<AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />');
    expect(socialConnectSource).toContain('<Link2 className="h-4 w-4 text-[#006fe6]" aria-hidden="true" />');
  });
});
