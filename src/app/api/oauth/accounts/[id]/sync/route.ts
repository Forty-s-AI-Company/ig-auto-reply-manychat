import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { syncConnectedAccountToChannel } from "@/lib/oauth/meta-channel-sync";
import { getConnectedAccountForSync } from "@/lib/oauth/store";
import type { OAuthProviderId, TokenResult } from "@/lib/oauth/types";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const workspaceId = await getCurrentWorkspaceId();
  const { id } = await context.params;
  const account = await getConnectedAccountForSync(workspaceId, id);

  if (!account) {
    return NextResponse.json({ error: "Connected account not found." }, { status: 404 });
  }

  if (!account.accessToken) {
    return NextResponse.json({ error: "這筆 ConnectedAccount 沒有可用的 access token，無法重新同步。" }, { status: 400 });
  }

  try {
    const result: TokenResult = {
      providerAccountId: account.providerAccountId,
      displayName: account.displayName,
      username: account.username || undefined,
      avatarUrl: account.avatarUrl || undefined,
      accessToken: account.accessToken,
      refreshToken: account.refreshToken || undefined,
      expiresAt: account.tokenExpiresAt,
      accountType: account.accountType || undefined,
      profile: account.profile,
      metadata: account.metadata,
      scopes: Array.isArray(account.scopesJson)
        ? account.scopesJson.filter((item): item is string => typeof item === "string")
        : [],
    };

    const syncResult = await syncConnectedAccountToChannel({
      provider: account.provider as OAuthProviderId,
      workspaceId,
      result,
    });

    await getDb().connectedAccount.update({
      where: { id: account.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      ok: true,
      channelCount: syncResult.channelIds.length,
      channelIds: syncResult.channelIds,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Channel sync failed." },
      { status: 400 },
    );
  }
}
