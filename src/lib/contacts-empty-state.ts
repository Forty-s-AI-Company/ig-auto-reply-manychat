type ContactsEmptyStateInput = {
  activeFilterLabels: string[];
  isChannelScoped?: boolean;
  workspaceContactCount?: number;
};

export type ContactsEmptyStateAction = {
  label: string;
  href?: string;
  disabledReason?: string;
  testId: string;
};

type ContactsEmptyState = {
  heading: string;
  description: string;
  actions: ContactsEmptyStateAction[];
};

export function getContactsEmptyState(input: ContactsEmptyStateInput): ContactsEmptyState {
  const activeFilterLabels = input.activeFilterLabels.filter((label) => label.trim().length > 0);
  const hasActiveFilters = activeFilterLabels.length > 0;
  const workspaceContactCount = input.workspaceContactCount || 0;

  if (hasActiveFilters) {
    return {
      heading: "目前沒有符合這些篩選條件的聯絡人。",
      description: `你現在套用了 ${activeFilterLabels.length} 個條件：${activeFilterLabels.join("、")}。先清除篩選回到完整聯絡人清單，再繼續找人。`,
      actions: [
        {
          label: "清除篩選並重新查看",
          testId: "contacts-empty-clear-filters",
        },
      ] satisfies ContactsEmptyStateAction[],
    };
  }

  if (input.isChannelScoped && workspaceContactCount > 0) {
    return {
      heading: "目前選定的 Instagram 帳號還沒有聯絡人。",
      description:
        "這通常不是壞掉，而是你現在左側切到的 IG 帳號還沒有同步到對話或聯絡人。可以先回收件匣確認這個帳號是否已有新訊息，或到設定檢查 / 切換 Instagram 連線。",
      actions: [
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
      ] satisfies ContactsEmptyStateAction[],
    };
  }

  return {
    heading: "目前還沒有聯絡人。",
    description:
      "聯絡人會在 Instagram 對話、留言同步或手動匯入流程完成後出現在這裡。現在可以先連接 Instagram 帳號，或到收件匣確認是否已有可同步的對話。",
    actions: [
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
    ] satisfies ContactsEmptyStateAction[],
  };
}
