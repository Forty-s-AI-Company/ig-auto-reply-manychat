import type { ChannelType } from "@prisma/client";
import { mockAdapter } from "@/lib/channels/mock";
import { telegramAdapter } from "@/lib/channels/telegram";
import { metaAdapter } from "@/lib/channels/meta";
import { whatsappAdapter } from "@/lib/channels/whatsapp";

export type SendMessageInput = {
  channelId: string;
  externalId: string;
  text: string;
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
};

export function getChannelAdapter(type: ChannelType) {
  return adapters[type];
}
