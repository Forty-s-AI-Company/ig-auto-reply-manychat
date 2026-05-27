import { NextResponse } from "next/server";
import { getSelectedInstagramChannelId, instagramChannelWhere } from "@/lib/account-scope";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const tagId = String(body?.tagId || "");
  if (!tagId) return NextResponse.json({ error: "tagId is required." }, { status: 400 });
  const workspaceId = await getCurrentWorkspaceId();
  const selectedChannelId = await getSelectedInstagramChannelId();
  const channelWhere = instagramChannelWhere(selectedChannelId, workspaceId);
  const contact = await getDb().contact.findFirst({
    where: { id, ...channelWhere },
    select: { id: true },
  });
  if (!contact) return NextResponse.json({ error: "找不到這個 IG 帳號的聯絡人。" }, { status: 404 });

  const item = await getDb().contactTag.upsert({
    where: { contactId_tagId: { contactId: id, tagId } },
    update: {},
    create: { contactId: id, tagId },
  });

  return NextResponse.json(item);
}

export async function DELETE(request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const tagId = searchParams.get("tagId") || "";
  if (!tagId) return NextResponse.json({ error: "tagId is required." }, { status: 400 });
  const workspaceId = await getCurrentWorkspaceId();
  const selectedChannelId = await getSelectedInstagramChannelId();
  const channelWhere = instagramChannelWhere(selectedChannelId, workspaceId);
  const contact = await getDb().contact.findFirst({
    where: { id, ...channelWhere },
    select: { id: true },
  });
  if (!contact) return NextResponse.json({ error: "找不到這個 IG 帳號的聯絡人。" }, { status: 404 });

  await getDb().contactTag.deleteMany({ where: { contactId: id, tagId } });
  return NextResponse.json({ ok: true });
}
