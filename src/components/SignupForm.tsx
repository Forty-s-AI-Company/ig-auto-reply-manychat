"use client";

import Link from "next/link";
import { useState } from "react";

export function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
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
      return;
    }

    window.location.href = "/dashboard";
  }

  const googleSignupHref = `/api/auth/google/start${
    referralCode ? `?ref=${encodeURIComponent(referralCode)}` : ""
  }`;

  return (
    <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-lg border border-zinc-800 bg-zinc-950 p-6">
      <div>
        <p className="text-sm text-zinc-400">IG 自動化控制台</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">建立平台登入帳號</h1>
      </div>
      {error ? <p className="rounded-md bg-red-950 px-3 py-2 text-sm text-red-200">{error}</p> : null}
      <a
        href={googleSignupHref}
        className="flex w-full items-center justify-center gap-3 rounded-md border border-zinc-700 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4285f4] text-xs font-bold text-white">G</span>
        使用 Google 建立帳號
      </a>
      <div className="flex items-center gap-3 text-xs text-zinc-500">
        <span className="h-px flex-1 bg-zinc-800" />
        或使用 Email 建立
        <span className="h-px flex-1 bg-zinc-800" />
      </div>
      <label className="block text-sm">
        <span className="text-zinc-300">你的名稱</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
        />
      </label>
      <label className="block text-sm">
        <span className="text-zinc-300">Email</span>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
        />
      </label>
      <label className="block text-sm">
        <span className="text-zinc-300">密碼</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
        />
      </label>
      <label className="block text-sm">
        <span className="text-zinc-300">推薦碼（選填）</span>
        <input
          value={referralCode}
          onChange={(event) => setReferralCode(event.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
        />
      </label>
      <button className="w-full rounded-md bg-cyan-500 px-4 py-2 font-medium text-zinc-950 hover:bg-cyan-400">
        建立帳號
      </button>
      <p className="text-center text-sm text-zinc-400">
        已經有帳號？{" "}
        <Link href="/login" className="text-cyan-300 hover:text-cyan-200">
          回到登入
        </Link>
      </p>
    </form>
  );
}
