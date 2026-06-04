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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const response = await fetch(`/api/oauth/${provider}/token`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, label }),
    });
    const data = (await response.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      provider?: string;
      accountId?: string;
      displayName?: string;
    };

    if (!response.ok || !data.ok || !data.provider) {
      setSubmitting(false);
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
          className="h-11 w-full rounded-md border border-[#d0d5dd] px-3 text-sm outline-none focus:border-[#006fe6]"
          placeholder="例如：客服機器人"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[#17191c]">Telegram Bot Token</span>
        <input
          value={token}
          onChange={(event) => setToken(event.target.value)}
          className="h-11 w-full rounded-md border border-[#d0d5dd] px-3 font-mono text-sm outline-none focus:border-[#006fe6]"
          placeholder="123456789:AA..."
          autoFocus
        />
      </label>

      {error ? <p className="text-sm text-[#d92d20]">{error}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="flex h-11 w-full items-center justify-center rounded-md bg-[#006fe6] px-4 text-sm font-semibold text-white hover:bg-[#005fd0] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "驗證中..." : "連接 Telegram Bot"}
      </button>
    </form>
  );
}
