const DEFAULT_PROFILE_REFRESH_ERROR =
  "Instagram 目前沒有回傳帳號名稱與頭像。請稍後再試，或重新登入 Instagram 後再讀取一次。";

export function getSafeInstagramProfileRefreshError(error: unknown) {
  const rawMessage = error instanceof Error ? error.message : typeof error === "string" ? error : "";

  if (!rawMessage.trim()) return DEFAULT_PROFILE_REFRESH_ERROR;

  if (rawMessage.includes("Unsupported request") || rawMessage.includes("method type: get")) {
    return "Meta 目前沒有允許用這個授權方式讀取帳號名稱與頭像。請先確認此 IG 帳號仍授權 InboxPilot，或重新登入 Instagram 後再試一次。";
  }

  if (rawMessage.includes("permission") || rawMessage.includes("access token")) {
    return "Instagram 授權不足或 token 已失效，請重新登入 Instagram 後再試一次。";
  }

  return DEFAULT_PROFILE_REFRESH_ERROR;
}
