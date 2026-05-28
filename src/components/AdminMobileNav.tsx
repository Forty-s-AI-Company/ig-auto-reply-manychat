"use client";

import Link from "next/link";
import { Bot, CircleHelp, Clock, CreditCard, Gift, Home, Inbox, Menu, Settings, Sparkles, Users, Wallet, X } from "lucide-react";
import { useEffect, useState } from "react";
import { InboxPilotAccountDropdown } from "@/components/InboxPilotAccountDropdown";
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
  user?: {
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
  } | null;
};

const mobileNavItems = [
  { label: "儀表板", href: "/dashboard", icon: Home },
  { label: "聯絡人", href: "/contacts", icon: Users },
  { label: "自動化", href: "/automations", icon: Sparkles },
  { label: "序列", href: "/sequences", icon: Clock },
  { label: "AI", href: "/ai-settings", icon: Bot },
  { label: "收件匣", href: "/inbox", icon: Inbox },
  { label: "付款", href: "/billing", icon: CreditCard },
  { label: "推薦", href: "/referrals", icon: Gift },
  { label: "錢包", href: "/wallet", icon: Wallet },
  { label: "IG 設定", href: "/channels", icon: Settings },
];

export function AdminMobileNav({
  workspaces,
  selectedWorkspaceId,
  channels,
  selectedChannelId,
  user,
}: AdminMobileNavProps) {
  const [open, setOpen] = useState(false);

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
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#d4d8df] bg-white text-[#111827] shadow-sm lg:hidden"
        aria-label="開啟選單"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[70] bg-black/35 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="關閉選單背景"
          />
          <aside
            className="fixed inset-y-0 left-0 z-[80] flex w-[min(86vw,320px)] flex-col border-r border-[#d8d8d8] bg-[#f4f4f4] shadow-2xl lg:hidden"
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
              backgroundColor: "#f4f4f4",
            }}
          >
            <div className="flex h-[60px] items-center justify-between border-b border-[#d8d8d8] px-5">
              <Link href="/dashboard" onClick={() => setOpen(false)} className="text-[24px] font-black tracking-normal text-[#202124]">
                InboxPilot
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#4b5563] hover:bg-[#e2e2e2]"
                aria-label="關閉選單"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border-b border-[#d8d8d8] px-3 py-4">
              <InboxPilotAccountDropdown
                workspaces={workspaces}
                selectedWorkspaceId={selectedWorkspaceId}
                channels={channels}
                selectedChannelId={selectedChannelId}
              />
            </div>

            <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-4">
              {mobileNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={false}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-[#4b5563] hover:bg-[#e2e2e2] hover:text-[#111827]"
                  >
                    <Icon className="h-5 w-5 shrink-0 text-[#667085]" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-[#d8d8d8] px-2 py-3">
              <InboxPilotProfileMenu name={user?.name} email={user?.email} avatarUrl={user?.avatarUrl} />
              <Link
                href="/channels#reference"
                prefetch={false}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#4b5563] hover:bg-[#e2e2e2]"
              >
                <CircleHelp className="h-5 w-5 shrink-0 text-[#667085]" />
                說明文件
              </Link>
            </div>
          </aside>
        </>
      ) : null}
    </>
  );
}
