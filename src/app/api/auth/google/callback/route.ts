import { createRemoteJWKSet, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAppUrl } from "@/lib/app-url";
import { setSessionCookie } from "@/lib/auth";
import { createUserWorkspaceSubscription } from "@/lib/auth-onboarding";
import { getDb } from "@/lib/db";
import { GOOGLE_OAUTH_REFERRAL_COOKIE, GOOGLE_OAUTH_STATE_COOKIE } from "@/lib/google-oauth";

export const runtime = "nodejs";

type GoogleTokenResponse = {
  id_token?: string;
  error?: string;
  error_description?: string;
};

type GoogleIdTokenPayload = {
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  picture?: string;
};

const googleJwks = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

function requiredGoogleEnv(name: "GOOGLE_CLIENT_ID" | "GOOGLE_CLIENT_SECRET") {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

async function exchangeCodeForToken(request: Request, code: string) {
  const redirectUri = `${getAppUrl(request)}/api/auth/google/callback`;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: requiredGoogleEnv("GOOGLE_CLIENT_ID"),
      client_secret: requiredGoogleEnv("GOOGLE_CLIENT_SECRET"),
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const data = (await response.json().catch(() => ({}))) as GoogleTokenResponse;
  if (!response.ok || !data.id_token) {
    throw new Error(data.error_description || data.error || "Google token exchange failed.");
  }
  return data.id_token;
}

async function verifyGoogleIdToken(idToken: string) {
  const { payload } = await jwtVerify(idToken, googleJwks, {
    audience: requiredGoogleEnv("GOOGLE_CLIENT_ID"),
    issuer: ["https://accounts.google.com", "accounts.google.com"],
  });
  return payload as GoogleIdTokenPayload;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const appUrl = getAppUrl(request);
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;
  const referralCode = cookieStore.get(GOOGLE_OAUTH_REFERRAL_COOKIE)?.value || null;

  cookieStore.delete(GOOGLE_OAUTH_STATE_COOKIE);
  cookieStore.delete(GOOGLE_OAUTH_REFERRAL_COOKIE);

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(`${appUrl}/login?google_error=invalid_state`);
  }

  try {
    const idToken = await exchangeCodeForToken(request, code);
    const profile = await verifyGoogleIdToken(idToken);
    if (!profile.email || !profile.email_verified) {
      return NextResponse.redirect(`${appUrl}/login?google_error=email_not_verified`);
    }

    const email = profile.email.toLowerCase();
    const existing = await getDb().user.findUnique({ where: { email }, select: { id: true, avatarUrl: true } });
    if (existing && profile.picture && existing.avatarUrl !== profile.picture) {
      await getDb().user.update({
        where: { id: existing.id },
        data: { avatarUrl: profile.picture },
        select: { id: true },
      });
    }
    const user =
      existing ||
      (await createUserWorkspaceSubscription({
        email,
        name: profile.name || profile.given_name || email.split("@")[0] || "Google User",
        workspaceName: `${profile.name || profile.given_name || "InboxPilot"} Workspace`,
        avatarUrl: profile.picture || null,
        emailVerifiedAt: new Date(),
        referralCode,
        ip: request.headers.get("x-forwarded-for"),
        userAgent: request.headers.get("user-agent"),
      }));

    await setSessionCookie(user.id);
    return NextResponse.redirect(`${appUrl}/dashboard`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "google_login_failed";
    return NextResponse.redirect(`${appUrl}/login?google_error=${encodeURIComponent(message)}`);
  }
}
