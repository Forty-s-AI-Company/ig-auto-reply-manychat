import { NextResponse } from "next/server";
import { handleInboundMessage } from "@/lib/messages";
import { runWebhookAutomations } from "@/lib/automation/triggers";
import { automationWebhookRunSchema } from "@/lib/validation";
import { verifyHmacSignature } from "@/lib/webhook-security";

type Params = { params: Promise<{ key: string }> };

export async function POST(request: Request, { params }: Params) {
  const { key } = await params;
  if (!key || key.length < 12) {
    return NextResponse.json({ error: "Webhook key is too short." }, { status: 400 });
  }

  const rawBody = await request.text();
  const signatureValid = verifyHmacSignature({
    body: rawBody,
    secret: process.env.AUTOMATION_WEBHOOK_SECRET,
    signatureHeader: request.headers.get("x-inboxpilot-signature"),
  });
  if (!signatureValid) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody || "{}");
  } catch {
    return NextResponse.json({ error: "Invalid webhook JSON." }, { status: 400 });
  }
  const parsed = automationWebhookRunSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Webhook payload 格式不完整。" }, { status: 400 });
  }

  const inbound = await handleInboundMessage({
    channelType: parsed.data.channelType,
    channelName: parsed.data.channelName || "Webhook",
    externalId: parsed.data.externalId,
    displayName: parsed.data.displayName || parsed.data.externalId,
    text: parsed.data.text || `[webhook:${key}]`,
    consentStatus: parsed.data.consentStatus,
    skipAutomations: true,
  });

  const matched = await runWebhookAutomations({
    webhookKey: key,
    contactId: inbound.contact.id,
    conversationId: inbound.conversation.id,
    text: parsed.data.text,
  });

  return NextResponse.json({
    ok: true,
    matched,
    conversationId: inbound.conversation.id,
  });
}
