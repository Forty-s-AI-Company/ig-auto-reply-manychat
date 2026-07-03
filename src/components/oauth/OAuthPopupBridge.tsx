"use client";

import { useEffect } from "react";
import type { PopupMessagePayload } from "@/lib/oauth/types";

type OAuthPopupBridgeProps = {
  payload: PopupMessagePayload;
};

export function OAuthPopupBridge({ payload }: OAuthPopupBridgeProps) {
  const isError = payload.status === "error";

  useEffect(() => {
    if (!window.opener) return;
    window.opener.postMessage(payload, window.location.origin);
    window.setTimeout(() => window.close(), 350);
  }, [payload]);

  return (
    <div
      className={`rounded-lg border bg-white p-6 text-sm ${
        isError ? "border-red-200 text-red-900" : "border-[#d7dbe0] text-[#596170]"
      }`}
      role={isError ? "alert" : "status"}
      aria-live="polite"
      data-testid="oauth-popup-bridge-status"
    >
      {payload.status === "success" ? "帳號已連接，正在回到原視窗…" : payload.message || "連接失敗，正在返回原視窗…"}
    </div>
  );
}
