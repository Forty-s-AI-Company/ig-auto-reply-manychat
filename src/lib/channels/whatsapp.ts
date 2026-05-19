import type { ChannelAdapter } from "@/lib/channels";

export const whatsappAdapter: ChannelAdapter = {
  type: "whatsapp",
  async sendMessage() {
    if (!process.env.WHATSAPP_ACCESS_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
      throw new Error(
        "WhatsApp official API env is not configured. Use WhatsApp Business Cloud API first.",
      );
    }

    throw new Error(
      "WhatsApp sendMessage scaffold is ready, but template/session policy mapping must be configured before sending.",
    );
  },
};

export function verifyWhatsAppWebhook(params: URLSearchParams) {
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  if (mode === "subscribe" && token && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return challenge || "";
  }

  return null;
}
