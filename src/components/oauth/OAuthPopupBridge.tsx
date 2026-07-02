"use client";

import { useEffect } from "react";
import type { PopupMessagePayload } from "@/lib/oauth/types";

type OAuthPopupBridgeProps = {
  payload: PopupMessagePayload;
};

export function OAuthPopupBridge({ payload }: OAuthPopupBridgeProps) {
  useEffect(() => {
    if (!window.opener) return;
    window.opener.postMessage(payload, window.location.origin);
    window.setTimeout(() => window.close(), 350);
  }, [payload]);

  return (
    <div className="rounded-lg border border-[#d7dbe0] bg-white p-6 text-sm text-[#596170]" role="status" aria-live="polite">
      {payload.status === "success" ? "帳號已連接，正在回到原視窗…" : payload.message || "連接失敗，正在返回原視窗…"}
    </div>
  );
}
