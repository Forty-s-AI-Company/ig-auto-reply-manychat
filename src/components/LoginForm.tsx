"use client";

import Link from "next/link";
import { useState } from "react";

const EMAIL_LOGIN_ERROR_MESSAGE = "登入失敗，請檢查帳號或密碼。";

export function LoginForm({ initialError = "" }: { initialError?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(initialError);
  const [submitting, setSubmitting] = useState(false);
  const trimmedEmail = email.trim();
  const loginDisabledReason = submitting
    ? "正在登入，請稍候。"
    : !trimmedEmail
      ? "請先輸入 Email。"
      : !password
        ? "請先輸入密碼。"
        : null;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    if (loginDisabledReason) {
      setError(loginDisabledReason);
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || EMAIL_LOGIN_ERROR_MESSAGE);
        setSubmitting(false);
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setError("無法連線到登入服務，請稍後再試。");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-lg border border-[#d7dbe0] bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-medium text-[#006fe6]">Instagram 自動回覆後台</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#111827]">登入系統</h1>
        <p className="mt-2 text-sm text-[#667085]">管理 Instagram 自動化、Inbox 對話與聯絡人資料。</p>
      </div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert" aria-live="polite">
          {error}
        </p>
      ) : null}

      <a
        href="/api/auth/google/start"
        className="flex w-full items-center justify-center gap-3 rounded-md border border-[#d7dbe0] bg-white px-4 py-2.5 text-sm font-semibold text-[#111827] transition hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006fe6] focus-visible:ring-offset-2"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4285f4] text-xs font-bold text-white">G</span>
        使用 Google 繼續
      </a>

      <div className="flex items-center gap-3 text-xs text-[#98a2b3]">
        <span className="h-px flex-1 bg-[#eaecf0]" />
        或使用 Email 登入
        <span className="h-px flex-1 bg-[#eaecf0]" />
      </div>

      <label className="block text-sm">
        <span className="text-[#344054]">電子郵件</span>
        <input
          id="login-email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          spellCheck={false}
          className="mt-1 w-full rounded-md border border-[#d7dbe0] bg-white px-3 py-2 text-[#111827] outline-none focus:border-[#006fe6] focus:ring-2 focus:ring-[#dbeafe]"
        />
      </label>

      <label className="block text-sm">
        <span className="text-[#344054]">密碼</span>
        <input
          id="login-password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          className="mt-1 w-full rounded-md border border-[#d7dbe0] bg-white px-3 py-2 text-[#111827] outline-none focus:border-[#006fe6] focus:ring-2 focus:ring-[#dbeafe]"
        />
      </label>

      <button
        type="submit"
        disabled={Boolean(loginDisabledReason)}
        aria-describedby={loginDisabledReason ? "login-submit-disabled-reason" : undefined}
        title={loginDisabledReason || undefined}
        className="w-full rounded-md bg-[#006fe6] px-4 py-2 font-medium text-white hover:bg-[#0057b8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006fe6] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#e5e7eb] disabled:text-[#667085]"
      >
        {submitting ? "登入中…" : "登入"}
      </button>
      {loginDisabledReason ? (
        <p id="login-submit-disabled-reason" className="text-xs leading-5 text-[#667085]">
          {loginDisabledReason}
        </p>
      ) : null}

      <p className="text-center text-sm text-[#667085]">
        還沒有帳號？{" "}
        <Link href="/signup" className="text-[#006fe6] hover:text-[#0057b8]">
          建立新帳號
        </Link>
      </p>
    </form>
  );
}
