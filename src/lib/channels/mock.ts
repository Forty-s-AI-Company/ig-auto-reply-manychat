import type { ChannelAdapter } from "@/lib/channels";

export const mockAdapter: ChannelAdapter = {
  type: "mock",
  async sendMessage() {
    return {
      providerMessageId: `mock_${Date.now()}`,
      raw: { delivered: true },
    };
  },
};
