"use client";

import { useState } from "react";

export function AdminInvoiceRefundButton({ invoiceId, disabled }: { invoiceId: string; disabled?: boolean }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submitRefund() {
    if (disabled || isSubmitting) return;

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
      setIsConfirmOpen(false);
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
        onClick={() => setIsConfirmOpen(true)}
        className="inline-flex h-8 items-center rounded-md border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-[#d7dbe0] disabled:bg-[#f8fafc] disabled:text-[#98a2b3]"
      >
        {isSubmitting ? "處理中..." : "標記退款"}
      </button>
      {message ? <p className="text-xs text-green-700" role="status">{message}</p> : null}
      {error ? <p className="text-xs text-red-700" role="alert">{error}</p> : null}
      {isConfirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`refund-invoice-title-${invoiceId}`}
            className="w-full max-w-lg rounded-lg border border-red-200 bg-white p-5 shadow-xl"
          >
            <h2 id={`refund-invoice-title-${invoiceId}`} className="text-base font-semibold text-[#111827]">
              確認標記退款？
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#475467]">
              這會把帳單標記為已退款，並執行推薦折抵取消 / 沖回。此動作只處理 InboxPilot 內部狀態，不會自動向 PayUNI 發起退款。
            </p>
            <div className="mt-4 rounded-md border border-[#fedf89] bg-[#fffaeb] px-3 py-2 text-xs leading-5 text-[#93370d]">
              請先確認 PayUNI 後台退款或人工退款流程已完成，再執行這個內部沖回動作。
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                disabled={isSubmitting}
                className="rounded-md border border-[#d7dbe0] bg-white px-3 py-2 text-sm font-medium text-[#344054] transition hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-60"
              >
                取消
              </button>
              <button
                type="button"
                onClick={submitRefund}
                disabled={isSubmitting}
                data-testid="admin-invoice-refund-confirm"
                className="rounded-md border border-red-700 bg-red-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "處理中..." : "確認標記退款"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
