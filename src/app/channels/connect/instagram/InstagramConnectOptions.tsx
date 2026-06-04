"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
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
  const primaryOauthHref = isInstagramOnlyLogin ? "/api/oauth/meta-instagram/authorize" : "/api/oauth/meta-facebook/authorize";

  return (
    <div>
      <h2 className="text-lg font-bold text-[#17191c]">只需要幾個步驟</h2>
      <p className="mt-3 max-w-[390px] text-base leading-6 text-[#17191c]">
        {isInstagramOnlyLogin
          ? "我們會開啟 Instagram 登入 popup。完成授權後，帳號資料會自動回到主視窗。"
          : "我們會開啟 Facebook / Meta 登入 popup。完成授權後，資料會自動回到主視窗。"}
      </p>

      {metaError ? (
        <DismissibleNoticeToast title="連接失敗" tone="danger" stackIndex={showSetupNotice ? 1 : 0}>
          {metaError}
        </DismissibleNoticeToast>
      ) : null}

      <OAuthPopupButton href={primaryOauthHref}>
        {isInstagramOnlyLogin ? "使用 Instagram 帳號繼續" : "使用 Meta 帳號繼續"}
      </OAuthPopupButton>

      {isInstagramOnlyLogin ? (
        <div className="mt-3 rounded-md border border-[#dcecef] bg-[#f8fcfd] p-3">
          <Link
            href="/channels/connect/instagram/switch-account"
            className="flex h-11 items-center justify-center rounded-md border border-[#d2d6dc] bg-white px-4 text-sm font-bold text-[#17191c] hover:bg-[#f6f7f9]"
          >
            新增其他 Instagram 帳號
          </Link>
          <p className="mt-2 text-xs leading-5 text-[#667085]">
            如果你不想用目前瀏覽器已登入的帳號，可以先走這個入口，改用重新登入或切換帳號的方式連接。
          </p>
        </div>
      ) : null}

      <div className="mt-5 flex min-h-[94px] items-center justify-between rounded-md bg-[#f1f1f1] px-5">
        <p className="max-w-[210px] text-base leading-6 text-[#17191c]">
          InboxPilot 使用可信任的
          <br />
          Meta 商業合作夥伴流程
        </p>
        <div className="text-right">
          <div className="text-3xl font-bold text-[#344054]">Meta</div>
          <p className="text-xs text-[#344054]">Business partner</p>
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
          顯示其他登入方式
          <ChevronDown className={`h-4 w-4 transition ${expanded ? "rotate-180" : ""}`} />
        </button>
      ) : null}

      {!isInstagramOnlyLogin && expanded ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <OAuthPopupButton href="/api/oauth/meta-instagram/authorize" variant="secondary">
            改用 Instagram OAuth
          </OAuthPopupButton>
          <p className="text-xs leading-5 text-[#667085] sm:col-span-2">
            如果你想直接用 Instagram app 的 OAuth，而不是 Facebook / Meta dialog，可以改走這個入口。
          </p>
        </div>
      ) : null}

      {showSetupNotice ? (
        <DismissibleNoticeToast title="Callback URL 檢查" tone="warning">
          <code className="mt-2 block overflow-x-auto rounded bg-[#f8fafc] px-3 py-2 text-xs text-[#17191c]">
            {callbackUrl}
          </code>
          {isLocalCallback ? (
            <p className="mt-2 text-xs text-[#667085]">
              如果你在 localhost 測試，記得把這個 callback URL 加進 Meta / Instagram OAuth 設定。
            </p>
          ) : null}
          {hasAppUrlMismatch ? (
            <p className="mt-2 text-xs text-[#b45309]">
              目前 `.env` 的 `APP_URL` 是 {configuredAppUrl}，和實際 callback origin 不一致，正式站很容易在這裡翻車。
            </p>
          ) : null}
        </DismissibleNoticeToast>
      ) : null}
    </div>
  );
}
