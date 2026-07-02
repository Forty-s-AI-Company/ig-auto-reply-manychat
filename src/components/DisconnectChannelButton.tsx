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
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function disconnect() {
    if (isDeleting) return;
    setErrorMessage("");

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/channels/${channelId}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "解除綁定失敗。");
      }
      setIsConfirmOpen(false);
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
        onClick={() => setIsConfirmOpen(true)}
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
      {isConfirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="disconnect-channel-title"
            className="w-full max-w-md rounded-lg border border-[#fecdca] bg-white p-5 text-left shadow-xl"
          >
            <h2 id="disconnect-channel-title" className="text-base font-semibold text-[#111827]">
              解除綁定 Instagram 渠道？
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#475467]">
              你即將解除「{channelName}」。相關聯絡人、對話與訊息會一併移除，這個動作不適合用來暫時停用帳號。
            </p>
            <div className="mt-4 rounded-md border border-[#fedf89] bg-[#fffaeb] px-3 py-2 text-xs leading-5 text-[#93370d]">
              若只是 token 失效，請先使用「重新登入 IG 後連接」或更新長效權杖。
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                disabled={isDeleting}
                className="rounded-md border border-[#d7dbe0] bg-white px-3 py-2 text-sm font-medium text-[#344054] transition hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-60"
              >
                取消
              </button>
              <button
                type="button"
                onClick={disconnect}
                disabled={isDeleting}
                data-testid="disconnect-channel-confirm"
                className="rounded-md border border-[#b42318] bg-[#b42318] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#912018] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "解除中..." : "確認解除"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </span>
  );
}
