"use client";

import Link from "next/link";
import { ChevronDown, FileText, KeyRound, LogOut, Mail, Settings, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type InboxPilotProfileMenuProps = {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
};

export function InboxPilotProfileMenu({ name, email, avatarUrl }: InboxPilotProfileMenuProps) {
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

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-[#b8dadd] hover:bg-white/8 hover:text-white"
      >
        <ProfileAvatar avatarUrl={avatarUrl} displayName={displayName} size="sm" />
        <span className="min-w-0 flex-1 truncate text-left">我的個人檔案</span>
        <ChevronDown className={`h-3.5 w-3.5 text-[#81b6ba] transition ${open ? "rotate-180" : ""}`} />
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

          <div className="border-t border-[#edf0f2] py-2">
            <MenuLink href="/profile" icon={<UserRound className="h-4 w-4" />} label="管理個人檔案" />
            <MenuLink href="/channels" icon={<Settings className="h-4 w-4" />} label="管理帳號與渠道" />
            <MenuLink href="/broadcasts" icon={<FileText className="h-4 w-4" />} label="訊息報表" />
          </div>

          <div className="border-t border-[#edf0f2] py-2">
            <p className="px-4 py-2 text-xs text-[#98a2b3]">進階功能</p>
            <MenuLink href="/automations" label="我的範本" />
            <MenuLink href="/channels#extensions" label="API 設定" />
            <MenuLink href="/channels#extensions" label="我的應用程式" />
          </div>

          <div className="border-t border-[#edf0f2] p-4">
            <label className="flex items-center justify-between gap-3 text-sm text-[#667085]">
              語言
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="h-9 flex-1 rounded-md border border-[#d7dbe0] bg-white px-3 text-[#111827]"
              >
                <option value="zh-TW">繁體中文</option>
                <option value="en" disabled>
                  English
                </option>
              </select>
            </label>
          </div>

          <div className="border-t border-[#edf0f2] py-2">
            <MenuButton
              icon={<KeyRound className="h-4 w-4" />}
              label="新增登入方式"
              right={<DevelopmentBadge />}
              disabled
            />
            <MenuButton icon={<Mail className="h-4 w-4" />} label="Email 通知設定" right={<DevelopmentBadge />} disabled />
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-[#4b5563] hover:bg-[#f2f4f7]"
            >
              <LogOut className="h-4 w-4" />
              登出
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
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
      <span className="shrink-0 text-[#667085]">{icon}</span>
      <span className="min-w-0 flex-1">{label}</span>
    </Link>
  );
}

function MenuButton({
  icon,
  label,
  right,
  disabled = false,
}: {
  icon?: React.ReactNode;
  label: string;
  right?: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-[#4b5563] ${
        disabled ? "cursor-not-allowed opacity-70" : "hover:bg-[#f2f4f7]"
      }`}
    >
      <span className="shrink-0 text-[#667085]">{icon}</span>
      <span className="min-w-0 flex-1">{label}</span>
      {right}
    </button>
  );
}

function DevelopmentBadge() {
  return (
    <span className="rounded-sm bg-[#fff7ed] px-1.5 py-0.5 text-[11px] font-medium text-[#b45309]">
      排隊中
    </span>
  );
}
