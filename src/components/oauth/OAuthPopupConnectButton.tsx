"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import type { OAuthProviderId, PopupMessagePayload } from "@/lib/oauth/types";

type OAuthPopupConnectButtonProps = {
  provider: OAuthProviderId;
  href: string;
  children: ReactNode;
  className?: string;
  pendingLabel?: string;
  popupWidth?: number;
  popupHeight?: number;
  onSuccess?: (payload: PopupMessagePayload) => void;
};

export function OAuthPopupConnectButton({
  provider,
  href,
  children,
  className,
  pendingLabel = "連接中...",
  popupWidth = 540,
  popupHeight = 760,
  onSuccess,
}: OAuthPopupConnectButtonProps) {
  const popupRef = useRef<Window | null>(null);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function handleMessage(event: MessageEvent<PopupMessagePayload>) {
      if (event.origin !== window.location.origin) return;
      if (!event.data || !("provider" in event.data) || event.data.provider !== provider) return;

      popupRef.current?.close();
      setPending(false);

      if (event.data.status === "success") {
        onSuccess?.(event.data);
        router.refresh();
        return;
      }

      window.alert(event.data.message || "社群帳號連接失敗，請稍後再試。");
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onSuccess, provider, router]);

  function openPopup() {
    setPending(true);

    const left = Math.max(0, window.screenX + (window.outerWidth - popupWidth) / 2);
    const top = Math.max(0, window.screenY + (window.outerHeight - popupHeight) / 2);
    const popupName = `oauth-connect-${provider}-${Date.now()}`;
    const popup = window.open(
      href,
      popupName,
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`,
    );

    if (!popup) {
      window.location.href = href;
      return;
    }

    popupRef.current = popup;
    popup.focus();

    const timer = window.setInterval(() => {
      if (popup.closed) {
        setPending(false);
        window.clearInterval(timer);
      }
    }, 400);
  }

  return (
    <button type="button" onClick={openPopup} disabled={pending} className={className}>
      {pending ? pendingLabel : children}
    </button>
  );
}
