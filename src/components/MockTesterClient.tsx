"use client";

import { useState } from "react";

export function MockTesterClient() {
  const [externalId, setExternalId] = useState("mock-user-1");
  const [displayName, setDisplayName] = useState("測試使用者");
  const [text, setText] = useState("我要領取資料");
  const [result, setResult] = useState("");
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [sending, setSending] = useState(false);

  async function send() {
    setSending(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/webhooks/mock", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ externalId, displayName, text, consentStatus: "opted_in" }),
      });
      const payload = await response.json();
      setResult(JSON.stringify(payload, null, 2));
      setFeedback({
        tone: response.ok ? "success" : "error",
        message: response.ok ? "模擬訊息已送出，請到收件匣確認結果。" : payload?.error || "模擬訊息送出失敗，請確認測試資料。",
      });
    } catch (error) {
      setResult("");
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "模擬訊息送出失敗，請稍後再試。",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-[var(--text-primary)]">模擬測試</h2>
        <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
          本機模擬 inbound webhook，會建立聯絡人、對話、訊息，並觸發自動化流程。
        </p>
      </div>
      <section className="space-y-4 rounded-lg border border-[var(--border-soft)] bg-white p-5">
        <label className="block text-sm font-medium text-[var(--text-secondary)]" htmlFor="mock-external-id">
          外部 ID
          <input
            id="mock-external-id"
            name="mockExternalId"
            value={externalId}
            onChange={(e) => setExternalId(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
          />
        </label>
        <label className="block text-sm font-medium text-[var(--text-secondary)]" htmlFor="mock-display-name">
          顯示名稱
          <input
            id="mock-display-name"
            name="mockDisplayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            autoComplete="off"
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
          />
        </label>
        <label className="block text-sm font-medium text-[var(--text-secondary)]" htmlFor="mock-message-text">
          訊息內容
          <textarea
            id="mock-message-text"
            name="mockMessageText"
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoComplete="off"
            className="mt-1 h-32 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
          />
        </label>
        <button
          type="button"
          onClick={send}
          disabled={sending}
          className="inline-flex h-10 items-center rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[#063a3d] hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 disabled:cursor-wait disabled:bg-[var(--ip-surface-muted)] disabled:text-[var(--text-muted)]"
        >
          {sending ? "送出中…" : "送出模擬訊息"}
        </button>
      </section>
      {feedback ? (
        <p
          className={`rounded-md border px-4 py-3 text-sm leading-6 ${
            feedback.tone === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
          role="status"
          aria-live="polite"
        >
          {feedback.message}
        </p>
      ) : null}
      {result ? (
        <pre className="overflow-x-auto rounded-lg border border-[var(--border-soft)] bg-[var(--ip-surface-muted)] p-4 text-sm text-[var(--text-secondary)]">
          {result}
        </pre>
      ) : null}
    </div>
  );
}
