import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAppUrl } from "@/lib/app-url";
import { requireApiUser } from "@/lib/auth";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export const runtime = "nodejs";

const META_OAUTH_STATE_COOKIE = "meta_oauth_state";
const META_OAUTH_WORKSPACE_COOKIE = "meta_oauth_workspace";
const META_OAUTH_MODE_COOKIE = "meta_oauth_mode";
const DEFAULT_GRAPH_API_VERSION = "v25.0";
type MetaOAuthMode = "facebook" | "instagram";
type MetaBusinessLoginPreference = "facebook" | "instagram";

const DEFAULT_META_OAUTH_MODE: MetaOAuthMode = "instagram";
const DEFAULT_FACEBOOK_OAUTH_CALLBACK_PATH = "/api/meta/oauth/callback";
const DEFAULT_INSTAGRAM_OAUTH_CALLBACK_PATH = "/api/instagram/oauth/callback";

function getInstagramAppId() {
  return process.env.META_INSTAGRAM_APP_ID?.trim() || process.env.META_APP_ID?.trim() || "";
}

function getOAuthRedirectUri(request: Request, mode: MetaOAuthMode) {
  const configuredRedirect =
    mode === "instagram"
      ? process.env.META_INSTAGRAM_REDIRECT_URI?.trim()
      : process.env.META_FACEBOOK_REDIRECT_URI?.trim();
  if (configuredRedirect) return configuredRedirect;
  const callbackPath =
    mode === "instagram" ? DEFAULT_INSTAGRAM_OAUTH_CALLBACK_PATH : DEFAULT_FACEBOOK_OAUTH_CALLBACK_PATH;
  return `${getAppUrl(request)}${callbackPath}`;
}

export function getMetaBusinessLoginPreference(
  mode: MetaOAuthMode,
  requestedLogin: string | null,
): MetaBusinessLoginPreference {
  return requestedLogin === "instagram" || requestedLogin === "facebook" ? requestedLogin : mode;
}

function buildMetaBusinessLoginUrl(nextUrl: string, loginPreference: MetaBusinessLoginPreference) {
  const loginPagePath =
    loginPreference === "instagram"
      ? "https://business.facebook.com/business/loginpage/new/"
      : "https://business.facebook.com/business/loginpage/";
  const url = new URL(loginPagePath);
  const loginOptions = loginPreference === "instagram" ? ["IG"] : ["FB", "IG", "SSO"];
  url.searchParams.set("next", nextUrl);
  loginOptions.forEach((option, index) => {
    url.searchParams.set(`login_options[${index}]`, option);
  });
  url.searchParams.set("config_ref", "biz_login_tool_flavor_mbs");
  return url.toString();
}

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const url = new URL(request.url);
  const requestedMode = url.searchParams.get("mode");
  const mode: MetaOAuthMode =
    requestedMode === "instagram" || requestedMode === "facebook" ? requestedMode : DEFAULT_META_OAUTH_MODE;
  const requestedLogin = url.searchParams.get("login");
  const switchAccount = url.searchParams.get("switch_account") === "1";
  const loginPreference = getMetaBusinessLoginPreference(mode, requestedLogin);
  const appId = mode === "instagram" ? getInstagramAppId() : process.env.META_APP_ID?.trim();

  if (!appId) {
    return NextResponse.json(
      { error: mode === "instagram" ? "META_INSTAGRAM_APP_ID or META_APP_ID is not configured." : "META_APP_ID is not configured." },
      { status: 500 },
    );
  }

  const graphVersion = process.env.META_GRAPH_API_VERSION || DEFAULT_GRAPH_API_VERSION;
  const redirectUri = getOAuthRedirectUri(request, mode);
  const state = randomBytes(24).toString("hex");
  const workspaceId = await getCurrentWorkspaceId();
  const cookieStore = await cookies();
  cookieStore.set(META_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: new URL(request.url).protocol === "https:",
    path: "/",
    maxAge: 10 * 60,
  });
  cookieStore.set(META_OAUTH_WORKSPACE_COOKIE, workspaceId, {
    httpOnly: true,
    sameSite: "lax",
    secure: new URL(request.url).protocol === "https:",
    path: "/",
    maxAge: 10 * 60,
  });
  cookieStore.set(META_OAUTH_MODE_COOKIE, mode, {
    httpOnly: true,
    sameSite: "lax",
    secure: new URL(request.url).protocol === "https:",
    path: "/",
    maxAge: 10 * 60,
  });

  if (mode === "instagram") {
    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: redirectUri,
      response_type: "code",
      state,
      enable_fb_login: "0",
      force_authentication: "1",
      scope: [
        "instagram_business_basic",
        "instagram_business_manage_comments",
        "instagram_business_manage_messages",
      ].join(","),
    });
    if (switchAccount) {
      params.set("prompt", "login");
      params.set("auth_type", "reauthenticate");
    }

    return NextResponse.redirect(`https://api.instagram.com/oauth/authorize?${params}`);
  }

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: "code",
    state,
    scope: [
      "pages_show_list",
      "pages_read_engagement",
      "pages_manage_metadata",
      "pages_messaging",
      "instagram_basic",
      "instagram_manage_messages",
      "business_management",
    ].join(","),
  });

  if (loginPreference === "instagram") {
    params.set("display", "page");
    params.set("extras", JSON.stringify({ setup: { channel: "IG_API_ONBOARDING" } }));
  }

  const oauthUrl = `https://www.facebook.com/${graphVersion}/dialog/oauth?${params}`;

  return NextResponse.redirect(buildMetaBusinessLoginUrl(oauthUrl, loginPreference));
}
