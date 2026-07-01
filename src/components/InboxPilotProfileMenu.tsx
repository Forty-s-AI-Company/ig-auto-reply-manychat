"use client";

import Link from "next/link";
import { BarChart3, Bell, Bot, ChevronDown, CircleHelp, CreditCard, KeyRound, LogOut, Settings, Shield, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type InboxPilotProfileMenuProps = {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  planName?: string;
  planKey?: string;
  isAdmin?: boolean;
};

export function InboxPilotProfileMenu({ name, email, avatarUrl, planName = "Trial", planKey = "trial", isAdmin = false }: InboxPilotProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState("zh-TW");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  const displayName = name || "管理員";
  const displayEmail = email || "尚未設定 Email";
  const planActionLabel = getPlanActionLabel(planKey);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-[#b8dadd] hover:bg-white/8 hover:text-white"
        aria-expanded={open}
      >
        <ProfileAvatar avatarUrl={avatarUrl} displayName={displayName} size="sm" />
        <span className="min-w-0 flex-1 truncate text-left">我的個人檔案</span>
        <ChevronDown className={`h-3.5 w-3.5 text-[#81b6ba] transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {open ? (
        <div className="absolute bottom-full left-0 z-50 mb-2 max-h-[min(620px,calc(100vh-92px))] w-full overflow-y-auto rounded-md border border-[#d7dbe0] bg-white shadow-xl">
          <div className="flex items-center gap-3 p-4">
            <ProfileAvatar avatarUrl={avatarUrl} displayName={displayName} size="lg" />
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-[#111827]">{displayName}</p>
              <p className="truncate text-xs text-[#667085]">{displayEmail}</p>
            </div>
          </div>

          <div className="border-t border-[#edf0f2] p-4">
            <div className="rounded-md border border-[#d7dbe0] bg-[#f8fafc] p-3">
              <p className="text-xs font-medium text-[#667085]">目前方案</p>
              <div className="mt-1 flex items-center justify-between gap-3">
                <p className="min-w-0 truncate text-sm font-semibold text-[#111827]">{planName}</p>
                <Link
                  href="/billing"
                  className="shrink-0 rounded-md bg-[#19d3d8] px-2.5 py-1.5 text-xs font-semibold text-[#063a3d] hover:bg-[#11bfc4]"
                >
                  {planActionLabel}
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-[#edf0f2] py-2">
            <p className="px-4 py-2 text-xs font-medium text-[#98a2b3]">帳號與工作區</p>
            <MenuLink href="/profile" icon={<UserRound className="h-4 w-4" />} label="管理個人檔案" />
            <MenuLink href="/channels" icon={<Settings className="h-4 w-4" />} label="設定" />
            <MenuLink href="/billing" icon={<CreditCard className="h-4 w-4" />} label="方案與用量" />
            <MenuLink href="/analytics" icon={<BarChart3 className="h-4 w-4" />} label="分析報表" />
          </div>

          <div className="border-t border-[#edf0f2] py-2">
            <p className="px-4 py-2 text-xs font-medium text-[#98a2b3]">設定與支援</p>
            <MenuLink href="/channels#notifications" icon={<Bell className="h-4 w-4" />} label="通知設定" />
            <MenuLink href="/channels#ai-settings" icon={<Bot className="h-4 w-4" />} label="AI 設定" />
            <MenuLink href="/channels#extensions" icon={<KeyRound className="h-4 w-4" />} label="API 與應用程式" />
            {isAdmin ? <MenuLink href="/admin/audit" icon={<Shield className="h-4 w-4" />} label="登入與稽核紀錄" /> : null}
            <MenuLink href="/help-center" icon={<CircleHelp className="h-4 w-4" />} label="說明中心" />
          </div>

          <div className="border-t border-[#edf0f2] p-4">
            <label className="flex items-center justify-between gap-3 text-sm text-[#667085]">
              語言
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="h-9 flex-1 rounded-md border border-[#d7dbe0] bg-white px-3 text-[#111827]"
                aria-label="選擇介面語言"
                aria-describedby="profile-language-help"
              >
                <option value="zh-TW">繁體中文</option>
                <option value="en" disabled>
                  English（受控開通）
                </option>
              </select>
            </label>
            <p id="profile-language-help" className="mt-2 text-xs leading-5 text-[#667085]" data-testid="profile-language-help">
              目前後台固定使用繁體中文；英文介面會在翻譯、客服與審核文案整理完成後受控開通。
            </p>
          </div>

          <div className="border-t border-[#edf0f2] py-2">
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-[#4b5563] hover:bg-[#f2f4f7]"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              登出
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function getPlanActionLabel(planKey: string) {
  if (["trial", "starter", "creator"].includes(planKey)) return "升級到 Pro";
  if (planKey === "pro") return "升級到 Business";
  return "管理方案";
}

function ProfileAvatar({ avatarUrl, displayName, size }: { avatarUrl?: string | null; displayName: string; size: "sm" | "lg" }) {
  const className =
    size === "sm"
      ? "h-5 w-5 text-[10px]"
      : "h-12 w-12 text-lg";

  return (
    <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--primary-soft)] font-semibold text-[var(--deep-teal)] ${className}`}>
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
      ) : (
        displayName.slice(0, 1).toUpperCase()
      )}
    </div>
  );
}

function MenuLink({ href, icon, label }: { href: string; icon?: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-[#4b5563] hover:bg-[#f2f4f7]">
      <span className="shrink-0 text-[#667085]" aria-hidden="true">{icon}</span>
      <span className="min-w-0 flex-1">{label}</span>
    </Link>
  );
}
