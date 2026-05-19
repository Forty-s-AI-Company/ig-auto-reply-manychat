import type { ChannelAdapter, SendMessageInput } from "@/lib/channels";

function getTelegramToken() {
  return process.env.TELEGRAM_BOT_TOKEN || "";
}

export async function sendTelegramMessage(input: SendMessageInput) {
  const token = getTelegramToken();
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured.");
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: input.externalId,
      text: input.text,
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.ok) {
    throw new Error(data.description || "Telegram sendMessage failed.");
  }

  return {
    providerMessageId: String(data.result?.message_id ?? ""),
    raw: data,
  };
}

export const telegramAdapter: ChannelAdapter = {
  type: "telegram",
  sendMessage: sendTelegramMessage,
};
