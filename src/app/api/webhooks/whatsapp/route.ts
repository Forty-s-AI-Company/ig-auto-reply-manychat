import { NextResponse } from "next/server";
import { verifyWhatsAppWebhook } from "@/lib/channels/whatsapp";
import { assertRateLimit, getClientIp } from "@/lib/security";

export async function GET(request: Request) {
  const challenge = verifyWhatsAppWebhook(new URL(request.url).searchParams);
  if (challenge === null) {
    return NextResponse.json({ error: "WhatsApp webhook verification failed." }, { status: 403 });
  }
  return new Response(challenge, { status: 200 });
}

export async function POST(request: Request) {
  const rateLimitFailure = assertRateLimit({
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
