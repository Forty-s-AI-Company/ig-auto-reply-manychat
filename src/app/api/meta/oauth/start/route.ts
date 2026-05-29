import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export const runtime = "nodejs";

const META_OAUTH_STATE_COOKIE = "meta_oauth_state";
const META_OAUTH_WORKSPACE_COOKIE = "meta_oauth_workspace";
const META_OAUTH_MODE_COOKIE = "meta_oauth_mode";
const DEFAULT_GRAPH_API_VERSION = "v25.0";
type MetaOAuthMode = "facebook" | "instagram";
type MetaBusinessLoginPreference = "facebook" | "instagram";

const DEFAULT_META_OAUTH_MODE: MetaOAuthMode = "facebook";

function getAppUrl(request: Request) {
  const requestOrigin = new URL(request.url).origin;
  const hostname = new URL(requestOrigin).hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return requestOrigin;
  }
  return (process.env.APP_URL || requestOrigin).replace(/\/$/, "");
}

function getInstagramAppId() {
  return process.env.META_INSTAGRAM_APP_ID?.trim() || process.env.META_APP_ID?.trim() || "";
}

function buildMetaBusinessLoginUrl(nextUrl: string, loginPreference: MetaBusinessLoginPreference) {
  const url = new URL("https://business.facebook.com/business/loginpage/");
  const loginOptions = loginPreference === "instagram" ? ["IG", "FB", "SSO"] : ["FB", "IG", "SSO"];
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
  const mode: MetaOAuthMode = requestedMode === "instagram" || requestedMode === "facebook" ? requestedMode : DEFAULT_META_OAUTH_MODE;
  const loginPreference: MetaBusinessLoginPreference = url.searchParams.get("login") === "instagram" ? "instagram" : "facebook";
  const appId = mode === "instagram" ? getInstagramAppId() : process.env.META_APP_ID?.trim();

  if (!appId) {
    return NextResponse.json(
      { error: mode === "instagram" ? "META_INSTAGRAM_APP_ID or META_APP_ID is not configured." : "META_APP_ID is not configured." },
      { status: 500 },
    );
  }

  const graphVersion = process.env.META_GRAPH_API_VERSION || DEFAULT_GRAPH_API_VERSION;
  const redirectUri = `${getAppUrl(request)}/api/meta/oauth/callback`;
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

    return NextResponse.redirect(`https://www.instagram.com/oauth/authorize?${params}`);
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

  const oauthUrl = `https://www.facebook.com/${graphVersion}/dialog/oauth?${params}`;

  return NextResponse.redirect(buildMetaBusinessLoginUrl(oauthUrl, loginPreference));
}
