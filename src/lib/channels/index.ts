import type { ChannelType } from "@prisma/client";
import { mockAdapter } from "@/lib/channels/mock";
import { telegramAdapter } from "@/lib/channels/telegram";
import { metaAdapter } from "@/lib/channels/meta";
import { whatsappAdapter } from "@/lib/channels/whatsapp";
import { emailAdapter } from "@/lib/channels/email";

export type SendMessageInput = {
  channelId: string;
  externalId: string;
  text: string;
  commentId?: string;
};

export type SendMessageResult = {
  providerMessageId?: string;
  raw?: unknown;
};

export type ChannelAdapter = {
  type: ChannelType;
  sendMessage(input: SendMessageInput): Promise<SendMessageResult>;
};

const adapters: Record<ChannelType, ChannelAdapter> = {
  mock: mockAdapter,
  telegram: telegramAdapter,
  instagram: metaAdapter("instagram"),
  messenger: metaAdapter("messenger"),
  whatsapp: whatsappAdapter,
  tiktok: unsupportedAdapter("tiktok", "TikTok"),
  sms: unsupportedAdapter("sms", "SMS"),
  email: emailAdapter,
};

export function getChannelAdapter(type: ChannelType) {
  return adapters[type];
}

function unsupportedAdapter(type: ChannelType, label: string): ChannelAdapter {
  return {
    type,
    async sendMessage() {
      throw new Error(`${label} channel is planned, but the provider adapter is not implemented yet.`);
    },
  };
}
