import { describe, expect, it } from "vitest";
import { getContactsEmptyState } from "@/lib/contacts-empty-state";

describe("contacts empty state", () => {
  it("keeps filtered empty state focused on clearing current filters", () => {
    const state = getContactsEmptyState({
      activeFilterLabels: ["搜尋「no-result」", "狀態：未知狀態"],
    });

    expect(state.heading).toContain("沒有符合這些篩選條件");
    expect(state.description).toContain("2 個條件");
    expect(state.description).toContain("搜尋「no-result」");
    expect(state.actions).toEqual([
      {
        label: "清除篩選並重新查看",
        testId: "contacts-empty-clear-filters",
      },
    ]);
  });

  it("gives new workspaces clear next steps without pretending CSV import is ready", () => {
    const state = getContactsEmptyState({ activeFilterLabels: [] });

    expect(state.heading).toBe("目前還沒有聯絡人。");
    expect(state.description).toContain("連接 Instagram 帳號");
    expect(state.actions).toEqual([
      {
        label: "連接 Instagram 帳號",
        href: "/channels/connect/social",
        testId: "contacts-empty-connect-instagram",
      },
      {
        label: "前往收件匣",
        href: "/inbox",
        testId: "contacts-empty-open-inbox",
      },
      {
        label: "匯入 CSV",
        disabledReason: "CSV 匯入目前先停用，需完成欄位對應、去重、資料遮罩與匯入稽核後再開放。",
        testId: "contacts-empty-import-disabled",
      },
    ]);
  });

  it("explains when the current IG account is empty even though the workspace already has contacts", () => {
    const state = getContactsEmptyState({
      activeFilterLabels: [],
      isChannelScoped: true,
      workspaceContactCount: 8,
    });

    expect(state.heading).toBe("目前選定的 Instagram 帳號還沒有聯絡人。");
    expect(state.description).toContain("左側切到的 IG 帳號");
    expect(state.actions).toEqual([
      {
        label: "前往收件匣確認",
        href: "/inbox",
        testId: "contacts-empty-open-inbox",
      },
      {
        label: "檢查 IG 連線",
        href: "/channels/connect",
        testId: "contacts-empty-check-channels",
      },
    ]);
  });
});
