"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { OAuthPopupButton } from "./OAuthPopupButton";

type InstagramConnectOptionsProps = {
  metaError?: string;
  callbackUrl: string;
  configuredAppUrl: string;
};

export function InstagramConnectOptions({
  metaError,
  callbackUrl,
  configuredAppUrl,
}: InstagramConnectOptionsProps) {
  const [expanded, setExpanded] = useState(false);
  const isLocalCallback = callbackUrl.includes("://localhost") || callbackUrl.includes("://127.0.0.1");

  return (
    <div>
      <h2 className="text-lg font-bold text-[#17191c]">只需要幾個步驟</h2>
      <p className="mt-3 max-w-[390px] text-base leading-6 text-[#17191c]">
        我們會開啟 Meta 授權視窗。完成權限設定後，你的 Instagram 帳號就會連接到系統。
      </p>

      {metaError ? (
        <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Meta 授權失敗：{metaError}
        </div>
      ) : null}

      <div className="mt-5 rounded-md border border-[#d7dbe2] bg-[#f8fafc] px-4 py-3 text-sm leading-6 text-[#344054]">
        <p className="font-semibold text-[#17191c]">Meta 後台需要允許這個 Callback URL</p>
        <code className="mt-2 block overflow-x-auto rounded bg-white px-3 py-2 text-xs text-[#17191c]">
          {callbackUrl}
        </code>
        {isLocalCallback ? (
          <p className="mt-2 text-xs text-[#667085]">
            目前你正在使用 localhost，Meta App 的 Valid OAuth Redirect URIs 必須加入上面這一條。
          </p>
        ) : null}
        {configuredAppUrl && !callbackUrl.startsWith(configuredAppUrl) ? (
          <p className="mt-2 text-xs text-[#b45309]">
            .env 的 APP_URL 是 {configuredAppUrl}，但目前頁面不是從這個網域開啟。OAuth 會以目前瀏覽器網域為準，避免 cookie 網域不一致。
          </p>
        ) : null}
      </div>

      <OAuthPopupButton href="/api/meta/oauth/start?mode=facebook">
        透過 Meta 連接
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

      {expanded ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <OAuthPopupButton href="/api/meta/oauth/start?mode=instagram" variant="secondary">
            透過 Instagram 連接
          </OAuthPopupButton>
          <OAuthPopupButton href="/api/meta/oauth/start?mode=facebook" variant="secondary">
            Meta Business Suite
          </OAuthPopupButton>
        </div>
      ) : null}
    </div>
  );
}
