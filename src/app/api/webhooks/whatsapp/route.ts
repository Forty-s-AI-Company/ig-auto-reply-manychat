import { NextResponse } from "next/server";
import { verifyWhatsAppWebhook } from "@/lib/channels/whatsapp";

export async function GET(request: Request) {
  const challenge = verifyWhatsAppWebhook(new URL(request.url).searchParams);
  if (challenge === null) {
    return NextResponse.json({ error: "WhatsApp webhook verification failed." }, { status: 403 });
  }
  return new Response(challenge, { status: 200 });
}

export async function POST() {
  return NextResponse.json({
    ok: true,
    scaffold: true,
    note: "WhatsApp webhook scaffold only. Configure official WhatsApp Business Cloud API handlers before production use.",
  });
}
