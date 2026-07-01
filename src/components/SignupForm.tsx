"use client";

import Link from "next/link";
import { useState } from "react";

export function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          workspaceName: `${name || email || "InboxPilot"} Workspace`,
          email,
          password,
          referralCode: referralCode || new URLSearchParams(window.location.search).get("ref"),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "註冊失敗，請稍後再試。");
        setSubmitting(false);
        return;
      }

      window.location.href = "/dashboard";
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "註冊失敗，請稍後再試。");
      setSubmitting(false);
    }
  }

  const googleSignupHref = `/api/auth/google/start${
    referralCode ? `?ref=${encodeURIComponent(referralCode)}` : ""
  }`;

  return (
    <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-lg border border-[#d7dbe0] bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-medium text-[#667085]">IG 自動化控制台</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#111827]">建立平台登入帳號</h1>
      </div>
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert" aria-live="polite">
          {error}
        </p>
      ) : null}
      <a
        href={googleSignupHref}
        className="flex w-full items-center justify-center gap-3 rounded-md border border-[#d7dbe0] bg-white px-4 py-2.5 text-sm font-semibold text-[#111827] transition hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e] focus-visible:ring-offset-2"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4285f4] text-xs font-bold text-white">G</span>
        使用 Google 建立帳號
      </a>
      <div className="flex items-center gap-3 text-xs text-[#667085]">
        <span className="h-px flex-1 bg-[#e5e7eb]" />
        或使用 Email 建立
        <span className="h-px flex-1 bg-[#e5e7eb]" />
      </div>
      <label className="block text-sm font-medium text-[#475467]" htmlFor="signup-name">
        你的名稱
        <input
          id="signup-name"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          className="mt-1 w-full rounded-md border border-[#d7dbe0] bg-white px-3 py-2 text-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e] focus-visible:ring-offset-2"
        />
      </label>
      <label className="block text-sm font-medium text-[#475467]" htmlFor="signup-email">
        Email
        <input
          id="signup-email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          spellCheck={false}
          className="mt-1 w-full rounded-md border border-[#d7dbe0] bg-white px-3 py-2 text-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e] focus-visible:ring-offset-2"
        />
      </label>
      <label className="block text-sm font-medium text-[#475467]" htmlFor="signup-password">
        密碼
        <input
          id="signup-password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          className="mt-1 w-full rounded-md border border-[#d7dbe0] bg-white px-3 py-2 text-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e] focus-visible:ring-offset-2"
        />
      </label>
      <label className="block text-sm font-medium text-[#475467]" htmlFor="signup-referral-code">
        推薦碼（選填）
        <input
          id="signup-referral-code"
          name="referralCode"
          value={referralCode}
          onChange={(event) => setReferralCode(event.target.value)}
          autoComplete="off"
          spellCheck={false}
          className="mt-1 w-full rounded-md border border-[#d7dbe0] bg-white px-3 py-2 text-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e] focus-visible:ring-offset-2"
        />
      </label>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-[#006fe6] px-4 py-2 font-medium text-white hover:bg-[#0057b8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006fe6] focus-visible:ring-offset-2 disabled:cursor-wait disabled:bg-[#e5e7eb] disabled:text-[#667085]"
      >
        {submitting ? "建立中…" : "建立帳號"}
      </button>
      <p className="text-center text-sm text-[#667085]">
        已經有帳號？{" "}
        <Link href="/login" className="font-medium text-[#006fe6] hover:text-[#0057b8]">
          回到登入
        </Link>
      </p>
    </form>
  );
}
