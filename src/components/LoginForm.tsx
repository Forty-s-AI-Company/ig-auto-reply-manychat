"use client";

import Link from "next/link";
import { useState } from "react";

export function LoginForm() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123456");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error || "登入失敗，請確認帳號或密碼。");
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-lg border border-[#d7dbe0] bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-medium text-[#006fe6]">Instagram 自動回覆後台</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#111827]">登入系統</h1>
        <p className="mt-2 text-sm text-[#667085]">管理 Instagram 自動化、Inbox 對話與聯絡人資料。</p>
      </div>

      {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <label className="block text-sm">
        <span className="text-[#344054]">電子郵件</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1 w-full rounded-md border border-[#d7dbe0] bg-white px-3 py-2 text-[#111827] outline-none focus:border-[#006fe6] focus:ring-2 focus:ring-[#dbeafe]"
        />
      </label>

      <label className="block text-sm">
        <span className="text-[#344054]">密碼</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-1 w-full rounded-md border border-[#d7dbe0] bg-white px-3 py-2 text-[#111827] outline-none focus:border-[#006fe6] focus:ring-2 focus:ring-[#dbeafe]"
        />
      </label>

      <button className="w-full rounded-md bg-[#006fe6] px-4 py-2 font-medium text-white hover:bg-[#0057b8]">
        登入
      </button>

      <p className="text-center text-sm text-[#667085]">
        還沒有帳號？{" "}
        <Link href="/signup" className="text-[#006fe6] hover:text-[#0057b8]">
          建立新帳號
        </Link>
      </p>
    </form>
  );
}
