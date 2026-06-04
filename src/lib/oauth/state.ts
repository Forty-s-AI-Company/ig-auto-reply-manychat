import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { OAUTH_POPUP_ORIGIN_COOKIE, OAUTH_POPUP_PROVIDER_COOKIE, OAUTH_POPUP_STATE_COOKIE, OAUTH_POPUP_TTL_SECONDS } from "@/lib/oauth/constants";
import type { OAuthProviderId } from "@/lib/oauth/types";

export async function issuePopupState(request: Request, provider: OAuthProviderId, popupOrigin: string) {
  const state = randomBytes(24).toString("hex");
  const store = await cookies();
  const secure = new URL(request.url).protocol === "https:";

  store.set(OAUTH_POPUP_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: OAUTH_POPUP_TTL_SECONDS,
  });
  store.set(OAUTH_POPUP_PROVIDER_COOKIE, provider, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: OAUTH_POPUP_TTL_SECONDS,
  });
  store.set(OAUTH_POPUP_ORIGIN_COOKIE, popupOrigin, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: OAUTH_POPUP_TTL_SECONDS,
  });

  return state;
}

export async function readPopupState() {
  const store = await cookies();
  return {
    state: store.get(OAUTH_POPUP_STATE_COOKIE)?.value || "",
    provider: store.get(OAUTH_POPUP_PROVIDER_COOKIE)?.value || "",
    popupOrigin: store.get(OAUTH_POPUP_ORIGIN_COOKIE)?.value || "",
  };
}

export async function clearPopupState() {
  const store = await cookies();
  store.delete(OAUTH_POPUP_STATE_COOKIE);
  store.delete(OAUTH_POPUP_PROVIDER_COOKIE);
  store.delete(OAUTH_POPUP_ORIGIN_COOKIE);
}
