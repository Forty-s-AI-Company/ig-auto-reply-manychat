import type { MetaChannelConfig } from "@/lib/channels/meta";
import { getMetaChannelConfig, toPrismaJson } from "@/lib/channels/meta";
import { getDb } from "@/lib/db";

type InstagramTokenResponse = {
  access_token?: string;
  expires_in?: number;
  error?: {
    message?: string;
    fbtrace_id?: string;
  };
};

const REFRESH_WINDOW_DAYS = 14;

export function isInstagramTokenRefreshable(config: MetaChannelConfig) {
  if (config.loginProvider !== "instagram") return false;
  if (!config.userAccessToken && !config.pageAccessToken) return false;
  if (!config.userTokenExpiresAt) return true;

  const expiresAt = new Date(config.userTokenExpiresAt).getTime();
  if (!Number.isFinite(expiresAt)) return true;
  return expiresAt - Date.now() <= REFRESH_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}

export async function refreshInstagramLongLivedToken(config: MetaChannelConfig): Promise<MetaChannelConfig> {
  const accessToken = config.userAccessToken || config.pageAccessToken;
  if (!accessToken) throw new Error("這個 IG 帳號沒有可用 token，請重新登入 Instagram。");

  const url = new URL("https://graph.instagram.com/refresh_access_token");
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url, { cache: "no-store" });
  const data = (await response.json().catch(() => ({}))) as InstagramTokenResponse;
  if (!response.ok || data.error || !data.access_token) {
    const trace = data.error?.fbtrace_id ? ` fbtrace_id=${data.error.fbtrace_id}` : "";
    throw new Error(`${data.error?.message || "Instagram token refresh failed."}${trace}`);
  }

  const expiresIn = data.expires_in || 60 * 24 * 60 * 60;
  return {
    ...config,
    userAccessToken: data.access_token,
    pageAccessToken: data.access_token,
    userTokenExpiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
  };
}

export async function refreshDueInstagramTokens() {
  const db = getDb();
  const channels = await db.channel.findMany({
    where: { type: "instagram", enabled: true },
    orderBy: { updatedAt: "asc" },
    select: { id: true, name: true, workspaceId: true, configJson: true },
  });

  const results = {
    scanned: channels.length,
    skipped: 0,
    refreshed: 0,
    failed: 0,
    failures: [] as Array<{ channelId: string; channelName: string; reason: string }>,
  };

  for (const channel of channels) {
    const config = getMetaChannelConfig(channel.configJson);
    if (config.loginProvider !== "instagram" || !isInstagramTokenRefreshable(config)) {
      results.skipped += 1;
      continue;
    }

    try {
      const refreshed = await refreshInstagramLongLivedToken(config);
      await db.channel.update({
        where: { id: channel.id },
        data: { configJson: toPrismaJson(refreshed) },
      });
      results.refreshed += 1;
    } catch (error) {
      results.failed += 1;
      results.failures.push({
        channelId: channel.id,
        channelName: channel.name,
        reason: error instanceof Error ? error.message : "Instagram token refresh failed.",
      });
    }
  }

  return results;
}
