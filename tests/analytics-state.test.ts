import { describe, expect, it } from "vitest";
import { buildAnalyticsState } from "@/lib/analytics-state";

describe("buildAnalyticsState", () => {
  it("describes missing Instagram connections as a warning state", () => {
    const state = buildAnalyticsState({
      contacts: 0,
      messages: 0,
      recentMessages: 0,
      openConversations: 0,
      broadcasts: 0,
      queuedBroadcasts: 0,
      sentCount: 0,
      failedCount: 0,
      automations: 0,
      enabledAutomations: 0,
      connectedInstagramChannels: 0,
      selectedChannelDisplayName: null,
    });

    expect(state.bannerTone).toBe("warning");
    expect(state.bannerTitle).toBe("尚未連接 Instagram 帳號");
    expect(state.bannerActionHref).toBe("/channels/connect");
    expect(state.bannerBody).toContain("設定");
    expect(state.bannerBody).not.toContain("Channels");
    expect(state.deliveryRateLabel).toBe("尚未有發送紀錄");
    expect(state.automationRateLabel).toBe("尚未建立流程");
  });

  it("describes an empty but connected analytics state", () => {
    const state = buildAnalyticsState({
      contacts: 0,
      messages: 0,
      recentMessages: 0,
      openConversations: 0,
      broadcasts: 0,
      queuedBroadcasts: 0,
      sentCount: 0,
      failedCount: 0,
      automations: 0,
      enabledAutomations: 0,
      connectedInstagramChannels: 1,
      selectedChannelDisplayName: "Carry",
    });

    expect(state.bannerTone).toBe("info");
    expect(state.bannerTitle).toBe("目前還沒有足夠資料");
    expect(state.scopeBadge).toBe("單一 IG 帳號：Carry");
    expect(state.recentMessagesBody).toContain("Carry");
    expect(state.bannerActionHref).toBe("/automations");
  });

  it("describes active scope and rate labels when data exists", () => {
    const state = buildAnalyticsState({
      contacts: 8,
      messages: 21,
      recentMessages: 6,
      openConversations: 2,
      broadcasts: 3,
      queuedBroadcasts: 1,
      sentCount: 18,
      failedCount: 2,
      automations: 4,
      enabledAutomations: 3,
      connectedInstagramChannels: 2,
      selectedChannelDisplayName: "Carry",
    });

    expect(state.bannerTone).toBe("success");
    expect(state.hasAnalyticsData).toBe(true);
    expect(state.deliveryRateLabel).toBe("90%");
    expect(state.deliveryRateHint).toBe("成功 18 / 失敗 2");
    expect(state.automationRateLabel).toBe("75%");
    expect(state.scopeDetail).toContain("Carry");
  });

  it("falls back to a safe failure banner when data loading errors", () => {
    const state = buildAnalyticsState(
      {
        contacts: 1,
        messages: 1,
        recentMessages: 1,
        openConversations: 1,
        broadcasts: 1,
        queuedBroadcasts: 0,
        sentCount: 1,
        failedCount: 0,
        automations: 1,
        enabledAutomations: 1,
        connectedInstagramChannels: 1,
        selectedChannelDisplayName: null,
      },
      "database unavailable",
    );

    expect(state.bannerTone).toBe("danger");
    expect(state.bannerTitle).toBe("分析資料暫時載入失敗");
    expect(state.recentMessagesTitle).toBe("最近訊息暫時無法載入");
    expect(state.recentAutomationsTitle).toBe("最近自動化暫時無法載入");
  });
});
