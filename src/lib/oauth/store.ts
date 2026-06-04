import { getDb } from "@/lib/db";
import { asJsonObject } from "@/lib/oauth/utils";
import { encryptSecret, tryDecryptSecret } from "@/lib/secrets";
import type { StoredConnectedAccount } from "@/lib/oauth/types";

export async function saveConnectedAccount(workspaceId: string, input: StoredConnectedAccount) {
  const db = getDb();

  return db.connectedAccount.upsert({
    where: {
      workspaceId_provider_providerAccountId: {
        workspaceId,
        provider: input.provider,
        providerAccountId: input.providerAccountId,
      },
    },
    update: {
      displayName: input.displayName,
      username: input.username,
      avatarUrl: input.avatarUrl,
      accountType: input.accountType,
      encryptedAccessToken: input.accessToken ? encryptSecret(input.accessToken) : null,
      encryptedRefreshToken: input.refreshToken ? encryptSecret(input.refreshToken) : null,
      tokenExpiresAt: input.tokenExpiresAt ?? null,
      scopesJson: input.scopesJson ?? [],
      profileJson: input.profileJson ?? {},
      metadataJson: input.metadataJson ?? {},
      connectedAt: new Date(),
    },
    create: {
      workspaceId,
      provider: input.provider,
      providerAccountId: input.providerAccountId,
      displayName: input.displayName,
      username: input.username,
      avatarUrl: input.avatarUrl,
      accountType: input.accountType,
      encryptedAccessToken: input.accessToken ? encryptSecret(input.accessToken) : null,
      encryptedRefreshToken: input.refreshToken ? encryptSecret(input.refreshToken) : null,
      tokenExpiresAt: input.tokenExpiresAt ?? null,
      scopesJson: input.scopesJson ?? [],
      profileJson: input.profileJson ?? {},
      metadataJson: input.metadataJson ?? {},
      connectedAt: new Date(),
    },
  });
}

export async function getConnectedAccountForSync(workspaceId: string, accountId: string) {
  const db = getDb();
  const account = await db.connectedAccount.findFirst({
    where: { id: accountId, workspaceId },
  });
  if (!account) return null;

  return {
    ...account,
    accessToken: account.encryptedAccessToken ? tryDecryptSecret(account.encryptedAccessToken) || "" : "",
    refreshToken: account.encryptedRefreshToken ? tryDecryptSecret(account.encryptedRefreshToken) || "" : "",
    profile: asJsonObject(account.profileJson),
    metadata: asJsonObject(account.metadataJson),
  };
}
