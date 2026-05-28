import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAppUrl } from "@/lib/app-url";
import { GOOGLE_OAUTH_REFERRAL_COOKIE, GOOGLE_OAUTH_STATE_COOKIE } from "@/lib/google-oauth";

export const runtime = "nodejs";

function getGoogleClientId() {
  return process.env.GOOGLE_CLIENT_ID?.trim() || "";
}

export async function GET(request: Request) {
  const clientId = getGoogleClientId();
  if (!clientId) {
    return NextResponse.json({ error: "GOOGLE_CLIENT_ID is not configured." }, { status: 500 });
  }

  const url = new URL(request.url);
  const state = randomBytes(24).toString("hex");
  const redirectUri = `${getAppUrl(request)}/api/auth/google/callback`;
  const cookieStore = await cookies();

  cookieStore.set(GOOGLE_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: url.protocol === "https:",
    path: "/",
    maxAge: 10 * 60,
  });

  const referralCode = url.searchParams.get("ref")?.trim();
  if (referralCode) {
    cookieStore.set(GOOGLE_OAUTH_REFERRAL_COOKIE, referralCode, {
      httpOnly: true,
      sameSite: "lax",
      secure: url.protocol === "https:",
      path: "/",
      maxAge: 10 * 60,
    });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}
