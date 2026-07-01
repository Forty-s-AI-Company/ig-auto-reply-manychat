"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type DisconnectChannelButtonProps = {
  channelId: string;
  channelName: string;
};

export function DisconnectChannelButton({ channelId, channelName }: DisconnectChannelButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function disconnect() {
    if (isDeleting) return;
    setErrorMessage("");
    const confirmed = window.confirm(`確定要解除綁定「${channelName}」嗎？相關聯絡人、對話與訊息會一併刪除。`);
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/channels/${channelId}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "解除綁定失敗。");
      }
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "解除綁定失敗。");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={disconnect}
        disabled={isDeleting}
        aria-label={`解除綁定 ${channelName}`}
        title="解除綁定"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#fecdca] bg-white text-[#b42318] transition hover:border-[#fda29b] hover:bg-[#fef3f2] disabled:cursor-not-allowed disabled:border-[#d7dbe0] disabled:bg-[#f8fafc] disabled:text-[#98a2b3]"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>
      {errorMessage ? (
        <span className="max-w-52 text-right text-[11px] leading-4 text-red-700" role="status" aria-live="polite">
          {errorMessage}
        </span>
      ) : null}
    </span>
  );
}
