import type { OAuthProvider, TokenResult } from "@/lib/oauth/types";

type TelegramGetMeResponse = {
  ok?: boolean;
  result?: {
    id?: number;
    is_bot?: boolean;
    first_name?: string;
    username?: string;
  };
  description?: string;
};

async function validateBotToken(token: string) {
  const normalized = token.trim();
  if (!normalized) {
    throw new Error("請輸入 Telegram Bot Token。");
  }

  const response = await fetch(`https://api.telegram.org/bot${normalized}/getMe`, { cache: "no-store" });
  const data = (await response.json().catch(() => ({}))) as TelegramGetMeResponse;
  if (!response.ok || !data.ok || !data.result?.id) {
    throw new Error(data.description || "Telegram Bot Token 驗證失敗。");
  }

  return { token: normalized, profile: data.result };
}

export const telegramBotProvider: OAuthProvider = {
  id: "telegram-bot",
  label: "Telegram Bot",
  mode: "token",
  async connectWithToken(context): Promise<TokenResult> {
    const result = await validateBotToken(context.token);

    return {
      providerAccountId: String(result.profile.id),
      displayName: context.label?.trim() || result.profile.first_name || `Telegram Bot ${result.profile.id}`,
      username: result.profile.username,
      accessToken: result.token,
      accountType: "telegram-bot",
      profile: {
        id: result.profile.id,
        isBot: result.profile.is_bot,
        firstName: result.profile.first_name,
        username: result.profile.username,
      },
      metadata: {
        oauthProvider: "telegram-bot",
      },
    };
  },
};
