"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type OAuthPopupButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
};

export function OAuthPopupButton({ href, children, variant = "primary" }: OAuthPopupButtonProps) {
  const popupRef = useRef<Window | null>(null);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "instagram-oauth-connected") return;
      popupRef.current?.close();
      window.location.href = "/channels#instagram";
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  function openPopup() {
    setOpening(true);
    const width = 520;
    const height = 760;
    const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2);
    const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2);
    const popupName = `platform-account-connection-${Date.now()}`;
    const popup = window.open(href, popupName, `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`);

    if (!popup) {
      window.location.href = href;
      return;
    }

    popupRef.current = popup;
    popup.focus();
    setOpening(false);
  }

  const className =
    variant === "primary"
      ? "mt-6 flex h-11 w-full items-center justify-center rounded-md bg-[#006fe6] px-4 text-sm font-bold text-white hover:bg-[#005fd0]"
      : "flex h-11 items-center justify-center rounded-md border border-[#d2d6dc] bg-white px-4 text-sm font-bold text-[#17191c] hover:bg-[#f6f7f9]";

  return (
    <button type="button" onClick={openPopup} disabled={opening} className={className}>
      {opening ? "正在開啟..." : children}
    </button>
  );
}
