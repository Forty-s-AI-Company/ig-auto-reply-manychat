type ContactsEmptyStateInput = {
  activeFilterLabels: string[];
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
