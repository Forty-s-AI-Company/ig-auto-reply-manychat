"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

type CopyState = "idle" | "copied" | "error";

export function ReferralLinkCopyButton({ referralUrl }: { referralUrl: string }) {
  const [state, setState] = useState<CopyState>("idle");

  async function copyReferralUrl() {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("clipboard_unavailable");
      }
      await navigator.clipboard.writeText(referralUrl);
      setState("copied");
      window.setTimeout(() => setState("idle"), 2500);
    } catch {
      setState("error");
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:items-end" data-testid="referrals-copy-link">
      <button
        type="button"
        onClick={copyReferralUrl}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[var(--border-soft)] bg-white px-3 text-sm font-semibold text-[var(--teal-dark)] transition hover:bg-[var(--ip-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
        aria-live="polite"
      >
        {state === "copied" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
        {state === "copied" ? "已複製" : "複製推薦連結"}
      </button>
      {state === "error" ? (
        <p className="max-w-xs text-xs leading-5 text-amber-800" role="status">
          瀏覽器暫時不允許自動複製，請手動選取上方推薦連結。
        </p>
      ) : null}
      {state === "copied" ? (
        <p className="text-xs leading-5 text-emerald-700" role="status">
          已複製，可以直接貼給朋友或合作夥伴。
        </p>
      ) : null}
    </div>
  );
}
