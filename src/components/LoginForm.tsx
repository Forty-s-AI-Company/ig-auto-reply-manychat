"use client";

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
      setError(data.error || "登入失敗");
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-lg border border-zinc-800 bg-zinc-950 p-6">
      <div>
        <p className="text-sm text-zinc-400">Personal Chat Automation Hub</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">管理後台登入</h1>
      </div>
      {error ? <p className="rounded-md bg-red-950 px-3 py-2 text-sm text-red-200">{error}</p> : null}
      <label className="block text-sm">
        <span className="text-zinc-300">Email</span>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
        />
      </label>
      <label className="block text-sm">
        <span className="text-zinc-300">Password</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
        />
      </label>
      <button className="w-full rounded-md bg-cyan-500 px-4 py-2 font-medium text-zinc-950 hover:bg-cyan-400">
        登入
      </button>
    </form>
  );
}
