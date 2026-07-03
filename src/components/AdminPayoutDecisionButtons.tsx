"use client";

import { useState } from "react";

type Decision = "approve" | "reject";

type AdminPayoutDecisionButtonsProps = {
  payoutId: string;
  affiliateLabel: string;
  amountLabel: string;
};

const decisionCopy: Record<
  Decision,
  {
    buttonLabel: string;
    confirmLabel: string;
    title: string;
    description: string;
    warning: string;
    endpoint: (payoutId: string) => string;
    buttonClassName: string;
    confirmClassName: string;
  }
> = {
  approve: {
    buttonLabel: "核准進入對帳",
    confirmLabel: "確認核准",
    title: "確認核准進入對帳？",
    description:
      "這會把此分潤申請標記為已核准，並交給內部對帳批次處理。此動作不會自動匯款，也不會觸發 PayUNI 付款。",
    warning: "請先確認申請人、金額與受控聯盟資格都已人工核對完成。",
    endpoint: (payoutId) => `/api/admin/payouts/${payoutId}/approve`,
    buttonClassName:
      "bg-[var(--primary)] text-[#063a3d] hover:bg-[var(--primary-hover)] focus-visible:ring-[var(--primary)]",
    confirmClassName:
      "border-[var(--primary)] bg-[var(--primary)] text-[#063a3d] hover:bg-[var(--primary-hover)] focus-visible:ring-[var(--primary)]",
  },
  reject: {
    buttonLabel: "退回申請",
    confirmLabel: "確認退回",
    title: "確認退回分潤申請？",
    description:
      "這會把此分潤申請標記為已退回，只更新 InboxPilot 內部申請狀態，不會執行金流、匯款或提款動作。",
    warning: "退回前請確認原因已記錄在客服或營運備註中，避免後續對帳不清楚。",
    endpoint: (payoutId) => `/api/admin/payouts/${payoutId}/reject`,
    buttonClassName:
      "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 focus-visible:ring-red-300",
    confirmClassName:
      "border-red-700 bg-red-700 text-white hover:bg-red-800 focus-visible:ring-red-300",
  },
};

export function AdminPayoutDecisionButtons({ payoutId, affiliateLabel, amountLabel }: AdminPayoutDecisionButtonsProps) {
  const [decision, setDecision] = useState<Decision | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const copy = decision ? decisionCopy[decision] : null;

  async function submitDecision() {
    if (!decision || isSubmitting) return;

    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(decisionCopy[decision].endpoint(payoutId), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: decision === "reject" ? JSON.stringify({ reason: "rejected_by_admin" }) : undefined,
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(typeof payload.error === "string" ? payload.error : "分潤審核狀態更新失敗，請稍後再試。");
        return;
      }

      setMessage(decision === "approve" ? "已核准進入內部對帳。" : "已退回此分潤申請。");
      setDecision(null);
      window.location.reload();
    } catch {
      setError("無法連線到分潤審核服務，請稍後再試。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(decisionCopy) as Decision[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setDecision(key);
              setError(null);
              setMessage(null);
            }}
            disabled={isSubmitting}
            className={`inline-flex h-8 items-center rounded-md px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${decisionCopy[key].buttonClassName}`}
          >
            {decisionCopy[key].buttonLabel}
          </button>
        ))}
      </div>
      {message ? (
        <p className="text-xs text-green-700" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="text-xs text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      {copy ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`payout-decision-title-${payoutId}`}
            data-testid="admin-payout-decision-dialog"
            className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto overscroll-contain rounded-lg border border-[#d7dbe0] bg-white p-5 shadow-xl"
          >
            <h2 id={`payout-decision-title-${payoutId}`} className="text-base font-semibold text-[#111827]">
              {copy.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#475467]">{copy.description}</p>
            <dl className="mt-4 grid gap-2 rounded-md border border-[#d7dbe0] bg-[#f8fafc] px-3 py-2 text-xs text-[#475467]">
              <div className="flex justify-between gap-3">
                <dt className="font-medium text-[#344054]">申請人</dt>
                <dd className="min-w-0 break-words text-right">{affiliateLabel}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="font-medium text-[#344054]">金額</dt>
                <dd className="font-semibold text-[#111827]">{amountLabel}</dd>
              </div>
            </dl>
            <div className="mt-4 rounded-md border border-[#fedf89] bg-[#fffaeb] px-3 py-2 text-xs leading-5 text-[#93370d]">
              {copy.warning}
            </div>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDecision(null)}
                disabled={isSubmitting}
                className="rounded-md border border-[#d7dbe0] bg-white px-3 py-2 text-sm font-medium text-[#344054] transition hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8d9] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                取消
              </button>
              <button
                type="button"
                onClick={submitDecision}
                disabled={isSubmitting}
                data-testid="admin-payout-decision-confirm"
                className={`rounded-md border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${copy.confirmClassName}`}
              >
                {isSubmitting ? "處理中…" : copy.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
