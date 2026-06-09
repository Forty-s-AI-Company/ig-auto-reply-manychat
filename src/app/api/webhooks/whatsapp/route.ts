import { NextResponse } from "next/server";
import { recordAuditEvent } from "@/lib/audit";
import { verifyWhatsAppWebhook } from "@/lib/channels/whatsapp";
import { assertRateLimit, getClientIp } from "@/lib/security";

export async function GET(request: Request) {
  const challenge = verifyWhatsAppWebhook(new URL(request.url).searchParams);
  if (challenge === null) {
    await recordAuditEvent({
      action: "webhook_verification_failed",
      resourceType: "webhook",
      actorIp: getClientIp(request),
      userAgent: request.headers.get("user-agent"),
      success: false,
      metadata: { provider: "whatsapp", method: "GET" },
    });
    return NextResponse.json({ error: "WhatsApp webhook verification failed." }, { status: 403 });
  }
  return new Response(challenge, { status: 200 });
}

export async function POST(request: Request) {
  const rateLimitFailure = await assertRateLimit({
    key: `webhook:whatsapp:${getClientIp(request)}`,
    limit: 120,
    windowMs: 60 * 1000,
  });
  if (rateLimitFailure) return rateLimitFailure;

  return NextResponse.json(
    { error: "WhatsApp webhook is not enabled for this deployment." },
    { status: 501 },
  );
}
