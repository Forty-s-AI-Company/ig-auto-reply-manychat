import type { ChannelAdapter } from "@/lib/channels";

export function metaAdapter(type: "instagram" | "messenger"): ChannelAdapter {
  return {
    type,
    async sendMessage() {
      const token = process.env.META_PAGE_ACCESS_TOKEN;
      if (!token) {
        throw new Error(
          `${type} official API token is not configured. Use Meta official Graph API setup first.`,
        );
      }

      throw new Error(
        `${type} sendMessage scaffold is ready, but endpoint mapping must be configured for your official Meta app.`,
      );
    },
  };
}

export function verifyMetaWebhook(params: URLSearchParams) {
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  if (mode === "subscribe" && token && token === process.env.META_VERIFY_TOKEN) {
    return challenge || "";
  }

  return null;
}
