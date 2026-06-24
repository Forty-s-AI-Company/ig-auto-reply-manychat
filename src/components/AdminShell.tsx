import Link from "next/link";
import { Bot, CircleHelp, Clock, CreditCard, Gift, Home, Inbox, Settings, Shield, Sparkles, Users, Wallet } from "lucide-react";
import { cookies } from "next/headers";
import { AdminMobileNav } from "@/components/AdminMobileNav";
import { AdminSidebarLink } from "@/components/AdminSidebarLink";
import { InboxPilotAccountDropdown } from "@/components/InboxPilotAccountDropdown";
import { InboxPilotLogo } from "@/components/InboxPilotLogo";
import { InboxPilotProfileMenu } from "@/components/InboxPilotProfileMenu";
import { ALL_IG_ACCOUNTS, IG_ACCOUNT_SCOPE_COOKIE } from "@/lib/account-scope";
import { getCurrentUser } from "@/lib/auth";
import { getMetaChannelConfig } from "@/lib/channels/meta";
import { getDb } from "@/lib/db";
import { getCurrentReleaseChannel } from "@/lib/release-mode";
import { getServerCache } from "@/lib/server-cache";
import { getCurrentWorkspace, getUserWorkspaces } from "@/lib/workspaces";

const basePrimaryNavItems = [
  { label: "首頁", href: "/dashboard", icon: Home, iconName: "home" },
  { label: "收件匣", href: "/inbox", icon: Inbox, iconName: "inbox" },
  { label: "聯絡人", href: "/contacts", icon: Users, iconName: "users" },
  { label: "廣播活動", href: "/broadcasts", icon: Sparkles, iconName: "megaphone" },
  { label: "自動化", href: "/automations", icon: Sparkles, iconName: "sparkles" },
  { label: "序列", href: "/sequences", icon: Clock, iconName: "clock" },
  { label: "AI", href: "/ai-settings", icon: Bot, iconName: "bot" },
  { label: "分析", href: "/analytics", icon: Sparkles, iconName: "barChart3" },
  { label: "帳單", href: "/billing", icon: CreditCard, iconName: "creditCard" },
  { label: "推薦", href: "/referrals", icon: Gift, iconName: "gift" },
  { label: "錢包", href: "/wallet", icon: Wallet, iconName: "wallet" },
  { label: "渠道", href: "/channels", icon: Settings, iconName: "settings" },
] as const;

const simplePrimaryNavHrefs = new Set(["/dashboard", "/inbox", "/contacts", "/channels", "/analytics", "/automations", "/referrals"]);
const adminNavItem = { label: "稽核紀錄", href: "/admin/audit", icon: Shield, iconName: "shield" } as const;
const ADMIN_SHELL_CACHE_TTL_MS = 5_000;

export async function AdminShell({
  children,
  title = "首頁",
  headerCenter,
  headerRight,
}: {
  children: React.ReactNode;
  title?: string;
  headerCenter?: React.ReactNode;
  headerRight?: React.ReactNode;
}) {
  const workspace = await getCurrentWorkspace();
  const user = await getCurrentUser();
  const isAdmin = user?.role === "admin";
  const releaseChannel = await getCurrentReleaseChannel();
  const visibleBaseNavItems =
    releaseChannel === "simple" ? basePrimaryNavItems.filter((item) => simplePrimaryNavHrefs.has(item.href)) : basePrimaryNavItems;
  const primaryNavItems = isAdmin && releaseChannel === "full" ? [...visibleBaseNavItems, adminNavItem] : visibleBaseNavItems;
  const cookieStore = await cookies();
  const instagramChannels = await getServerCache(`admin-shell:instagram-channels:${workspace.id}`, ADMIN_SHELL_CACHE_TTL_MS, () =>
    getDb().channel.findMany({
      where: { workspaceId: workspace.id, type: "instagram", enabled: true },
      orderBy: [{ name: "asc" }],
      select: { id: true, name: true, configJson: true },
    }),
  );
  const workspaces = user
    ? await getServerCache(`admin-shell:user-workspaces:${user.id}`, ADMIN_SHELL_CACHE_TTL_MS, () => getUserWorkspaces(user.id))
    : [workspace];
  const accountChannels = instagramChannels
    .map((channel) => {
      const config = getMetaChannelConfig(channel.configJson);
      const username = config.instagramUsername || "";
      return {
        id: channel.id,
        name: channel.name,
        displayName: config.instagramName || (username ? `@${username}` : channel.name.replace(/^Instagram\s*@?/i, "")),
        username,
        avatarUrl: config.instagramProfilePictureUrl || "",
      };
    })
    .filter((channel) => Boolean(channel.username || channel.avatarUrl || channel.displayName.startsWith("Carry") || channel.name.startsWith("Instagram @")))
    .sort((a, b) => Number(Boolean(b.username)) - Number(Boolean(a.username)) || a.displayName.localeCompare(b.displayName, "zh-TW"));
  const serializedWorkspaces = JSON.parse(JSON.stringify(workspaces));
  const serializedAccountChannels = JSON.parse(JSON.stringify(accountChannels));
  const selectedChannelCookie = cookieStore.get(IG_ACCOUNT_SCOPE_COOKIE)?.value;
  const selectedChannelId =
    selectedChannelCookie && selectedChannelCookie !== ALL_IG_ACCOUNTS && accountChannels.some((channel) => channel.id === selectedChannelCookie)
      ? selectedChannelCookie
      : undefined;
  const mobileUser = user
    ? {
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      }
    : null;

  return (
    <div className="manychat-shell min-h-screen bg-[var(--ip-bg)] text-[var(--ip-text)]">
      <aside className="ip-sidebar-visual fixed inset-y-0 left-0 z-40 hidden text-white lg:block">
        <div className="ip-sidebar-content flex h-full flex-col">
          <div className="flex h-[64px] items-center border-b border-white/10 px-5">
            <Link href="/dashboard" aria-label="InboxPilot 首頁">
              <InboxPilotLogo tone="light" />
            </Link>
          </div>

          <div className="ip-sidebar-account-layer border-b border-white/10 bg-[var(--sidebar-bg-dark)]/35 px-3 py-4">
            <InboxPilotAccountDropdown
              workspaces={serializedWorkspaces}
              selectedWorkspaceId={workspace.id}
              channels={serializedAccountChannels}
              selectedChannelId={selectedChannelId}
            />
          </div>

          <nav className="ip-sidebar-nav-layer space-y-1 px-2.5 py-4">
            {primaryNavItems.map((item) => (
              <AdminSidebarLink key={item.href} href={item.href} label={item.label} iconName={item.iconName} />
            ))}
          </nav>

          <div className="mt-auto border-t border-white/10 bg-[var(--sidebar-bg-dark)]/30 px-2 py-3">
            <InboxPilotProfileMenu name={user?.name} email={user?.email} avatarUrl={user?.avatarUrl} />
            <Link
              href="/help-center"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-[#b8dadd] hover:bg-white/8 hover:text-white"
            >
              <CircleHelp className="h-5 w-5 text-[#81b6ba]" />
              說明中心
            </Link>
          </div>
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

      <div className="ip-main-visual min-h-screen lg:pl-[280px]">
        <header className="sticky top-0 z-10 h-[64px] border-b border-transparent bg-[var(--ip-bg)]/70 px-4 backdrop-blur lg:px-6">
          <div className="grid h-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 lg:grid-cols-[minmax(180px,1fr)_auto_minmax(180px,1fr)] lg:gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <AdminMobileNav
                workspaces={serializedWorkspaces}
                selectedWorkspaceId={workspace.id}
                channels={serializedAccountChannels}
                selectedChannelId={selectedChannelId}
                isAdmin={isAdmin}
                releaseChannel={releaseChannel}
                user={mobileUser}
              />
              <h1 className="truncate text-[24px] font-semibold text-[var(--ip-text)]">{title}</h1>
            </div>
            <div className="hidden justify-self-center sm:block">{headerCenter}</div>
            <div className="justify-self-end">{headerRight}</div>
          </div>
        </header>
        <main className="ip-main-content w-full px-5 py-5 lg:px-6">{children}</main>
      </div>
    </div>
  );
}
