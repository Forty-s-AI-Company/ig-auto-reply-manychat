import { getSafeInstagramProfileRefreshError } from "@/lib/channels/instagram-profile-errors";

export type ChannelActionType = "profile" | "media" | "comments" | "token";

type ChannelActionContext = {
  loginProvider?: "instagram" | "facebook";
  hasStoredToken?: boolean;
};

function normalizeRawMessage(error: unknown) {
  return error instanceof Error ? error.message : typeof error === "string" ? error : "";
}

export function getChannelActionDisabledReason(action: ChannelActionType, context: ChannelActionContext) {
  if (!context.hasStoredToken) {
    return "這個 IG 帳號目前沒有可用授權，請重新登入 Instagram 後再試一次。";
  }

  if (action === "token" && context.loginProvider === "facebook") {
    return "這個帳號是 Facebook 粉專登入，不能直接更新 Instagram 長效權杖，請改用重新連結粉專。";
  }

  return "";
}

export function getSafeChannelActionMessage(action: ChannelActionType, error: unknown) {
  if (action === "profile") {
    return getSafeInstagramProfileRefreshError(error);
  }

  const rawMessage = normalizeRawMessage(error);
  const lowerMessage = rawMessage.toLowerCase();

  if (rawMessage.includes("Unsupported request") || rawMessage.includes("method type: get")) {
    return "Meta 目前沒有允許這個帳號執行該操作。請重新登入 Instagram 後再試一次。";
  }

  if (
    lowerMessage.includes("permission") ||
    lowerMessage.includes("access token") ||
    lowerMessage.includes("invalid oauth") ||
    lowerMessage.includes("token expired") ||
    lowerMessage.includes("session has expired")
  ) {
    if (action === "token") {
      return "Instagram token 已失效或不允許直接 refresh，請重新登入 Instagram 後再試一次。";
    }

    if (action === "comments") {
      return "Instagram 授權不足或已失效，目前無法同步留言觸發。請重新登入 Instagram 後再試一次。";
    }

    return "Instagram 授權不足或已失效，目前無法抓取貼文。請重新登入 Instagram 後再試一次。";
  }

  if (action === "comments") {
    return "目前無法同步留言觸發，請稍後再試。";
  }

  if (action === "token") {
    return "目前無法更新 Instagram 長效權杖，請稍後再試。";
  }

  return "目前無法抓取 Instagram 貼文，請稍後再試。";
}
