"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { getChannelActionDisabledReason, getSafeChannelActionMessage } from "@/lib/channels/channel-action-feedback";

type ActionState = {
  loading: boolean;
  message: string;
  tone: "neutral" | "success" | "error";
};

type InstagramChannelActionsProps = {
  channelId: string;
  hasStoredToken?: boolean;
  loginProvider?: "instagram" | "facebook";
};

const idleState: ActionState = {
  loading: false,
  message: "可直接測試貼文讀取、留言同步與長效權杖更新。",
  tone: "neutral",
};

export function InstagramChannelActions({
  channelId,
  hasStoredToken = true,
  loginProvider = "instagram",
}: InstagramChannelActionsProps) {
  const disabledReasons = {
    media: getChannelActionDisabledReason("media", { hasStoredToken, loginProvider }),
    comments: getChannelActionDisabledReason("comments", { hasStoredToken, loginProvider }),
    token: getChannelActionDisabledReason("token", { hasStoredToken, loginProvider }),
  };
  const disabledReasonList = Object.values(disabledReasons).filter((reason): reason is string => Boolean(reason));
  const idleMessage =
    disabledReasonList.length > 0
      ? "部分 Instagram 動作目前先停用，請先查看下方說明。"
      : "可直接測試貼文讀取、留言同步與長效權杖更新。";

  const [state, setState] = useState<ActionState>(idleState);

  async function runAction(action: "media" | "token" | "comments") {
    const disabledReason = disabledReasons[action];
    if (disabledReason) {
      setState({ loading: false, message: disabledReason, tone: "neutral" });
      return;
    }

    setState({ loading: true, message: "處理中，請稍候…", tone: "neutral" });
    try {
      const response =
        action === "media"
          ? await fetch(`/api/instagram/media?channelId=${encodeURIComponent(channelId)}`, { cache: "no-store" })
          : await fetch(action === "token" ? "/api/instagram/token/refresh" : "/api/instagram/comments/sync", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: action === "token" ? JSON.stringify({ channelId }) : undefined,
            });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(typeof data.message === "string" ? data.message : typeof data.error === "string" ? data.error : "Instagram 操作失敗。");
      }

      if (action === "media") {
        setState({ loading: false, message: `已抓到 ${data.items?.length || 0} 篇貼文 / Reels。`, tone: "success" });
        return;
      }

      if (action === "comments") {
        setState({
          loading: false,
          message: `留言同步完成：處理 ${data.processed || 0}、重複 ${data.duplicated || 0}、略過 ${data.ignored || 0}。`,
          tone: "success",
        });
        return;
      }

      setState({
        loading: false,
        message: data.userTokenExpiresAt ? `長效權杖已更新，到期時間：${data.userTokenExpiresAt}` : "長效權杖已更新。",
        tone: "success",
      });
    } catch (error) {
      setState({
        loading: false,
        message: getSafeChannelActionMessage(action, error),
        tone: "error",
      });
    }
  }

  const messageClass =
    state.tone === "success" ? "text-green-700" : state.tone === "error" ? "text-red-700" : "text-[#667085]";
  const displayedMessage =
    state.tone === "neutral"
      ? state.message === idleState.message || !disabledReasonList.includes(state.message)
        ? idleMessage
        : state.message
      : state.message;

  return (
    <div className="mt-4 rounded-md border border-[#b9e6fe] bg-[#f0f9ff] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-[#0b4a6f]">Instagram 功能已開始實作</p>
          <p className={`mt-1 text-xs ${messageClass}`}>{displayedMessage}</p>
        </div>
        {state.loading ? <RefreshCw className="h-4 w-4 animate-spin text-[#006fe6]" aria-hidden="true" /> : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href="/automations"
          className="rounded-md bg-[#006fe6] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#0057b8]"
        >
          開啟視覺化自動化
        </Link>
        <Link
          href="/automations/instagram-default-reply"
          className="rounded-md border border-[#84caff] bg-white px-3 py-1.5 text-xs font-medium text-[#0057b8] hover:bg-[#e0f2fe]"
        >
          設定預設回覆
        </Link>
        <button
          type="button"
          onClick={() => runAction("media")}
          disabled={state.loading || Boolean(disabledReasons.media)}
          title={disabledReasons.media || "抓取貼文"}
          className="rounded-md border border-[#d0d5dd] bg-white px-3 py-1.5 text-xs font-medium text-[#344054] hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:bg-[#f3f4f6] disabled:text-[#98a2b3]"
        >
          抓取貼文
        </button>
        <button
          type="button"
          onClick={() => runAction("comments")}
          disabled={state.loading || Boolean(disabledReasons.comments)}
          title={disabledReasons.comments || "同步留言觸發"}
          className="rounded-md border border-[#d0d5dd] bg-white px-3 py-1.5 text-xs font-medium text-[#344054] hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:bg-[#f3f4f6] disabled:text-[#98a2b3]"
        >
          同步留言觸發
        </button>
        <button
          type="button"
          onClick={() => runAction("token")}
          disabled={state.loading || Boolean(disabledReasons.token)}
          title={disabledReasons.token || "更新長效權杖"}
          className="rounded-md border border-[#d0d5dd] bg-white px-3 py-1.5 text-xs font-medium text-[#344054] hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:bg-[#f3f4f6] disabled:text-[#98a2b3]"
        >
          更新長效權杖
        </button>
      </div>
      {disabledReasonList.length > 0 ? (
        <p className="mt-3 text-xs leading-6 text-[#0b4a6f]">
          目前至少有一個 Instagram 動作先維持 disabled：{disabledReasonList.join("；")}。
        </p>
      ) : null}
    </div>
  );
}
