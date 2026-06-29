import { describe, expect, it } from "vitest";
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
    });
  });
});
