"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DismissibleNoticeToast } from "@/components/DismissibleNoticeToast";

type ResyncConnectedAccountButtonProps = {
  accountId: string;
};

export function ResyncConnectedAccountButton({ accountId }: ResyncConnectedAccountButtonProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleResync() {
    if (submitting) return;
    setSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(`/api/oauth/accounts/${accountId}/sync`, {
        method: "POST",
      });
      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        channelCount?: number;
      };

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "重新同步失敗。");
      }

      setSuccessMessage(
        data.channelCount && data.channelCount > 0
          ? `這次同步了 ${data.channelCount} 個 channel。`
          : "同步完成，但這次沒有新增或更新任何 channel。",
      );
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "重新同步失敗。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleResync}
        disabled={submitting}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d0d5dd] bg-white px-3 text-xs font-medium text-[#17191c] hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RefreshCw className={submitting ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
        {submitting ? "同步中..." : "重新同步 Channel"}
      </button>

      {successMessage ? (
        <DismissibleNoticeToast title="Channel 同步完成" tone="success" key={`success-${successMessage}`}>
          {successMessage}
        </DismissibleNoticeToast>
      ) : null}

      {errorMessage ? (
        <DismissibleNoticeToast title="Channel 同步失敗" tone="danger" key={`error-${errorMessage}`} stackIndex={1}>
          {errorMessage}
        </DismissibleNoticeToast>
      ) : null}
    </>
  );
}
