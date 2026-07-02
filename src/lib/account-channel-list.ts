import { getMetaChannelConfig } from "@/lib/channels/meta";

type InstagramChannelInput = {
  id: string;
  name: string;
  configJson: unknown;
};

export type AccountDropdownChannel = {
  id: string;
  name: string;
  displayName: string;
  subtitle: string;
  username: string;
  avatarUrl: string;
  avatarFallback: string;
  metadataStatus: "complete" | "partial";
  metadataHint: string;
};

export function buildAccountDropdownChannels(channels: InstagramChannelInput[]): AccountDropdownChannel[] {
  return channels
    .map((channel) => {
      const config = getMetaChannelConfig(channel.configJson);
      const username = config.instagramUsername || "";
      const instagramId = config.instagramBusinessAccountId || config.instagramOauthUserId || "";
      const cleanName = channel.name.replace(/^Instagram\s*@?/i, "").trim();
      const displayName =
        config.instagramName ||
        (username ? `@${username}` : instagramId ? `Instagram 帳號 ${instagramId}` : cleanName || channel.name);
      const metadataStatus: AccountDropdownChannel["metadataStatus"] =
        username || config.instagramName || config.instagramProfilePictureUrl ? "complete" : "partial";

      return {
        id: channel.id,
        name: channel.name,
        displayName,
        subtitle: username
          ? `@${username}`
          : instagramId
            ? "尚未取得帳號名稱與頭像，可到「設定」重新讀取"
            : "尚未取得帳號資料，可到「設定」重新讀取",
        username,
        avatarUrl: config.instagramProfilePictureUrl || "",
        avatarFallback: username ? username.slice(0, 2).toUpperCase() : "IG",
        metadataStatus,
        metadataHint: metadataStatus === "partial" ? "資料未完整" : "",
      };
    })
    .sort(
      (a, b) =>
        Number(Boolean(b.username)) - Number(Boolean(a.username)) ||
        a.displayName.localeCompare(b.displayName, "zh-TW"),
    );
}
