"use client";

import { useState } from "react";

type MockAuthorizeClientProps = {
  state: string;
};

function encodeMockCode(payload: { id: string; name: string; username: string }) {
  const encoded = window.btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function MockAuthorizeClient({ state }: MockAuthorizeClientProps) {
  const [busy, setBusy] = useState(false);

  function approve() {
    setBusy(true);
    const code = encodeMockCode({
      id: "mock-user-001",
      name: "Mock Workspace Owner",
      username: "mock_owner",
    });
    const url = new URL("/api/oauth/mock/callback", window.location.origin);
    url.searchParams.set("code", code);
    url.searchParams.set("state", state);
    window.location.href = url.toString();
  }

  function reject() {
    const url = new URL("/api/oauth/mock/callback", window.location.origin);
    url.searchParams.set("error", "access_denied");
    url.searchParams.set("error_description", "你在 Mock Provider 取消了授權。");
    url.searchParams.set("state", state);
    window.location.href = url.toString();
  }

  return (
    <div className="space-y-4 rounded-lg border border-[#d7dbe0] bg-white p-6">
      <div>
        <h2 className="text-lg font-semibold text-[#17191c]">Mock OAuth Provider</h2>
        <p className="mt-2 text-sm leading-6 text-[#596170]">
          這是本地測試用的假 provider。它會完整走 popup、state、callback、postMessage 流程，但不會碰外部平台。
        </p>
      </div>

      <div className="rounded-md border border-[#d7dbe0] bg-[#f8fafc] p-4 text-sm text-[#344054]">
        <p>測試帳號：Mock Workspace Owner</p>
        <p className="mt-1 font-mono text-xs">providerAccountId = mock-user-001</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={approve}
          disabled={busy}
          className="flex h-11 items-center justify-center rounded-md bg-[#006fe6] px-4 text-sm font-semibold text-white hover:bg-[#005fd0] disabled:opacity-60"
        >
          {busy ? "授權中..." : "同意授權"}
        </button>
        <button
          type="button"
          onClick={reject}
          className="flex h-11 items-center justify-center rounded-md border border-[#d0d5dd] bg-white px-4 text-sm font-semibold text-[#17191c] hover:bg-[#f9fafb]"
        >
          取消
        </button>
      </div>
    </div>
  );
}
