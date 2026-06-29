import Link from "next/link";
import { AlertCircle, Bot, Camera, ExternalLink, FlaskConical, Link2, MessageCircleMore } from "lucide-react";
import { ChannelConnectionShell, InstagramVisual } from "@/components/ChannelConnectionShell";
import { OAuthPopupConnectButton } from "@/components/oauth/OAuthPopupConnectButton";
import { ResyncConnectedAccountButton } from "@/components/oauth/ResyncConnectedAccountButton";
import { requireUser } from "@/lib/auth";
import { getOAuthProviderUiState } from "@/lib/channels/channel-connect-visibility";
import { getMetaChannelConfig } from "@/lib/channels/meta";
import { getDb } from "@/lib/db";
import { getInboxPilotDeploymentEnv } from "@/lib/deployment-env";
import { listOAuthProviders } from "@/lib/oauth/registry";
import { isSimpleRelease } from "@/lib/release-mode";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

const providerCopy = {
  "meta-instagram": {
    title: "Instagram OAuth",
    description: "桌機會用 popup；手機會改成同頁登入流程，先顯示 Instagram 網頁登入，再進入授權與 channel 同步。",
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

type SocialConnectPageProps = {
  searchParams?: Promise<{
    oauth_status?: string;
    oauth_provider?: string;
    oauth_message?: string;
    oauth_display_name?: string;
    meta_error?: string;
    meta_error_code?: string;
  }>;
};

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

function buildAuthorizeHref(providerId: string) {
  if (providerId === "meta-instagram") {
    return {
      primary: "/api/oauth/meta-instagram/authorize?fresh_login=1",
      secondary: "/api/oauth/meta-instagram/authorize?switch_account=1",
    };
  }

  if (providerId === "meta-facebook") {
    return {
      primary: "/api/oauth/meta-facebook/authorize",
      secondary: "/api/oauth/meta-facebook/authorize?switch_account=1&reauth=1&rerequest=1",
    };
  }

  return {
    primary: `/api/oauth/${providerId}/authorize`,
    secondary: "",
  };
}

export default async function SocialConnectPage({ searchParams }: SocialConnectPageProps) {
  await requireUser();
  const workspaceId = await getCurrentWorkspaceId();
  const params = searchParams ? await searchParams : {};
  const simpleRelease = await isSimpleRelease();
  const deploymentEnv = getInboxPilotDeploymentEnv();
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
  const visibleAccounts = simpleRelease ? accounts.filter((account) => account.provider === "meta-instagram") : accounts;
  const visibleProviders = providers
    .map((provider) => ({
      provider,
      uiState: getOAuthProviderUiState(provider.id, { simpleRelease, deploymentEnv }),
    }))
    .filter((entry) => entry.uiState.visible);

  return (
    <ChannelConnectionShell
      title="連接 Social Accounts"
      description="這一頁是可重用的 OAuth Popup 模組入口。Meta、Telegram 與 Mock provider 都走同一套授權與回傳協定。"
      backHref="/channels/connect"
      backLabel="返回連接渠道"
      visual={<InstagramVisual />}
    >
      <div className="space-y-6">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="space-y-2 leading-6">
              <p>請先確認目前瀏覽器登入的是你要綁定的 Instagram / Meta 帳號。</p>
              <p>
                如果彈窗一打開就直接看到「允許 / 取消」，通常代表瀏覽器裡已經有 Meta 或 Instagram 的登入 session，
                平台會直接沿用那個帳號，不一定會再跳出帳號切換畫面。
              </p>
            </div>
          </div>
        </div>

        {params.oauth_status ? (
          <div
            className={
              params.oauth_status === "success"
                ? "rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
                : "rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            }
          >
            {params.oauth_status === "success"
              ? `${params.oauth_display_name || "社群帳號"} 已完成連接。${params.oauth_message ? ` ${params.oauth_message}` : ""}`
              : params.oauth_message || "社群帳號連接失敗，請重新嘗試。"}
          </div>
        ) : null}
        {params.meta_error ? (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              <div className="space-y-1 leading-6">
                <p className="font-semibold text-red-900">連接失敗</p>
                <p>{params.meta_error}</p>
                {params.meta_error_code ? (
                  <p className="text-xs text-red-700">錯誤代碼：{params.meta_error_code}</p>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        <div className="rounded-lg border border-[#d7dbe0] bg-white p-5">
          <h2 className="text-lg font-semibold text-[#17191c]">已連接帳號</h2>
          <p className="mt-2 text-sm text-[#596170]">
            目前工作區有 {visibleAccounts.length} 個 ConnectedAccount，以及 {channelSummaries.length} 個 Instagram channel。
          </p>

          <div className="mt-4 space-y-3">
            {visibleAccounts.length === 0 ? (
              <>
                <div className="rounded-md border border-dashed border-[#d7dbe0] bg-[#f8fafc] p-4 text-sm text-[#596170]">
                  還沒有任何 Social Login 連接。下面任選一個 provider 開始測。
                </div>
                {channelSummaries.length > 0 ? (
                  <div className="rounded-md border border-[#d7dbe0] bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[#17191c]">目前已綁定的 Instagram channels</p>
                        <p className="mt-1 text-xs text-[#596170]">
                          這些 channel 已經存在工作區。若懷疑綁錯帳號，可以先解除綁定再重新連接。
                        </p>
                      </div>
                      <Link
                        href="/channels#instagram"
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#006fe6] hover:text-[#005fd0]"
                      >
                        前往 Channels 檢查
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                    <div className="mt-3 space-y-2">
                      {channelSummaries.map((channel) => (
                        <div
                          key={channel.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-[#f8fafc] px-3 py-2"
                        >
                          <div>
                            <p className="text-sm font-medium text-[#17191c]">{channel.name}</p>
                            <p className="mt-1 text-xs text-[#596170]">
                              {channel.instagramUsername ? `@${channel.instagramUsername}` : "未讀取到使用者名稱"}
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
                  </div>
                ) : null}
              </>
            ) : (
              visibleAccounts.map((account) => {
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
                        <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-[#b54708]">
                          <p>目前還沒有找到對應的 channel。這通常代表這筆授權尚未完成同步，或目前 provider 不會直接建立可用 channel。</p>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                            <Link
                              href="/channels#instagram"
                              className="inline-flex items-center gap-1 font-medium text-[#9a3412] hover:text-[#7c2d12]"
                            >
                              前往 Channels 檢查綁定狀態
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                            <span className="text-[#b54708]">如果是 Meta / Instagram 帳號，請嘗試重新同步或重新連接一次。</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="grid gap-4">
          {visibleProviders.map(({ provider, uiState }) => {
            const copy = providerCopy[provider.id];
            const Icon = copy.icon;
            const authorizeHref = buildAuthorizeHref(provider.id);
            const isMetaProvider = provider.id === "meta-instagram" || provider.id === "meta-facebook";
            const secondaryLabel =
              provider.id === "meta-instagram" ? "重新登入 IG 後連接" : provider.id === "meta-facebook" ? "切換 Meta 帳號" : "";

            return (
              <div key={provider.id} className="rounded-lg border border-[#d7dbe0] bg-white p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#eef6ff] text-[#006fe6]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-[#17191c]">{copy.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#596170]">{copy.description}</p>
                    {isMetaProvider ? (
                      <div className="mt-3 rounded-md bg-[#f8fafc] p-3 text-xs leading-6 text-[#596170]">
                        <p>若目前瀏覽器已登入別的 Meta / Instagram 帳號，請先切換帳號後再授權。</p>
                        <p>綁錯帳號時，可到 Channels 解除綁定，再回來重新連接。</p>
                      </div>
                    ) : null}
                    {!uiState.enabled ? (
                      <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs leading-6 text-[#b54708]">
                        {uiState.disabledReason}
                      </div>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-3">
                      {uiState.enabled ? (
                        <OAuthPopupConnectButton
                          provider={provider.id}
                          href={authorizeHref.primary}
                          className="inline-flex h-11 items-center justify-center rounded-md bg-[#006fe6] px-4 text-sm font-semibold text-white hover:bg-[#005fd0]"
                        >
                          連接帳號
                        </OAuthPopupConnectButton>
                      ) : (
                        <button
                          type="button"
                          disabled
                          aria-disabled="true"
                          className="inline-flex h-11 cursor-not-allowed items-center justify-center rounded-md border border-[#d0d5dd] bg-[#f3f4f6] px-4 text-sm font-semibold text-[#98a2b3]"
                        >
                          {provider.id === "mock" ? "僅限本機 / QA 使用" : "目前不可連接"}
                        </button>
                      )}
                      {uiState.enabled && authorizeHref.secondary ? (
                        <OAuthPopupConnectButton
                          provider={provider.id}
                          href={authorizeHref.secondary}
                          className="inline-flex h-11 items-center justify-center rounded-md border border-[#d0d5dd] bg-white px-4 text-sm font-semibold text-[#17191c] hover:bg-[#f9fafb]"
                        >
                          {secondaryLabel}
                        </OAuthPopupConnectButton>
                      ) : null}
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
