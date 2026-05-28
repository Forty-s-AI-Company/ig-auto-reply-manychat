"use client";

import { X } from "lucide-react";
import { useState, type ReactNode } from "react";

type DismissibleNoticeToastProps = {
  title: string;
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  defaultVisible?: boolean;
  stackIndex?: number;
};

const toneStyles = {
  neutral: "border-[#d7dbe2] text-[#344054]",
  success: "border-green-200 text-green-900",
  warning: "border-amber-200 text-amber-900",
  danger: "border-red-200 text-red-900",
  info: "border-cyan-200 text-cyan-950",
};

export function DismissibleNoticeToast({
  title,
  children,
  tone = "neutral",
  defaultVisible = true,
  stackIndex = 0,
}: DismissibleNoticeToastProps) {
  const [visible, setVisible] = useState(defaultVisible);
  if (!visible) return null;

  return (
    <div
      role="status"
      style={{ bottom: `calc(1.25rem + ${stackIndex} * 11.5rem)` }}
      className={`fixed bottom-5 right-5 z-50 w-[min(360px,calc(100vw-40px))] rounded-md border bg-white px-4 py-3 text-sm leading-6 shadow-[0_16px_48px_rgba(16,24,40,0.18)] ${toneStyles[tone]}`}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[#17191c]">{title}</p>
          <div className="mt-1 text-[#344054]">{children}</div>
        </div>
        <button
          type="button"
          aria-label="關閉提醒"
          onClick={() => setVisible(false)}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#667085] transition hover:bg-[#f2f4f7] hover:text-[#17191c]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
