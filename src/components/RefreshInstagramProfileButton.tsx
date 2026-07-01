"use client";

import { RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getChannelActionDisabledReason, getSafeChannelActionMessage } from "@/lib/channels/channel-action-feedback";

type RefreshInstagramProfileButtonProps = {
  channelId: string;
  hasStoredToken?: boolean;
};

export function RefreshInstagramProfileButton({ channelId, hasStoredToken = true }: RefreshInstagramProfileButtonProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const disabledReason = getChannelActionDisabledReason("profile", { hasStoredToken });

  async function refreshProfile() {
    if (isRefreshing || disabledReason) return;
    setIsRefreshing(true);
    setMessage("正在重新讀取帳號名稱與頭像…");
    try {
      const response = await fetch(`/api/channels/${channelId}/instagram-profile/refresh`, {
        method: "POST",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "重新讀取帳號名稱失敗。");
      }
      setMessage("已更新帳號名稱與頭像。");
      router.refresh();
    } catch (error) {
      setMessage(getSafeChannelActionMessage("profile", error));
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={refreshProfile}
        disabled={isRefreshing || Boolean(disabledReason)}
        title={disabledReason || "重新讀取帳號名稱"}
        aria-label={disabledReason || "重新讀取帳號名稱"}
        className="inline-flex items-center gap-1.5 rounded-md border border-amber-700 px-3 py-1.5 text-xs font-medium text-amber-100 hover:bg-amber-900/40 disabled:cursor-not-allowed disabled:border-[#d7dbe0] disabled:text-[#98a2b3] disabled:opacity-60"
      >
        <RotateCw className={isRefreshing ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} aria-hidden="true" />
        重新讀取帳號名稱
      </button>
      {disabledReason || message ? (
        <p className="text-[11px] text-[#667085]" aria-live="polite">
          {disabledReason || message}
        </p>
      ) : null}
    </div>
  );
}
