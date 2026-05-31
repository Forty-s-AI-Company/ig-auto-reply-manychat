import { NextResponse } from "next/server";
import { handleInboundMessage } from "@/lib/messages";
import { assertRateLimit, getClientIp } from "@/lib/security";
import { hasValidSharedSecret } from "@/lib/webhook-security";

export async function POST(request: Request) {
  const rateLimitFailure = assertRateLimit({
    key: `webhook:telegram:${getClientIp(request)}`,
    limit: 300,
    windowMs: 60 * 1000,
  });
  if (rateLimitFailure) return rateLimitFailure;

  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN is not configured." }, { status: 400 });
  }
  if (!process.env.TELEGRAM_WEBHOOK_SECRET && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "TELEGRAM_WEBHOOK_SECRET is not configured." }, { status: 500 });
  }
  if (
    process.env.TELEGRAM_WEBHOOK_SECRET &&
    !hasValidSharedSecret(request, "x-telegram-bot-api-secret-token", process.env.TELEGRAM_WEBHOOK_SECRET)
  ) {
    return NextResponse.json({ error: "Invalid Telegram webhook secret." }, { status: 401 });
  }

  const update = await request.json().catch(() => null);
  const message = update?.message;
  const text = message?.text;
  const chatId = message?.chat?.id;
  if (!message || !text || !chatId) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const displayName =
    [message.from?.first_name, message.from?.last_name].filter(Boolean).join(" ") ||
    message.from?.username ||
    String(chatId);

  const result = await handleInboundMessage({
    channelType: "telegram",
    channelName: "Telegram Bot",
    externalId: String(chatId),
    displayName,
    username: message.from?.username,
    text,
    providerMessageId: String(message.message_id || ""),
    consentStatus: "opted_in",
    payload: update,
  });

  return NextResponse.json({ ok: true, conversationId: result.conversation.id });
}
