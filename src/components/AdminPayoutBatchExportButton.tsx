"use client";

import { useState } from "react";

type AdminPayoutBatchExportButtonProps = {
  batchId: string;
  itemCount: number;
  totalAmountLabel: string;
};

export function AdminPayoutBatchExportButton({ batchId, itemCount, totalAmountLabel }: AdminPayoutBatchExportButtonProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  function downloadCsv() {
    window.location.href = `/api/admin/payouts/batches/${batchId}/export`;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsConfirmOpen(true)}
        className="font-semibold text-[var(--teal-dark)] transition hover:text-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
        title="下載內部對帳 CSV，不會執行付款。"
      >
        下載對帳 CSV
      </button>

      {isConfirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`payout-batch-export-title-${batchId}`}
            data-testid="admin-payout-batch-export-dialog"
            className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto overscroll-contain rounded-lg border border-[#d7dbe0] bg-white p-5 shadow-xl"
          >
            <h2 id={`payout-batch-export-title-${batchId}`} className="text-base font-semibold text-[#111827]">
              確認下載內部對帳 CSV？
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#475467]">
              這份 CSV 只供營運核對受控分潤批次，不會執行銀行匯款、PayUNI 付款或現金提領。
            </p>
            <dl className="mt-4 grid gap-2 rounded-md border border-[#d7dbe0] bg-[#f8fafc] px-3 py-2 text-xs text-[#475467]">
              <div className="flex justify-between gap-3">
                <dt className="font-medium text-[#344054]">批次 ID</dt>
                <dd className="min-w-0 break-all text-right font-mono">{batchId}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="font-medium text-[#344054]">筆數</dt>
                <dd>{itemCount} 筆</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="font-medium text-[#344054]">總金額</dt>
                <dd className="font-semibold text-[#111827]">{totalAmountLabel}</dd>
              </div>
            </dl>
            <div className="mt-4 rounded-md border border-[#fedf89] bg-[#fffaeb] px-3 py-2 text-xs leading-5 text-[#93370d]">
              下載前請確認這是正確批次，並依內部流程保存檔案；CSV 可能包含對帳用識別資訊，請勿轉貼到公開管道。
            </div>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="rounded-md border border-[#d7dbe0] bg-white px-3 py-2 text-sm font-medium text-[#344054] transition hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8d9] focus-visible:ring-offset-2"
              >
                取消
              </button>
              <button
                type="button"
                onClick={downloadCsv}
                data-testid="admin-payout-batch-export-confirm"
                className="rounded-md border border-[var(--primary)] bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-[#063a3d] transition hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
              >
                確認下載 CSV
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
