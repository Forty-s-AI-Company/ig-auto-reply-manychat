import { cookies } from "next/headers";
import { cache } from "react";
import { getDb } from "@/lib/db";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export const IG_ACCOUNT_SCOPE_COOKIE = "selected_ig_channel_id";
export const ALL_IG_ACCOUNTS = "all";

export const getSelectedInstagramChannelId = cache(async function getSelectedInstagramChannelId() {
  const workspaceId = await getCurrentWorkspaceId();
  const cookieStore = await cookies();
  const selected = cookieStore.get(IG_ACCOUNT_SCOPE_COOKIE)?.value;
  if (!selected || selected === ALL_IG_ACCOUNTS) return undefined;

  const channel = await getDb().channel.findFirst({
    where: { id: selected, workspaceId, type: "instagram", enabled: true },
    select: { id: true },
  });

  return channel?.id;
});

export function instagramChannelWhere(channelId: string | undefined, workspaceId?: string) {
  return channelId
    ? { channelId, ...(workspaceId ? { channel: { workspaceId } } : {}) }
    : {
        channel: {
          ...(workspaceId ? { workspaceId } : {}),
          type: "instagram" as const,
          enabled: true,
        },
      };
}
