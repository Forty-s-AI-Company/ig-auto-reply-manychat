import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { handleInboundMessage } from "@/lib/messages";
import { mockInboundSchema } from "@/lib/validation";
import { hasValidSharedSecret } from "@/lib/webhook-security";

export async function POST(request: Request) {
  const hasSecret = hasValidSharedSecret(request, "x-mock-webhook-secret", process.env.MOCK_WEBHOOK_SECRET);
  if (!hasSecret && process.env.NODE_ENV === "production") {
    const auth = await requireApiUser();
    if (auth.response) return auth.response;
  }

  const parsed = mockInboundSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid mock inbound payload." }, { status: 400 });
  }

  const result = await handleInboundMessage({
    channelType: "mock",
    channelName: "Local Mock",
    externalId: parsed.data.externalId,
    displayName: parsed.data.displayName,
    text: parsed.data.text,
    consentStatus: parsed.data.consentStatus,
  });

  return NextResponse.json({ ok: true, conversationId: result.conversation.id });
}
