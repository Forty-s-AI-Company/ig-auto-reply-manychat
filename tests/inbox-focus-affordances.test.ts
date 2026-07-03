import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("src/components/InboxClient.tsx", "utf8");

describe("Inbox focus affordances", () => {
  it("keeps the conversation header and composer keyboard-visible", () => {
    expect(source).toContain('data-testid="inbox-back-to-list"');
    expect(source).toContain('data-testid="inbox-assignee-select"');
    expect(source).toContain('data-testid="inbox-select-all-disabled-reason"');
    expect(source).toContain('aria-describedby={selectedVisibleIds.length === 0 ? "inbox-select-all-disabled-reason" : undefined}');
    expect(source).toContain('<ChevronDown className="h-4 w-4 text-[#98a2b3]" aria-hidden="true" />');
    expect(source).toContain('aria-pressed={activeTab === "reply"}');
    expect(source).toContain('aria-pressed={activeTab === "note"}');
    expect(source).toContain("focus:border-[#006fe6] focus:ring-2 focus:ring-[#dbeafe]");
  });

  it("keeps reusable inbox controls from losing focus rings", () => {
    expect(source).toContain("function InboxNavItem");
    expect(source).toContain("function ToolbarButton");
    expect(source).toContain("function ComposerIconButton");
    expect(source).toContain("function MobileChip");
    expect(source).toContain("function MobilePaneButton");
    expect(source).toContain("focus-visible:ring-[#006fe6]");
  });

  it("keeps the contact side panel actions accessible", () => {
    expect(source).toContain('data-testid="inbox-contact-actions-button"');
    expect(source).toContain('data-testid="inbox-quick-hot-tag"');
    expect(source).toContain('data-testid="inbox-quick-partner-tag"');
    expect(source).toContain('data-testid="inbox-apply-tag-select"');
    expect(source).toContain("focus-visible:ring-white focus-visible:ring-offset-2");
  });

  it("keeps inbox filter panel controls keyboard-visible", () => {
    expect(source).toContain('data-testid="inbox-filter-panel"');
    expect(source).toContain('data-testid="inbox-filter-status"');
    expect(source).toContain('data-testid="inbox-filter-unread"');
    expect(source).toContain('data-testid="inbox-filter-sort"');
    expect(source).toContain('data-testid="inbox-filter-tag"');
    expect(source).toContain('data-testid="inbox-filter-team"');
    expect(source).toContain('data-testid="inbox-reset-filters"');
    expect(source).toContain('data-testid="inbox-close-filter-panel"');
    expect(source).toContain("focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006fe6] focus-visible:ring-offset-2");
  });

  it("keeps setup reply suggestions aligned to the Instagram launch scope", () => {
    expect(source).toContain("Meta 商業資產");
    expect(source).not.toContain("Meta / Facebook 資產");
  });
});
