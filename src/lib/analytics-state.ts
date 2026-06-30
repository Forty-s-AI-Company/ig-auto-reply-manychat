export type AnalyticsSummarySnapshot = {
  contacts: number;
  messages: number;
  recentMessages: number;
  openConversations: number;
  broadcasts: number;
  queuedBroadcasts: number;
  sentCount: number;
  failedCount: number;
  automations: number;
  enabledAutomations: number;
  connectedInstagramChannels: number;
  selectedChannelDisplayName?: string | null;
};

export type AnalyticsState = {
  scopeBadge: string;
  scopeDetail: string;
  bannerTone: "info" | "warning" | "danger" | "success";
  bannerTitle: string;
  bannerBody: string;
  bannerActionLabel?: string;
  bannerActionHref?: string;
  recentMessagesTitle: string;
  recentMessagesBody: string;
  recentAutomationsTitle: string;
  recentAutomationsBody: string;
  deliveryRateLabel: string;
  deliveryRateHint: string;
  automationRateLabel: string;
  automationRateHint: string;
  hasAnalyticsData: boolean;
};

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function hasAnyAnalyticsData(summary: AnalyticsSummarySnapshot) {
  return (
    summary.contacts > 0 ||
    summary.messages > 0 ||
    summary.recentMessages > 0 ||
    summary.openConversations > 0 ||
    summary.broadcasts > 0 ||
    summary.queuedBroadcasts > 0 ||
    summary.sentCount > 0 ||
    summary.failedCount > 0 ||
    summary.automations > 0 ||
    summary.enabledAutomations > 0
  );
}

export function buildAnalyticsState(summary: AnalyticsSummarySnapshot, summaryError?: string | null): AnalyticsState {
  const selectedScope = summary.selectedChannelDisplayName ? `單一 IG 帳號：${summary.selectedChannelDisplayName}` : "工作區全域";
  const connectedInstagramChannels = summary.connectedInstagramChannels;
  const deliveryCount = summary.sentCount + summary.failedCount;
  const hasAnalyticsData = hasAnyAnalyticsData(summary);

  const baseState: AnalyticsState = {
    scopeBadge: selectedScope,
    scopeDetail: summary.selectedChannelDisplayName
      ? `目前左側選擇的是「${summary.selectedChannelDisplayName}」，這裡只會切換分析範圍，不會切出另一份資料。`
      : "目前看的是整個工作區的分析資料；若要縮小範圍，可以從左側切換 IG 帳號。",
    bannerTone: "info",
    bannerTitle: summary.selectedChannelDisplayName
      ? `目前只看「${summary.selectedChannelDisplayName}」的資料`
      : "目前看整個工作區的資料",
    bannerBody: summary.selectedChannelDisplayName
      ? "切換帳號只會改變分析範圍，不會把資料拆成另一份。"
      : "如果想檢查單一 IG 帳號，請從左側帳號切換器選擇對應項目。",
    recentMessagesTitle: "還沒有最近訊息",
    recentMessagesBody: connectedInstagramChannels > 0
      ? summary.selectedChannelDisplayName
        ? `目前只看「${summary.selectedChannelDisplayName}」，這個帳號還沒有最近訊息。可以先送一則測試訊息。`
        : "這個工作區還沒有最近訊息。可以先送一則測試訊息，分析頁就會開始累積資料。"
      : "先完成 Instagram 連接，再送一則測試訊息，這裡才會開始顯示最近訊息。",
    recentAutomationsTitle: "還沒有自動化紀錄",
    recentAutomationsBody:
      connectedInstagramChannels > 0
        ? "先建立第一個關鍵字回覆或預設回覆，這裡就會開始出現自動化紀錄。"
        : "先連接 Instagram 帳號，再建立第一個關鍵字回覆或預設回覆。",
    deliveryRateLabel: deliveryCount > 0 ? formatPercent(summary.sentCount / deliveryCount) : "尚未有發送紀錄",
    deliveryRateHint:
      deliveryCount > 0
        ? `成功 ${summary.sentCount} / 失敗 ${summary.failedCount}`
        : "先建立廣播或完成一筆發送，送達率才會開始有意義。",
    automationRateLabel: summary.automations > 0 ? formatPercent(summary.enabledAutomations / summary.automations) : "尚未建立流程",
    automationRateHint:
      summary.automations > 0
        ? `啟用 ${summary.enabledAutomations} / 全部 ${summary.automations}`
        : "先建立第一個自動化流程，啟用率才會開始有意義。",
    hasAnalyticsData,
  };

  if (summaryError) {
    return {
      ...baseState,
      bannerTone: "danger",
      bannerTitle: "分析資料暫時載入失敗",
      bannerBody: "頁面先保留外殼與導覽，請稍後再重新整理。若問題持續，先檢查資料庫與連線狀態。",
      recentMessagesTitle: "最近訊息暫時無法載入",
      recentMessagesBody: "分析資料目前讀取失敗，先稍後再試。",
      recentAutomationsTitle: "最近自動化暫時無法載入",
      recentAutomationsBody: "分析資料目前讀取失敗，先稍後再試。",
    };
  }

  if (connectedInstagramChannels === 0) {
    return {
      ...baseState,
      bannerTone: "warning",
      bannerTitle: "尚未連接 Instagram 帳號",
      bannerBody:
        "目前沒有可分析的 IG 資料。先到 Channels 完成連接，這裡才會開始累積留言、對話與廣播數字；如果你明明已經連線，請回到 Channels 檢查授權與啟用狀態。",
      bannerActionLabel: "連接 IG 帳號",
      bannerActionHref: "/channels/connect",
    };
  }

  if (!hasAnalyticsData) {
    return {
      ...baseState,
      bannerTone: "info",
      bannerTitle: "目前還沒有足夠資料",
      bannerBody: summary.selectedChannelDisplayName
        ? `「${summary.selectedChannelDisplayName}」已連接，但還沒有累積到足夠的訊息或自動化紀錄。先送一則測試訊息或建立第一個流程。`
        : "這個工作區已經連上 Instagram，但還沒有累積到足夠的訊息或自動化紀錄。先送一則測試訊息或建立第一個流程。",
      bannerActionLabel: "建立第一個流程",
      bannerActionHref: "/automations",
      recentMessagesBody: summary.selectedChannelDisplayName
        ? `目前只看「${summary.selectedChannelDisplayName}」，這個帳號還沒有最近訊息。可以先送一則測試訊息。`
        : "這個工作區還沒有最近訊息。可以先送一則測試訊息，分析頁就會開始累積資料。",
      recentAutomationsBody: "先建立第一個關鍵字回覆或預設回覆，這裡就會開始出現自動化紀錄。",
    };
  }

  return {
    ...baseState,
    bannerTone: summary.selectedChannelDisplayName ? "success" : "info",
    bannerTitle: summary.selectedChannelDisplayName
      ? `目前只看「${summary.selectedChannelDisplayName}」的資料`
      : "目前看整個工作區的資料",
    bannerBody: summary.selectedChannelDisplayName
      ? "切換帳號只會改變分析範圍，不會把資料拆成另一份。"
      : "如果想檢查單一 IG 帳號，請從左側帳號切換器選擇對應項目。",
  };
}
