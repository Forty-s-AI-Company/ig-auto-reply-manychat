import type { InboxPilotDeploymentEnv } from "@/lib/deployment-env";
import type { OAuthProviderId } from "@/lib/oauth/types";

export type ChannelConnectOptionId =
  | "instagram"
  | "telegram-bot"
  | "mock"
  | "tiktok"
  | "whatsapp";

type VisibilityContext = {
  simpleRelease: boolean;
  deploymentEnv: InboxPilotDeploymentEnv;
};

function isMockUiAllowed(deploymentEnv: InboxPilotDeploymentEnv) {
  return deploymentEnv === "development" || deploymentEnv === "test" || deploymentEnv === "unknown";
}

export function getChannelConnectOptionState(optionId: ChannelConnectOptionId, context: VisibilityContext) {
  if (context.simpleRelease && optionId !== "instagram") {
    return {
      visible: false,
      enabled: false,
      disabledReason: "",
    };
  }

  if (optionId === "mock") {
    const enabled = isMockUiAllowed(context.deploymentEnv);
    return {
      visible: true,
      enabled,
      disabledReason: enabled ? "" : "Mock OAuth 只保留給本機與 QA 測試環境，已部署站台不提供這個入口。",
    };
  }

  if (optionId === "tiktok" || optionId === "whatsapp") {
    return {
      visible: true,
      enabled: false,
      disabledReason: "這個平台尚未進入正式可用範圍，先保留清楚的 disabled 入口。",
    };
  }

  return {
    visible: true,
    enabled: true,
    disabledReason: "",
  };
}

export function getOAuthProviderUiState(providerId: OAuthProviderId, context: VisibilityContext) {
  if (context.simpleRelease && providerId !== "meta-instagram") {
    return {
      visible: false,
      enabled: false,
      disabledReason: "",
    };
  }

  if (providerId === "mock") {
    const enabled = isMockUiAllowed(context.deploymentEnv);
    return {
      visible: true,
      enabled,
      disabledReason: enabled ? "" : "Mock OAuth 只提供本機與 QA 驗證 popup 流程，已部署站台不開放。",
    };
  }

  return {
    visible: true,
    enabled: true,
    disabledReason: "",
  };
}
