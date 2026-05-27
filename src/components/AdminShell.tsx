import Link from "next/link";
import { Bot, CircleHelp, Clock, CreditCard, Gift, Home, Inbox, Settings, Sparkles, Users, Wallet } from "lucide-react";
import { InboxPilotAccountDropdown } from "@/components/InboxPilotAccountDropdown";
import { InboxPilotProfileMenu } from "@/components/InboxPilotProfileMenu";
import { getSelectedInstagramChannelId } from "@/lib/account-scope";
import { getCurrentUser } from "@/lib/auth";
import { getMetaChannelConfig } from "@/lib/channels/meta";
import { getDb } from "@/lib/db";
import { getCurrentWorkspace, getUserWorkspaces } from "@/lib/workspaces";

const primaryNavItems = [
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

export async function AdminShell({
  children,
  title = "儀表板",
  headerCenter,
  headerRight,
}: {
  children: React.ReactNode;
  title?: string;
  headerCenter?: React.ReactNode;
  headerRight?: React.ReactNode;
}) {
  const workspace = await getCurrentWorkspace();
  const [user, instagramChannels, selectedChannelId] = await Promise.all([
    getCurrentUser(),
    getDb().channel.findMany({
      where: { workspaceId: workspace.id, type: "instagram", enabled: true },
      orderBy: [{ name: "asc" }],
      select: { id: true, name: true, configJson: true },
    }),
    getSelectedInstagramChannelId(),
  ]);
  const workspaces = user ? await getUserWorkspaces(user.id) : [workspace];
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

  return (
    <div className="manychat-shell min-h-screen bg-[#f5f5f5] text-[#101828]">
      <aside className="fixed inset-y-0 left-0 hidden w-[216px] border-r border-[#d8d8d8] bg-[#f4f4f4] lg:block">
        <div className="flex h-full flex-col">
          <div className="flex h-[60px] items-center border-b border-[#d8d8d8] px-6">
            <Link href="/dashboard" className="text-[25px] font-black tracking-[-0.04em] text-[#202124]">
              InboxPilot
            </Link>
          </div>

          <div className="border-b border-[#d8d8d8] px-3 py-4">
            <InboxPilotAccountDropdown
              workspaces={JSON.parse(JSON.stringify(workspaces))}
              selectedWorkspaceId={workspace.id}
              channels={JSON.parse(JSON.stringify(accountChannels))}
              selectedChannelId={selectedChannelId}
            />
          </div>

          <nav className="px-2 py-4">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-[#4b5563] hover:bg-[#e2e2e2] hover:text-[#111827]"
                >
                  <Icon className="h-5 w-5 text-[#667085]" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-[#d8d8d8] px-2 py-3">
            <InboxPilotProfileMenu name={user?.name} email={user?.email} />
            <Link
              href="/channels#reference"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#4b5563] hover:bg-[#e2e2e2]"
            >
              <CircleHelp className="h-5 w-5 text-[#667085]" />
              說明文件
            </Link>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[216px]">
        <header className="sticky top-0 z-10 h-[60px] border-b border-[#d8d8d8] bg-[#f5f5f5]/95 px-6 backdrop-blur">
          <div className="grid h-full grid-cols-[minmax(180px,1fr)_auto_minmax(180px,1fr)] items-center gap-4">
            <h1 className="truncate text-2xl font-semibold text-[#111827]">{title}</h1>
            <div className="justify-self-center">{headerCenter}</div>
            <div className="justify-self-end">{headerRight}</div>
          </div>
        </header>
        <main className="w-full px-5 py-5">{children}</main>
      </div>
    </div>
  );
}
