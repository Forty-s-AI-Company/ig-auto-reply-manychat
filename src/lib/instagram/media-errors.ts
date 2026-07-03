export type InstagramMediaError = {
  message: string;
  status: number;
  code: "TOKEN_EXPIRED" | "TOKEN_INVALID" | "MEDIA_READ_FAILED";
  actionHref?: string;
};

export function normalizeInstagramMediaError(error: unknown): InstagramMediaError {
  const rawMessage = error instanceof Error ? error.message : "";
  const lowerMessage = rawMessage.toLowerCase();
  const isExpired =
    lowerMessage.includes("session has expired") ||
    lowerMessage.includes("access token has expired") ||
    lowerMessage.includes("token expired");
  const isTokenInvalid =
    isExpired ||
    lowerMessage.includes("error validating access token") ||
    lowerMessage.includes("invalid oauth") ||
    lowerMessage.includes("invalid access token");
  const isPermissionDenied =
    lowerMessage.includes("unsupported request") ||
    lowerMessage.includes("permission") ||
    lowerMessage.includes("permissions error") ||
    lowerMessage.includes("not authorized") ||
    lowerMessage.includes("requires business");

  if (isExpired) {
    return {
      status: 401,
      code: "TOKEN_EXPIRED",
      message: "Instagram 授權已過期，請重新連接這個 IG 帳號後再抓取貼文。",
      actionHref: "/channels/connect/social",
    };
  }

  if (isTokenInvalid) {
    return {
      status: 401,
      code: "TOKEN_INVALID",
      message: "Instagram 授權目前無法使用，請重新連接這個 IG 帳號。",
      actionHref: "/channels/connect/social",
    };
  }

  if (isPermissionDenied) {
    return {
      status: 403,
      code: "MEDIA_READ_FAILED",
      message: "Meta 目前沒有允許這個帳號讀取 Instagram 貼文。請確認 App Review 權限、測試帳號與 IG 專業帳號設定後再試一次。",
      actionHref: "/channels/connect/social",
    };
  }

  return {
    status: 400,
    code: "MEDIA_READ_FAILED",
    message: "目前無法讀取 Instagram 貼文，請稍後再試。",
  };
}
