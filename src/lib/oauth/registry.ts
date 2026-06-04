import type { OAuthProvider, OAuthProviderId } from "@/lib/oauth/types";
import { metaFacebookProvider } from "@/lib/oauth/providers/meta-facebook";
import { metaInstagramProvider } from "@/lib/oauth/providers/meta-instagram";
import { mockProvider } from "@/lib/oauth/providers/mock";
import { telegramBotProvider } from "@/lib/oauth/providers/telegram-bot";

const providers: Record<OAuthProviderId, OAuthProvider> = {
  "meta-instagram": metaInstagramProvider,
  "meta-facebook": metaFacebookProvider,
  "telegram-bot": telegramBotProvider,
  mock: mockProvider,
};

export function getOAuthProvider(providerId: string) {
  return providers[providerId as OAuthProviderId] || null;
}

export function listOAuthProviders() {
  return Object.values(providers);
}
