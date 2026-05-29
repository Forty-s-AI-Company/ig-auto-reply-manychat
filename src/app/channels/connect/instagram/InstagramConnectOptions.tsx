"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { DismissibleNoticeToast } from "@/components/DismissibleNoticeToast";
import { OAuthPopupButton } from "./OAuthPopupButton";

type InstagramConnectOptionsProps = {
  metaError?: string;
  callbackUrl: string;
  configuredAppUrl: string;
  loginPreference?: "facebook" | "instagram";
};

export function InstagramConnectOptions({
  metaError,
  callbackUrl,
  configuredAppUrl,
  loginPreference = "instagram",
}: InstagramConnectOptionsProps) {
  const [expanded, setExpanded] = useState(false);
  const isLocalCallback = callbackUrl.includes("://localhost") || callbackUrl.includes("://127.0.0.1");
  const hasAppUrlMismatch = Boolean(configuredAppUrl && !callbackUrl.startsWith(configuredAppUrl));
  const showSetupNotice = isLocalCallback || hasAppUrlMismatch;
  const isInstagramOnlyLogin = loginPreference === "instagram";
  const primaryOauthHref = isInstagramOnlyLogin
    ? "/api/meta/oauth/start?mode=instagram"
    : "/api/meta/oauth/start?mode=facebook&login=facebook";

  return (
    <div>
      <h2 className="text-lg font-bold text-[#17191c]">只需要幾個步驟</h2>
      <p className="mt-3 max-w-[390px] text-base leading-6 text-[#17191c]">
        {isInstagramOnlyLogin
          ? "我們會開啟 Instagram 登入視窗。完成授權後，你的 Instagram 帳號就會連接到系統。"
          : "我們會開啟 Meta 授權視窗。完成權限設定後，你的 Messenger 帳號就會連接到系統。"}
      </p>

      {metaError ? (
        <DismissibleNoticeToast title="Meta 授權失敗" tone="danger" stackIndex={showSetupNotice ? 1 : 0}>
          {metaError}
        </DismissibleNoticeToast>
      ) : null}

      <OAuthPopupButton href={primaryOauthHref}>
        {isInstagramOnlyLogin ? "使用 Instagram 帳號繼續" : "透過 Meta Business 連接"}
      </OAuthPopupButton>

      <div className="mt-5 flex min-h-[94px] items-center justify-between rounded-md bg-[#f1f1f1] px-5">
        <p className="max-w-[210px] text-base leading-6 text-[#17191c]">
          InboxPilot 使用可信任的
          <br />
          Meta 商業合作夥伴
        </p>
        <div className="text-right">
          <div className="text-3xl font-bold text-[#344054]">∞ Meta</div>
          <p className="text-xs text-[#344054]">商業合作夥伴</p>
        </div>
      </div>

      {!isInstagramOnlyLogin ? (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className={`mt-6 inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-[#006fe6] ${
            expanded ? "bg-[#eef0f3]" : "hover:bg-[#f5f7fa]"
          }`}
        >
          查看更多選項
          <ChevronDown className={`h-4 w-4 transition ${expanded ? "rotate-180" : ""}`} />
        </button>
      ) : null}

      {!isInstagramOnlyLogin && expanded ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <OAuthPopupButton href="/api/meta/oauth/start?mode=instagram" variant="secondary">
            Instagram 直接登入
          </OAuthPopupButton>
          <p className="text-xs leading-5 text-[#667085] sm:col-span-2">
            Instagram 直接登入需要另一組 Instagram App 設定。若出現 Invalid redirect_uri，請先改用 Meta Business 連接。
          </p>
        </div>
      ) : null}

      {showSetupNotice ? (
        <DismissibleNoticeToast title="Meta Callback URL 提醒" tone="warning">
          <code className="mt-2 block overflow-x-auto rounded bg-[#f8fafc] px-3 py-2 text-xs text-[#17191c]">
            {callbackUrl}
          </code>
          {isLocalCallback ? (
            <p className="mt-2 text-xs text-[#667085]">
              目前使用 localhost，Meta App 的 Valid OAuth Redirect URIs 需要加入上面這一條。
            </p>
          ) : null}
          {hasAppUrlMismatch ? (
            <p className="mt-2 text-xs text-[#b45309]">
              .env 的 APP_URL 是 {configuredAppUrl}，但目前頁面不是從這個網域開啟。
            </p>
          ) : null}
        </DismissibleNoticeToast>
      ) : null}
    </div>
  );
}
