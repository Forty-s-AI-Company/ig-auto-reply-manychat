const DEFAULT_INSTAGRAM_OAUTH_CALLBACK_PATH = "/api/instagram/oauth/callback";

export type MetaOauthMode = "instagram" | "facebook";

function requiredAnyEnv(...names: string[]) {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }

  throw new Error(`${names.join(" or ")} is not configured.`);
}

export function getMetaOauthErrorCode(reason: string) {
  const normalized = reason.toLowerCase();
  if (normalized === "invalid_state" || normalized.includes("state verification")) return "invalid_state";
  if (normalized.includes("access_denied") || normalized.includes("user_denied") || normalized.includes("cancel")) {
    return "access_denied";
  }
  if (
    normalized.includes("permission") ||
    normalized.includes("scope") ||
    normalized.includes("manage_messages") ||
    normalized.includes("messaging") ||
    normalized.includes("advanced access") ||
    normalized.includes("app review")
  ) {
    return "missing_permissions";
  }
  if (
    normalized.includes("usable instagram channels") ||
    normalized.includes("no usable") ||
    normalized.includes("instagram channels") ||
    normalized.includes("business accounts")
  ) {
    return "no_instagram_channel";
  }
  if (normalized.includes("not configured") || normalized.includes("redirect_uri") || normalized.includes("redirect uri")) {
    return "meta_configuration";
  }
  return "meta_oauth_failed";
}

export function getMetaOauthUserMessage(reason: string, mode: MetaOauthMode) {
  const code = getMetaOauthErrorCode(reason);
  if (code === "invalid_state") {
    return "連接失敗：登入驗證已失效或來源不一致，請回到連接頁重新發起 Instagram 授權。";
  }
  if (code === "access_denied") {
    return "連接已取消：你在 Meta 或 Instagram 授權頁取消了連接，請重新點擊 Instagram 連接。";
  }
  if (code === "missing_permissions") {
    return "連接失敗：Meta 未核發 Instagram 訊息讀取權限，請確認您的 Meta 應用是否已通過 App Review，或使用的是否為測試 Sandbox 帳號。";
  }
  if (code === "no_instagram_channel") {
    return "連接失敗：Meta 沒有回傳可用的 Instagram 專業帳號，請確認帳號已連結 Facebook Page、已切換為 Professional/Business Account，並具備必要權限。";
  }
  if (code === "meta_configuration") {
    return "連接失敗：Meta 應用設定不完整，請確認 App ID、App Secret 與 OAuth Redirect URI 是否和目前環境一致。";
  }
  return mode === "instagram"
    ? "連接失敗：Instagram 授權沒有完成，請重新連接；若持續失敗，請確認帳號權限與 App Review 狀態。"
    : "連接失敗：Meta 授權沒有完成，請改用 Instagram 連接或確認 Meta App 權限設定。";
}

export function getInstagramAppSecret() {
  const instagramAppId = process.env.META_INSTAGRAM_APP_ID?.trim();
  const facebookAppId = process.env.META_APP_ID?.trim();
  const instagramSecret = process.env.META_INSTAGRAM_APP_SECRET?.trim();

  if (instagramSecret) return instagramSecret;
  if (!instagramAppId || instagramAppId === facebookAppId) {
    return requiredAnyEnv("META_INSTAGRAM_APP_SECRET", "META_APP_SECRET");
  }

  throw new Error("META_INSTAGRAM_APP_SECRET is required for Instagram Login because META_INSTAGRAM_APP_ID is different from META_APP_ID.");
}

export function getCallbackMode(request: Request, cookieValue?: string): MetaOauthMode {
  if (cookieValue === "facebook" || cookieValue === "instagram") return cookieValue;
  return new URL(request.url).pathname.startsWith(DEFAULT_INSTAGRAM_OAUTH_CALLBACK_PATH)
    ? "instagram"
    : "facebook";
}
