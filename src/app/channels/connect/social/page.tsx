import { Bot, Camera, FlaskConical, Link2, MessageCircleMore } from "lucide-react";
import { ChannelConnectionShell, InstagramVisual } from "@/components/ChannelConnectionShell";
import { OAuthPopupConnectButton } from "@/components/oauth/OAuthPopupConnectButton";
import { ResyncConnectedAccountButton } from "@/components/oauth/ResyncConnectedAccountButton";
import { requireUser } from "@/lib/auth";
import { getMetaChannelConfig } from "@/lib/channels/meta";
import { getDb } from "@/lib/db";
import { listOAuthProviders } from "@/lib/oauth/registry";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

const providerCopy = {
  "meta-instagram": {
    title: "Instagram OAuth",
    description: "使用 Instagram OAuth popup 連接商業帳號。成功後會保存授權資料，並同步建立或更新 Instagram channel。",
    icon: Camera,
  },
  "meta-facebook": {
    title: "Facebook / Meta Login",
    description: "標準 Facebook OAuth popup。成功後會抓取可用的 Instagram 資產，並同步建立或更新 channel。",
    icon: MessageCircleMore,
  },
  "telegram-bot": {
    title: "Telegram Bot Token",
    description: "在 popup 內輸入 Bot Token。系統會先呼叫 Telegram getMe 驗證，通過後再安全儲存。",
    icon: Bot,
  },
  mock: {
    title: "Mock OAuth Provider",
    description: "本地測試用假 provider。完整走 popup、callback、postMessage 流程，不會碰真實平台。",
    icon: FlaskConical,
  },
} as const;

type ChannelSummary = {
  id: string;
  name: string;
  enabled: boolean;
  instagramBusinessAccountId?: string;
  instagramOauthUserId?: string;
  instagramUsername?: string;
};

function buildChannelSummaries(channels: Array<{ id: string; name: string; enabled: boolean; configJson: unknown }>): ChannelSummary[] {
  return channels.map((channel) => {
    const config = getMetaChannelConfig(channel.configJson);
    return {
      id: channel.id,
      name: channel.name,
      enabled: channel.enabled,
      instagramBusinessAccountId: config.instagramBusinessAccountId,
      instagramOauthUserId: config.instagramOauthUserId,
      instagramUsername: config.instagramUsername,
    };
  });
}

function findSyncedChannels(
  account: { provider: string; providerAccountId: string; username: string | null },
  channels: ChannelSummary[],
) {
  if (account.provider === "meta-instagram" || account.provider === "meta-facebook") {
    return channels.filter((channel) => {
      if (channel.instagramBusinessAccountId === account.providerAccountId) return true;
      if (channel.instagramOauthUserId === account.providerAccountId) return true;
      if (account.username && channel.instagramUsername === account.username) return true;
      return false;
    });
  }

  return [];
}

function formatTime(value: Date) {
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export default async function SocialConnectPage() {
  await requireUser();
  const workspaceId = await getCurrentWorkspaceId();
  const [accounts, providers, channels] = await Promise.all([
    getDb().connectedAccount.findMany({
      where: { workspaceId },
      orderBy: [{ provider: "asc" }, { connectedAt: "desc" }],
    }),
    Promise.resolve(listOAuthProviders()),
    getDb().channel.findMany({
      where: { workspaceId, type: "instagram" },
      orderBy: [{ updatedAt: "desc" }],
      select: { id: true, name: true, enabled: true, configJson: true },
    }),
  ]);

  const channelSummaries = buildChannelSummaries(channels);

  return (
    <ChannelConnectionShell
      title="連接 Social Accounts"
      description="這一頁是可重用的 OAuth Popup 模組入口。Meta、Telegram 與 Mock provider 都走同一套授權與回傳協定。"
      backHref="/channels/connect"
      backLabel="返回連接渠道"
      visual={<InstagramVisual />}
    >
      <div className="space-y-6">
        <div className="rounded-lg border border-[#d7dbe0] bg-white p-5">
          <h2 className="text-lg font-semibold text-[#17191c]">已連接帳號</h2>
          <p className="mt-2 text-sm text-[#596170]">
            目前工作區有 {accounts.length} 個 ConnectedAccount，以及 {channelSummaries.length} 個 Instagram channel。
          </p>

          <div className="mt-4 space-y-3">
            {accounts.length === 0 ? (
              <div className="rounded-md border border-dashed border-[#d7dbe0] bg-[#f8fafc] p-4 text-sm text-[#596170]">
                還沒有任何 Social Login 連接。下面任選一個 provider 開始測。
              </div>
            ) : (
              accounts.map((account) => {
                const syncedChannels = findSyncedChannels(account, channelSummaries);

                return (
                  <div key={account.id} className="rounded-md border border-[#d7dbe0] bg-[#f8fafc] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#17191c]">{account.displayName}</p>
                        <p className="mt-1 text-xs text-[#596170]">
                          {account.provider}
                          {account.username ? ` · @${account.username}` : ""}
                          {` · ${account.providerAccountId}`}
                        </p>
                        <p className="mt-1 text-xs text-[#98a2b3]">連接時間：{formatTime(account.connectedAt)}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">已連接</span>
                        {(account.provider === "meta-instagram" || account.provider === "meta-facebook") && (
                          <ResyncConnectedAccountButton accountId={account.id} />
                        )}
                      </div>
                    </div>

                    <div className="mt-4 rounded-md border border-[#d7dbe0] bg-white p-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-[#17191c]">
                        <Link2 className="h-4 w-4 text-[#006fe6]" />
                        同步到 Channel
                      </div>

                      {syncedChannels.length > 0 ? (
                        <div className="mt-3 space-y-2">
                          {syncedChannels.map((channel) => (
                            <div key={channel.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-[#f8fafc] px-3 py-2">
                              <div>
                                <p className="text-sm font-medium text-[#17191c]">{channel.name}</p>
                                <p className="mt-1 text-xs text-[#596170]">
                                  channelId: {channel.id}
                                  {channel.instagramUsername ? ` · @${channel.instagramUsername}` : ""}
                                </p>
                              </div>
                              <span
                                className={
                                  channel.enabled
                                    ? "rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700"
                                    : "rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600"
                                }
                              >
                                {channel.enabled ? "已啟用" : "未啟用"}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-[#b54708]">
                          目前還沒有找到對應的 channel。這通常代表 provider 不會同步 channel，或這筆連接尚未完成同步。
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="grid gap-4">
          {providers.map((provider) => {
            const copy = providerCopy[provider.id];
            const Icon = copy.icon;

            return (
              <div key={provider.id} className="rounded-lg border border-[#d7dbe0] bg-white p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#eef6ff] text-[#006fe6]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-[#17191c]">{copy.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#596170]">{copy.description}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <OAuthPopupConnectButton
                        provider={provider.id}
                        href={`/api/oauth/${provider.id}/authorize`}
                        className="inline-flex h-11 items-center justify-center rounded-md bg-[#006fe6] px-4 text-sm font-semibold text-white hover:bg-[#005fd0]"
                      >
                        Connect Account
                      </OAuthPopupConnectButton>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ChannelConnectionShell>
  );
}
