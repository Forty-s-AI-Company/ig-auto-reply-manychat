import { NextResponse } from "next/server";
import { getSelectedInstagramChannelId } from "@/lib/account-scope";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { handleInboundMessage } from "@/lib/messages";
import { assertRateLimit, getClientIp } from "@/lib/security";
import { mockInboundSchema } from "@/lib/validation";
import { hasValidSharedSecret } from "@/lib/webhook-security";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export async function POST(request: Request) {
  const rateLimitFailure = await assertRateLimit({
    key: `webhook:mock:${getClientIp(request)}`,
    limit: 120,
    windowMs: 60 * 1000,
  });
  if (rateLimitFailure) return rateLimitFailure;

  const hasSecret = hasValidSharedSecret(request, "x-mock-webhook-secret", process.env.MOCK_WEBHOOK_SECRET);
  let workspaceId: string | undefined;
  let selectedInstagramChannelId: string | undefined;
  if (!hasSecret && process.env.NODE_ENV === "production") {
    const auth = await requireApiUser();
    if (auth.response) return auth.response;
    workspaceId = await getCurrentWorkspaceId();
    selectedInstagramChannelId = await getSelectedInstagramChannelId();

    if (!selectedInstagramChannelId && workspaceId) {
      const candidateChannels = await getDb().channel.findMany({
        where: { workspaceId, type: "instagram", enabled: true },
        select: { id: true },
        take: 2,
      });
      if (candidateChannels.length === 1) {
        selectedInstagramChannelId = candidateChannels[0].id;
      }
    }
  }

  const parsed = mockInboundSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid mock inbound payload." }, { status: 400 });
  }

  const result = await handleInboundMessage({
    channelType: selectedInstagramChannelId ? "instagram" : "mock",
    channelId: selectedInstagramChannelId,
    channelName: selectedInstagramChannelId ? undefined : "Local Mock",
    externalId: parsed.data.externalId,
    displayName: parsed.data.displayName,
    text: parsed.data.text,
    consentStatus: parsed.data.consentStatus,
    deferAutomations: true,
    workspaceId,
  });

  return NextResponse.json({ ok: true, queued: true, conversationId: result.conversation.id }, { status: 202 });
}
