"use client";

import { useState } from "react";

export function AdminInvoiceRefundButton({ invoiceId, disabled }: { invoiceId: string; disabled?: boolean }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRefund() {
    if (disabled || isSubmitting) return;

    const confirmed = window.confirm("確認要將這張帳單標記為已退款，並執行推薦折抵取消 / 沖回嗎？此動作不會自動呼叫 PayUNI 退款。");
    if (!confirmed) return;

    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/admin/invoices/${invoiceId}/refund`, {
        method: "POST",
        headers: { "content-type": "application/json" },
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(typeof payload.error === "string" ? payload.error : "退款折抵沖回失敗，請稍後再試。");
        return;
      }

      setMessage("已標記退款，推薦折抵已依規則取消或沖回。");
      window.location.reload();
    } catch {
      setError("無法連線到退款沖回服務，請稍後再試。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={disabled || isSubmitting}
        onClick={handleRefund}
        className="inline-flex h-8 items-center rounded-md border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-[#d7dbe0] disabled:bg-[#f8fafc] disabled:text-[#98a2b3]"
      >
        {isSubmitting ? "處理中..." : "標記退款"}
      </button>
      {message ? <p className="text-xs text-green-700" role="status">{message}</p> : null}
      {error ? <p className="text-xs text-red-700" role="alert">{error}</p> : null}
    </div>
  );
}
