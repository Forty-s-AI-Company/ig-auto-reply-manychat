"use client";

import { useEffect } from "react";

export function OAuthPopupSuccess() {
  useEffect(() => {
    if (!window.opener) return;
    window.opener.postMessage({ type: "instagram-oauth-connected" }, window.location.origin);
    window.setTimeout(() => window.close(), 700);
  }, []);

  return <p className="mt-3 text-sm text-[#596170]">已通知原本視窗，這個授權視窗會自動關閉。</p>;
}
