"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

type ActionState = {
  loading: boolean;
  message: string;
  tone: "neutral" | "success" | "error";
};

type InstagramChannelActionsProps = {
  channelId: string;
};

const idleState: ActionState = {
  loading: false,
  message: "可直接測試貼文讀取、留言同步與長效權杖更新。",
  tone: "neutral",
};

export function InstagramChannelActions({ channelId }: InstagramChannelActionsProps) {
  const [state, setState] = useState<ActionState>(idleState);

  async function runAction(action: "media" | "token" | "comments") {
    setState({ loading: true, message: "處理中，請稍候...", tone: "neutral" });
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
        message: error instanceof Error ? error.message : "Instagram 操作失敗。",
        tone: "error",
      });
    }
  }

  const messageClass =
    state.tone === "success" ? "text-green-300" : state.tone === "error" ? "text-red-300" : "text-zinc-400";

  return (
    <div className="mt-4 rounded-md border border-cyan-900/70 bg-cyan-950/20 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-cyan-100">Instagram 功能已開始實作</p>
          <p className={`mt-1 text-xs ${messageClass}`}>{state.message}</p>
        </div>
        {state.loading ? <RefreshCw className="h-4 w-4 animate-spin text-cyan-200" aria-hidden="true" /> : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href="/automations"
          className="rounded-md bg-cyan-400 px-3 py-1.5 text-xs font-medium text-zinc-950 hover:bg-cyan-300"
        >
          開啟視覺化自動化
        </Link>
        <Link
          href="/automations/instagram-default-reply"
          className="rounded-md border border-cyan-800 px-3 py-1.5 text-xs font-medium text-cyan-100 hover:bg-cyan-900/40"
        >
          設定預設回覆
        </Link>
        <button
          type="button"
          onClick={() => runAction("media")}
          disabled={state.loading}
          className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-100 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          抓取貼文
        </button>
        <button
          type="button"
          onClick={() => runAction("comments")}
          disabled={state.loading}
          className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-100 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          同步留言觸發
        </button>
        <button
          type="button"
          onClick={() => runAction("token")}
          disabled={state.loading}
          className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-100 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          更新長效權杖
        </button>
      </div>
    </div>
  );
}
