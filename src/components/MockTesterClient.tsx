"use client";

import { useState } from "react";

export function MockTesterClient() {
  const [externalId, setExternalId] = useState("mock-user-1");
  const [displayName, setDisplayName] = useState("測試使用者");
  const [text, setText] = useState("我要領取資料");
  const [result, setResult] = useState("");

  async function send() {
    const response = await fetch("/api/webhooks/mock", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ externalId, displayName, text, consentStatus: "opted_in" }),
    });
    setResult(JSON.stringify(await response.json(), null, 2));
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">模擬測試</h2>
        <p className="text-sm text-zinc-400">
          本機模擬 inbound webhook，會建立聯絡人、對話、訊息，並觸發自動化流程。
        </p>
      </div>
      <section className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <label className="block text-sm">
          <span className="text-zinc-300">外部 ID</span>
          <input value={externalId} onChange={(e) => setExternalId(e.target.value)} className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="text-zinc-300">顯示名稱</span>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="text-zinc-300">訊息內容</span>
          <textarea value={text} onChange={(e) => setText(e.target.value)} className="mt-1 h-32 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2" />
        </label>
        <button onClick={send} className="rounded-md bg-cyan-500 px-4 py-2 text-zinc-950">
          送出模擬訊息
        </button>
      </section>
      {result ? <pre className="rounded-lg bg-zinc-900 p-4 text-sm text-zinc-300">{result}</pre> : null}
    </div>
  );
}
