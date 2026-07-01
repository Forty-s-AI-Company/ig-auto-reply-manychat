"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const SHOW_DELAY_MS = 90;
const MAX_VISIBLE_MS = 12000;

function isSameOriginUrl(value: string) {
  try {
    const url = new URL(value, window.location.href);
    return url.origin === window.location.origin;
  } catch {
    return false;
  }
}

function shouldTrackAnchor(anchor: HTMLAnchorElement) {
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;
  return isSameOriginUrl(href);
}

export function GlobalBusyIndicator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const pendingCount = useRef(0);
  const showTimer = useRef<number | null>(null);
  const maxTimer = useRef<number | null>(null);

  function clearTimers() {
    if (showTimer.current) window.clearTimeout(showTimer.current);
    if (maxTimer.current) window.clearTimeout(maxTimer.current);
    showTimer.current = null;
    maxTimer.current = null;
  }

  function begin() {
    pendingCount.current += 1;
    if (!showTimer.current && !visible) {
      showTimer.current = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    }
    if (!maxTimer.current) {
      maxTimer.current = window.setTimeout(() => {
        pendingCount.current = 0;
        clearTimers();
        setVisible(false);
      }, MAX_VISIBLE_MS);
    }
  }

  function end() {
    pendingCount.current = Math.max(0, pendingCount.current - 1);
    if (pendingCount.current > 0) return;
    clearTimers();
    setVisible(false);
  }

  useEffect(() => {
    end();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  useEffect(() => {
    const originalFetch = window.fetch.bind(window);

    window.fetch = async (input, init) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      const method = (init?.method || (typeof input !== "string" && !(input instanceof URL) ? input.method : "GET") || "GET").toUpperCase();
      const shouldTrack = isSameOriginUrl(url) && (method !== "GET" || new URL(url, window.location.href).pathname.startsWith("/api/"));
      if (shouldTrack) begin();
      try {
        return await originalFetch(input, init);
      } finally {
        if (shouldTrack) end();
      }
    };

    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target.closest("a") : null;
      if (!(target instanceof HTMLAnchorElement) || !shouldTrackAnchor(target)) return;
      const next = new URL(target.href);
      if (next.pathname === window.location.pathname && next.search === window.location.search) return;
      begin();
    }

    function handleSubmit(event: SubmitEvent) {
      if (event.defaultPrevented) return;
      begin();
    }

    document.addEventListener("click", handleClick, true);
    document.addEventListener("submit", handleSubmit, true);

    return () => {
      window.fetch = originalFetch;
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("submit", handleSubmit, true);
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100]">
      <div className="h-1 overflow-hidden bg-[#dbeafe]">
        <div className="inboxpilot-progress-bar h-full w-1/2 bg-[#006fe6]" />
      </div>
      <div
        className="fixed bottom-4 right-4 rounded-md border border-[#d7dbe0] bg-white px-4 py-3 text-sm font-medium text-[#344054] shadow-[0_14px_34px_rgba(16,24,40,0.16)]"
        role="status"
        aria-live="polite"
      >
        正在更新，請稍候…
      </div>
    </div>
  );
}
