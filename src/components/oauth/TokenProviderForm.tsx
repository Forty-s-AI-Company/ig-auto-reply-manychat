"use client";

import { useState } from "react";

type TokenProviderFormProps = {
  provider: "telegram-bot";
  title: string;
  description: string;
};

export function TokenProviderForm({ provider, title, description }: TokenProviderFormProps) {
  const [token, setToken] = useState("");
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const trimmedToken = token.trim();
  const submitDisabledReason = submitting
    ? "正在驗證 Telegram Bot Token，請稍候。"
    : trimmedToken
      ? null
      : "請先貼上 Telegram Bot Token。";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    if (!trimmedToken) {
      setError("請先貼上 Telegram Bot Token。");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/oauth/${provider}/token`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token: trimmedToken, label: label.trim() }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        provider?: string;
        accountId?: string;
        displayName?: string;
      };

      if (!response.ok || !data.ok || !data.provider) {
        setError(data.error || "Token 連接失敗。");
        return;
      }

      if (window.opener) {
        window.opener.postMessage(
          {
            status: "success",
            provider: data.provider,
            accountId: data.accountId,
            displayName: data.displayName,
          },
          window.location.origin,
        );
      }

      window.close();
    } catch {
      setError("無法連線到 Token 驗證服務，請稍後再試。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-[#d7dbe0] bg-white p-6">
      <div>
        <h2 className="text-lg font-semibold text-[#17191c]">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-[#596170]">{description}</p>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[#17191c]">Bot 顯示名稱</span>
        <input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          className="h-11 w-full rounded-md border border-[#d0d5dd] px-3 text-sm outline-none transition focus:border-[#006fe6] focus:ring-2 focus:ring-[#dbeafe]"
          placeholder="例如：客服機器人"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[#17191c]">Telegram Bot Token</span>
        <input
          value={token}
          onChange={(event) => setToken(event.target.value)}
          className="h-11 w-full rounded-md border border-[#d0d5dd] px-3 font-mono text-sm outline-none transition focus:border-[#006fe6] focus:ring-2 focus:ring-[#dbeafe]"
          placeholder="123456789:AA..."
          autoFocus
        />
      </label>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-[#d92d20]" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={Boolean(submitDisabledReason)}
        aria-describedby={submitDisabledReason ? "token-provider-submit-disabled-reason" : undefined}
        title={submitDisabledReason || undefined}
        className="flex h-11 w-full items-center justify-center rounded-md bg-[#006fe6] px-4 text-sm font-semibold text-white transition hover:bg-[#005fd0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006fe6] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "驗證中…" : "連接 Telegram Bot"}
      </button>
      {submitDisabledReason ? (
        <p id="token-provider-submit-disabled-reason" className="text-xs leading-5 text-[#667085]">
          {submitDisabledReason}
        </p>
      ) : null}
    </form>
  );
}
