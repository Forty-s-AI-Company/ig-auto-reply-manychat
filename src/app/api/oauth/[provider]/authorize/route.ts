import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { getOAuthProvider } from "@/lib/oauth/registry";
import { issuePopupState } from "@/lib/oauth/state";
import { getPopupOrigin } from "@/lib/oauth/utils";

type RouteContext = {
  params: Promise<{ provider: string }>;
};

function getTokenProviderPopupPath(provider: string) {
  if (provider === "telegram-bot") return "/oauth/providers/telegram";
  return "/oauth/providers/mock";
}

export async function GET(request: Request, context: RouteContext) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const { provider: providerId } = await context.params;
  const provider = getOAuthProvider(providerId);
  if (!provider) {
    return NextResponse.json({ error: "OAuth provider not found." }, { status: 404 });
  }

  const popupOrigin = getPopupOrigin(request);
  const state = await issuePopupState(request, provider.id, popupOrigin);

  if (provider.mode === "token") {
    const url = new URL(getTokenProviderPopupPath(provider.id), popupOrigin);
    url.searchParams.set("provider", provider.id);
    url.searchParams.set("state", state);
    return NextResponse.redirect(url);
  }

  if (!provider.getAuthUrl) {
    return NextResponse.json({ error: "OAuth provider authorize URL is not implemented." }, { status: 500 });
  }

  const authUrl = await provider.getAuthUrl({ request, state, popupOrigin });
  return NextResponse.redirect(authUrl);
}
