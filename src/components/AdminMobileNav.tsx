"use client";

import Link from "next/link";
import {
  BarChart3,
  Bot,
  CircleHelp,
  Clock,
  CreditCard,
  Gift,
  Home,
  Inbox,
  Megaphone,
  Menu,
  Settings,
  Shield,
  Sparkles,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { InboxPilotAccountDropdown } from "@/components/InboxPilotAccountDropdown";
import { InboxPilotLogo } from "@/components/InboxPilotLogo";
import { InboxPilotProfileMenu } from "@/components/InboxPilotProfileMenu";

type Workspace = {
  id: string;
  name: string;
};

type Channel = {
  id: string;
  name: string;
  displayName?: string;
  username?: string;
  avatarUrl?: string;
};

type AdminMobileNavProps = {
  workspaces: Workspace[];
  selectedWorkspaceId: string;
  channels: Channel[];
  selectedChannelId?: string;
  isAdmin?: boolean;
  user?: {
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
  } | null;
};

const baseNavItems = [
  { label: "首頁", href: "/dashboard", icon: Home },
  { label: "收件匣", href: "/inbox", icon: Inbox },
  { label: "聯絡人", href: "/contacts", icon: Users },
  { label: "廣播", href: "/broadcasts", icon: Megaphone },
  { label: "自動化", href: "/automations", icon: Sparkles },
  { label: "序列", href: "/sequences", icon: Clock },
  { label: "AI", href: "/ai-settings", icon: Bot },
  { label: "分析", href: "/analytics", icon: BarChart3 },
  { label: "帳單", href: "/billing", icon: CreditCard },
  { label: "推薦", href: "/referrals", icon: Gift },
  { label: "錢包", href: "/wallet", icon: Wallet },
  { label: "渠道", href: "/channels", icon: Settings },
];

export function AdminMobileNav({
  workspaces,
  selectedWorkspaceId,
  channels,
  selectedChannelId,
  isAdmin = false,
  user,
}: AdminMobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const navItems = isAdmin
    ? [...baseNavItems, { label: "稽核紀錄", href: "/admin/audit", icon: Shield }]
    : baseNavItems;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--ip-border)] bg-[var(--ip-surface)] text-[var(--ip-text)] shadow-sm lg:hidden"
        aria-label="開啟導覽"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[70] bg-black/35 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="關閉導覽背景"
          />
          <aside
            className="ip-sidebar-visual fixed inset-y-0 left-0 z-[80] flex max-w-[min(86vw,320px)] flex-col shadow-2xl lg:hidden"
            style={{
              position: "fixed",
              top: 0,
              bottom: 0,
              left: 0,
              zIndex: 80,
              display: "flex",
              flexDirection: "column",
              width: "min(86vw, 320px)",
              height: "100dvh",
              backgroundColor: "var(--sidebar-bg)",
            }}
          >
            <div className="ip-sidebar-content flex h-[64px] items-center justify-between border-b border-white/10 px-5">
              <Link href="/dashboard" onClick={() => setOpen(false)} aria-label="InboxPilot 首頁">
                <InboxPilotLogo tone="light" />
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#b8dadd] hover:bg-white/10 hover:text-white"
                aria-label="關閉導覽"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="ip-sidebar-account-layer border-b border-white/10 bg-[var(--sidebar-bg-dark)]/35 px-3 py-4">
              <InboxPilotAccountDropdown
                workspaces={workspaces}
                selectedWorkspaceId={selectedWorkspaceId}
                channels={channels}
                selectedChannelId={selectedChannelId}
              />
            </div>

            <nav className="ip-sidebar-nav-layer min-h-0 flex-1 overflow-y-auto px-2.5 py-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium ${
                      active ? "bg-white/10 text-white" : "text-[#b8dadd] hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    <Icon className={`h-5 w-5 shrink-0 ${active ? "text-[var(--primary)]" : "text-[#81b6ba]"}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="ip-sidebar-content border-t border-white/10 bg-[var(--sidebar-bg-dark)]/30 px-2 py-3">
              <InboxPilotProfileMenu name={user?.name} email={user?.email} avatarUrl={user?.avatarUrl} />
              <Link
                href="/help-center"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-[#b8dadd] hover:bg-white/8 hover:text-white"
              >
                <CircleHelp className="h-5 w-5 shrink-0 text-[#81b6ba]" />
                說明中心
              </Link>
            </div>
            <svg
              className="sidebar-lines"
              aria-hidden="true"
              viewBox="0 0 280 220"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M-40 190 C 70 130, 120 220, 300 80" stroke="rgba(25, 211, 216, 0.22)" strokeWidth="1" />
              <path d="M-30 210 C 80 150, 150 210, 310 110" stroke="rgba(25, 211, 216, 0.14)" strokeWidth="1" />
              <path d="M-60 170 C 80 90, 150 180, 320 40" stroke="rgba(25, 211, 216, 0.1)" strokeWidth="1" />
            </svg>
          </aside>
        </>
      ) : null}
    </>
  );
}
