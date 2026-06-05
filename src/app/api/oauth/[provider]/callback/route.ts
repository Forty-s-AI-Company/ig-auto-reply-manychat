import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { syncConnectedAccountToChannel } from "@/lib/oauth/meta-channel-sync";
import { getOAuthProvider } from "@/lib/oauth/registry";
import { clearPopupState, readPopupState } from "@/lib/oauth/state";
import { saveConnectedAccount } from "@/lib/oauth/store";
import { getPopupBridgeUrl, toPrismaJson } from "@/lib/oauth/utils";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

type RouteContext = {
  params: Promise<{ provider: string }>;
};

function buildRedirectResultUrl(request: Request, payload: Record<string, string>) {
  const url = new URL("/channels/connect/social", request.url);
  for (const [key, value] of Object.entries(payload)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

function redirectWithError(request: Request, provider: string, message: string) {
  return NextResponse.redirect(
    getPopupBridgeUrl(request, {
      status: "error",
      provider,
      message,
    }),
  );
}

export async function GET(request: Request, context: RouteContext) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const { provider: providerId } = await context.params;
  const provider = getOAuthProvider(providerId);
  if (!provider || !provider.handleCallback) {
    return NextResponse.json({ error: "OAuth provider callback is not implemented." }, { status: 404 });
  }

  const url = new URL(request.url);
  const state = url.searchParams.get("state") || "";
  const code = url.searchParams.get("code") || "";
  const providerError = url.searchParams.get("error_description") || url.searchParams.get("error") || "";
  const stored = await readPopupState();

  if (providerError) {
    await clearPopupState();
    if (stored.transport === "redirect") {
      return NextResponse.redirect(
        buildRedirectResultUrl(request, {
          oauth_status: "error",
          oauth_provider: providerId,
          oauth_message: providerError,
        }),
      );
    }
    return redirectWithError(request, providerId, providerError);
  }

  if (!state || !code || stored.state !== state || stored.provider !== providerId) {
    await clearPopupState();
    if (stored.transport === "redirect") {
      return NextResponse.redirect(
        buildRedirectResultUrl(request, {
          oauth_status: "error",
          oauth_provider: providerId,
          oauth_message: "OAuth state 驗證失敗，請重新連接帳號。",
        }),
      );
    }
    return redirectWithError(request, providerId, "OAuth state 驗證失敗，請重新連接帳號。");
  }

  try {
    const result = await provider.handleCallback({
      request,
      state,
      code,
      popupOrigin: stored.popupOrigin,
    });
    const workspaceId = await getCurrentWorkspaceId();
    const account = await saveConnectedAccount(workspaceId, {
      provider: provider.id,
      providerAccountId: result.providerAccountId,
      displayName: result.displayName,
      username: result.username,
      avatarUrl: result.avatarUrl,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      tokenExpiresAt: result.expiresAt ?? null,
      accountType: result.accountType ?? null,
      scopesJson: result.scopes || [],
      profileJson: toPrismaJson(result.profile),
      metadataJson: toPrismaJson(result.metadata),
    });
    const syncResult = await syncConnectedAccountToChannel({
      provider: provider.id,
      workspaceId,
      result,
    });

    const successPayload: Record<string, string> = {
      status: "success",
      provider: provider.id,
      accountId: account.id,
      displayName: account.displayName,
    };
    if (syncResult.channelIds.length > 0) {
      successPayload.message = `已同步 ${syncResult.channelIds.length} 個渠道`;
    }
    await clearPopupState();
    if (stored.transport === "redirect") {
      return NextResponse.redirect(
        buildRedirectResultUrl(request, {
          oauth_status: "success",
          oauth_provider: provider.id,
          oauth_account_id: account.id,
          oauth_display_name: account.displayName,
          oauth_message: successPayload.message || "帳號已完成連接。",
        }),
      );
    }
    return NextResponse.redirect(
      getPopupBridgeUrl(request, successPayload),
    );
  } catch (error) {
    await clearPopupState();
    const message = error instanceof Error ? error.message : "OAuth callback failed.";
    if (stored.transport === "redirect") {
      return NextResponse.redirect(
        buildRedirectResultUrl(request, {
          oauth_status: "error",
          oauth_provider: providerId,
          oauth_message: message,
        }),
      );
    }
    return redirectWithError(request, providerId, message);
  }
}
