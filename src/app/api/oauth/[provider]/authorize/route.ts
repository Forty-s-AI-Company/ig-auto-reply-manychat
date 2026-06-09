import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireApiUser } from "@/lib/auth";
import { getOAuthProvider } from "@/lib/oauth/registry";
import { issuePopupState } from "@/lib/oauth/state";
import { getPopupOrigin } from "@/lib/oauth/utils";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

type RouteContext = {
  params: Promise<{ provider: string }>;
};

const META_OAUTH_STATE_COOKIE = "meta_oauth_state";
const META_OAUTH_WORKSPACE_COOKIE = "meta_oauth_workspace";
const META_OAUTH_MODE_COOKIE = "meta_oauth_mode";

function getTokenProviderPopupPath(provider: string) {
  if (provider === "telegram-bot") return "/oauth/providers/telegram";
  return "/oauth/providers/mock";
}

function readTransport(request: Request) {
  const url = new URL(request.url);
  return url.searchParams.get("transport") === "redirect" ? "redirect" : "popup";
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
  const transport = readTransport(request);
  const state = await issuePopupState(request, provider.id, popupOrigin, transport);
  const secure = new URL(request.url).protocol === "https:";
  const cookieStore = await cookies();

  if (provider.id === "meta-instagram" || provider.id === "meta-facebook") {
    const mode = provider.id === "meta-instagram" ? "instagram" : "facebook";
    const workspaceId = await getCurrentWorkspaceId();
    cookieStore.set(META_OAUTH_STATE_COOKIE, state, {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 10 * 60,
    });
    cookieStore.set(META_OAUTH_WORKSPACE_COOKIE, workspaceId, {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 10 * 60,
    });
    cookieStore.set(META_OAUTH_MODE_COOKIE, mode, {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 10 * 60,
    });
  }

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
