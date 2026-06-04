import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/auth";
import { getOAuthProvider } from "@/lib/oauth/registry";
import { clearPopupState, readPopupState } from "@/lib/oauth/state";
import { saveConnectedAccount } from "@/lib/oauth/store";
import { toPrismaJson } from "@/lib/oauth/utils";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

const bodySchema = z.object({
  token: z.string().min(1),
  label: z.string().trim().max(80).optional(),
});

type RouteContext = {
  params: Promise<{ provider: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const { provider: providerId } = await context.params;
  const provider = getOAuthProvider(providerId);
  if (!provider || provider.mode !== "token" || !provider.connectWithToken) {
    return NextResponse.json({ error: "Token provider not found." }, { status: 404 });
  }

  const body = bodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Token payload is invalid." }, { status: 400 });
  }

  try {
    const stored = await readPopupState();
    const result = await provider.connectWithToken({
      request,
      popupOrigin: stored.popupOrigin,
      token: body.data.token,
      label: body.data.label,
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
    await clearPopupState();

    return NextResponse.json({
      ok: true,
      provider: provider.id,
      accountId: account.id,
      displayName: account.displayName,
    });
  } catch (error) {
    await clearPopupState();
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Token provider connect failed." },
      { status: 400 },
    );
  }
}
