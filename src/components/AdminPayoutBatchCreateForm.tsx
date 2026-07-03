"use client";

import { useState } from "react";

export function AdminPayoutBatchCreateForm() {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  return (
    <div className="ip-dashboard-card px-4 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-[var(--text-primary)]">建立內部對帳批次</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
            依目前已核准的受控分潤資料產生本月 15 日對帳批次；這不會觸發銀行匯款、PayUNI 付款或現金提領。
          </p>
        </div>
        <button
          type="button"
          title="只建立內部對帳批次，不會執行付款。"
          onClick={() => setIsConfirmOpen(true)}
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[#063a3d] transition hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
        >
          產生對帳批次
        </button>
      </div>

      {isConfirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="payout-batch-create-title"
            data-testid="admin-payout-batch-create-dialog"
            className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto overscroll-contain rounded-lg border border-[#d7dbe0] bg-white p-5 shadow-xl"
          >
            <h2 id="payout-batch-create-title" className="text-base font-semibold text-[#111827]">
              確認建立內部對帳批次？
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#475467]">
              這會把目前已核准的受控分潤資料整理成內部對帳批次，方便營運匯出 CSV 與人工核對。
            </p>
            <div className="mt-4 rounded-md border border-[#fedf89] bg-[#fffaeb] px-3 py-2 text-xs leading-5 text-[#93370d]">
              此動作不會執行銀行匯款、PayUNI 付款或現金提領；建立前請確認待審核分潤已完成人工核對。
            </div>
            <form action="/api/admin/payouts/batches" method="post" className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="rounded-md border border-[#d7dbe0] bg-white px-3 py-2 text-sm font-medium text-[#344054] transition hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8d9] focus-visible:ring-offset-2"
              >
                取消
              </button>
              <button
                type="submit"
                data-testid="admin-payout-batch-create-confirm"
                className="rounded-md border border-[var(--primary)] bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-[#063a3d] transition hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
              >
                確認建立批次
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
