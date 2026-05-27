"use client";

import { RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type RefreshInstagramProfileButtonProps = {
  channelId: string;
};

export function RefreshInstagramProfileButton({ channelId }: RefreshInstagramProfileButtonProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function refreshProfile() {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const response = await fetch(`/api/channels/${channelId}/instagram-profile/refresh`, {
        method: "POST",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "重新讀取帳號名稱失敗。");
      }
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "重新讀取帳號名稱失敗。");
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <button
      type="button"
      onClick={refreshProfile}
      disabled={isRefreshing}
      className="inline-flex items-center gap-1.5 rounded-md border border-amber-700 px-3 py-1.5 text-xs font-medium text-amber-100 hover:bg-amber-900/40 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <RotateCw className={isRefreshing ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} aria-hidden="true" />
      重新讀取帳號名稱
    </button>
  );
}
