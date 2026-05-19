"use client";

import { LogOut } from "lucide-react";

export function LogoutButton() {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
      title="登出"
    >
      <LogOut className="h-4 w-4" />
      登出
    </button>
  );
}
