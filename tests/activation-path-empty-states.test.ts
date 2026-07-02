import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const dashboardSource = readFileSync("src/app/dashboard/page.tsx", "utf8");
const inboxSource = readFileSync("src/components/InboxClient.tsx", "utf8");
const contactsSource = readFileSync("src/components/ContactsListClient.tsx", "utf8");
const automationsSource = readFileSync("src/components/AutomationBuilderClient.tsx", "utf8");

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

  it("keeps Contacts empty-state CTAs keyboard-visible", () => {
    expect(contactsSource).toContain('data-testid={action.testId}');
    expect(contactsSource).toContain("focus-visible:ring-[#006fe6]");
    expect(contactsSource).toContain("前往標籤管理");
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
});
