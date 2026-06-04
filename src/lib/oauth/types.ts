import type { Prisma } from "@prisma/client";

export type OAuthProviderId = "meta-instagram" | "meta-facebook" | "telegram-bot" | "mock";
export type OAuthProviderMode = "oauth" | "token";

export type TokenResult = {
  providerAccountId: string;
  displayName: string;
  username?: string;
  avatarUrl?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date | null;
  scopes?: string[];
  accountType?: string;
  profile?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

export type AuthorizationContext = {
  request: Request;
  state: string;
  popupOrigin: string;
};

export type CallbackContext = AuthorizationContext & {
  code: string;
};

export type TokenConnectContext = {
  request: Request;
  popupOrigin: string;
  token: string;
  label?: string;
};

export interface OAuthProvider {
  id: OAuthProviderId;
  label: string;
  mode: OAuthProviderMode;
  getAuthUrl?(context: AuthorizationContext): Promise<string> | string;
  handleCallback?(context: CallbackContext): Promise<TokenResult>;
  connectWithToken?(context: TokenConnectContext): Promise<TokenResult>;
  refreshToken?(token: string): Promise<TokenResult>;
}

export type PopupMessagePayload = {
  status: "success" | "error";
  provider: OAuthProviderId;
  accountId?: string;
  displayName?: string;
  message?: string;
};

export type StoredConnectedAccount = {
  provider: OAuthProviderId;
  providerAccountId: string;
  displayName: string;
  username?: string | null;
  avatarUrl?: string | null;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date | null;
  scopesJson?: Prisma.InputJsonValue;
  profileJson?: Prisma.InputJsonValue;
  metadataJson?: Prisma.InputJsonValue;
  accountType?: string | null;
};
