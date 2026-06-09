import { NextResponse } from "next/server";
import { recordAuditEvent } from "@/lib/audit";
import { handleInboundMessage } from "@/lib/messages";
import { enqueueJob } from "@/lib/queue";
import { getClientIp } from "@/lib/security";
import { automationWebhookRunSchema } from "@/lib/validation";
import { verifyHmacSignature } from "@/lib/webhook-security";

type Params = { params: Promise<{ key: string }> };

export async function POST(request: Request, { params }: Params) {
  const { key } = await params;
  if (!key || key.length < 12) {
    await recordAuditEvent({
      action: "webhook_verification_failed",
      resourceType: "webhook",
      actorIp: getClientIp(request),
      userAgent: request.headers.get("user-agent"),
      success: false,
      metadata: { provider: "automation", reason: "short_key" },
    });
    return NextResponse.json({ error: "Webhook key is too short." }, { status: 400 });
  }

  const rawBody = await request.text();
  const signatureValid = verifyHmacSignature({
    body: rawBody,
    secret: process.env.AUTOMATION_WEBHOOK_SECRET,
    signatureHeader: request.headers.get("x-inboxpilot-signature"),
  });
  if (!signatureValid) {
    await recordAuditEvent({
      action: "webhook_signature_failed",
      resourceType: "webhook",
      actorIp: getClientIp(request),
      userAgent: request.headers.get("user-agent"),
      success: false,
      metadata: { provider: "automation", webhookKey: key },
    });
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody || "{}");
  } catch {
    await recordAuditEvent({
      action: "webhook_payload_failed",
      resourceType: "webhook",
      actorIp: getClientIp(request),
      userAgent: request.headers.get("user-agent"),
      success: false,
      metadata: { provider: "automation", webhookKey: key, reason: "invalid_json" },
    });
    return NextResponse.json({ error: "Invalid webhook JSON." }, { status: 400 });
  }

  const parsed = automationWebhookRunSchema.safeParse(body);
  if (!parsed.success) {
    await recordAuditEvent({
      action: "webhook_payload_failed",
      resourceType: "webhook",
      actorIp: getClientIp(request),
      userAgent: request.headers.get("user-agent"),
      success: false,
      metadata: { provider: "automation", webhookKey: key, reason: "invalid_payload" },
    });
    return NextResponse.json({ error: "Webhook payload is invalid." }, { status: 400 });
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

  await enqueueJob({
    workspaceId: inbound.channel.workspaceId,
    type: "inbound_automation",
    status: "queued",
    runAt: new Date(),
    payloadJson: {
      triggerType: "webhook",
      webhookKey: key,
      contactId: inbound.contact.id,
      conversationId: inbound.conversation.id,
      text: parsed.data.text,
    },
  });

  return NextResponse.json(
    {
      ok: true,
      queued: true,
      conversationId: inbound.conversation.id,
    },
    { status: 202 },
  );
}
