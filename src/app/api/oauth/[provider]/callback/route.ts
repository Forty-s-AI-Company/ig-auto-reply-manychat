import { NextResponse } from "next/server";
import { recordAuditEvent } from "@/lib/audit";
import { requireApiUser } from "@/lib/auth";
import { syncConnectedAccountToChannel } from "@/lib/oauth/meta-channel-sync";
import { getOAuthProvider } from "@/lib/oauth/registry";
import { clearPopupState, readPopupState } from "@/lib/oauth/state";
import { saveConnectedAccount } from "@/lib/oauth/store";
import { getPopupBridgeUrl, toPrismaJson } from "@/lib/oauth/utils";
import { getClientIp } from "@/lib/security";
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
  const auditBase = {
    resourceType: "channel" as const,
    workspaceId: await getCurrentWorkspaceId(),
    userId: auth.user.id,
    actorIp: getClientIp(request),
    userAgent: request.headers.get("user-agent"),
  };

  if (providerError) {
    await recordAuditEvent({
      ...auditBase,
      action: "oauth_callback_failed",
      success: false,
      metadata: { provider: providerId, reason: providerError, phase: "provider_error" },
    });
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
    const message = "OAuth state verification failed.";
    await recordAuditEvent({
      ...auditBase,
      action: "oauth_callback_failed",
      success: false,
      metadata: { provider: providerId, reason: message, phase: "state_validation" },
    });
    await clearPopupState();
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

  try {
    const result = await provider.handleCallback({
      request,
      state,
      code,
      popupOrigin: stored.popupOrigin,
    });
    const workspaceId = auditBase.workspaceId;
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

    await recordAuditEvent({
      ...auditBase,
      action: "oauth_callback_success",
      resourceId: account.id,
      metadata: {
        provider: provider.id,
        accountId: account.id,
        displayName: account.displayName,
        channelCount: syncResult.channelIds.length,
      },
    });

    const successPayload: Record<string, string> = {
      status: "success",
      provider: provider.id,
      accountId: account.id,
      displayName: account.displayName,
    };
    if (syncResult.channelIds.length > 0) {
      successPayload.message = `Connected ${syncResult.channelIds.length} channel(s).`;
    }
    await clearPopupState();
    if (stored.transport === "redirect") {
      return NextResponse.redirect(
        buildRedirectResultUrl(request, {
          oauth_status: "success",
          oauth_provider: provider.id,
          oauth_account_id: account.id,
          oauth_display_name: account.displayName,
          oauth_message: successPayload.message || "Connected successfully.",
        }),
      );
    }
    return NextResponse.redirect(getPopupBridgeUrl(request, successPayload));
  } catch (error) {
    const message = error instanceof Error ? error.message : "OAuth callback failed.";
    await recordAuditEvent({
      ...auditBase,
      action: "oauth_callback_failed",
      success: false,
      metadata: { provider: providerId, reason: message, phase: "callback" },
    });
    await clearPopupState();
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
