import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { getChannelConnectOptionState, getOAuthProviderUiState } from "@/lib/channels/channel-connect-visibility";

describe("channel connect visibility", () => {
  it("hides non-Instagram connect options in simple release", () => {
    expect(
      getChannelConnectOptionState("telegram-bot", {
        simpleRelease: true,
        deploymentEnv: "production",
      }),
    ).toEqual({
      visible: false,
      enabled: false,
      disabledReason: "",
      statusLabel: "",
    });
  });

  it("keeps mock visible but disabled on deployed environments", () => {
    expect(
      getChannelConnectOptionState("mock", {
        simpleRelease: false,
        deploymentEnv: "staging",
      }),
    ).toEqual({
      visible: true,
      enabled: false,
      disabledReason: "Mock OAuth 只保留給本機與 QA 測試環境，已部署站台不提供這個入口。",
      statusLabel: "已停用",
    });

    expect(
      getOAuthProviderUiState("mock", {
        simpleRelease: false,
        deploymentEnv: "production",
      }),
    ).toEqual({
      visible: true,
      enabled: false,
      disabledReason: "Mock OAuth 只提供本機與 QA 驗證 popup 流程，已部署站台不開放。",
      statusLabel: "已停用",
    });
  });

  it("allows mock flow in local and test-like environments", () => {
    expect(
      getChannelConnectOptionState("mock", {
        simpleRelease: false,
        deploymentEnv: "development",
      }),
    ).toEqual({
      visible: true,
      enabled: true,
      disabledReason: "",
      statusLabel: "本機 / QA 可用",
    });

    expect(
      getOAuthProviderUiState("mock", {
        simpleRelease: false,
        deploymentEnv: "test",
      }),
    ).toEqual({
      visible: true,
      enabled: true,
      disabledReason: "",
      statusLabel: "本機 / QA 可用",
    });
  });

  it("marks not-yet-launched platforms as visible but disabled", () => {
    expect(
      getChannelConnectOptionState("tiktok", {
        simpleRelease: false,
        deploymentEnv: "production",
      }),
    ).toEqual({
      visible: true,
      enabled: false,
      disabledReason: "這個平台還沒進入正式可用範圍，先保留清楚的受控開通入口，不會打開無效授權流程。",
      statusLabel: "受控開通",
    });

    expect(
      getChannelConnectOptionState("whatsapp", {
        simpleRelease: false,
        deploymentEnv: "staging",
      }),
    ).toEqual({
      visible: true,
      enabled: false,
      disabledReason: "這個平台還沒進入正式可用範圍，先保留清楚的受控開通入口，不會打開無效授權流程。",
      statusLabel: "受控開通",
    });
  });

  it("uses product-facing copy instead of developer disabled wording on the connect page", () => {
    const source = readFileSync("src/app/channels/connect/page.tsx", "utf8");

    expect(source).toContain("受控開通入口");
    expect(source).not.toContain("disabled 入口");
  });
});
