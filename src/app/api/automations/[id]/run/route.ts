import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { findOrCreateOpenConversation } from "@/lib/messages";
import { runManualAutomation } from "@/lib/automation/triggers";
import { automationManualRunSchema } from "@/lib/validation";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const parsed = automationManualRunSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "手動啟動自動化需要指定聯絡人。" }, { status: 400 });
  }

  const { id } = await params;
  const workspaceId = await getCurrentWorkspaceId();
  const automation = await getDb().automation.findFirst({
    where: { id, workspaceId, enabled: true, triggerType: "manual" },
    select: { id: true },
  });
  if (!automation) {
    return NextResponse.json({ error: "找不到可手動啟動的自動化。" }, { status: 404 });
  }

  const contact = await getDb().contact.findFirst({
    where: { id: parsed.data.contactId, channel: { workspaceId } },
    select: { id: true, channelId: true },
  });
  if (!contact) {
    return NextResponse.json({ error: "找不到這個工作區的聯絡人。" }, { status: 404 });
  }

  const conversationId =
    parsed.data.conversationId ||
    (await findOrCreateOpenConversation(contact.id, contact.channelId)).id;
  const matched = await runManualAutomation({
    automationId: id,
    contactId: contact.id,
    conversationId,
    text: parsed.data.text,
  });

  return NextResponse.json({ ok: true, matched, conversationId });
}
