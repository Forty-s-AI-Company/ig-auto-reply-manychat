import { NextResponse } from "next/server";
import { getSelectedInstagramChannelId, instagramChannelWhere } from "@/lib/account-scope";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { assertSameOriginRequest } from "@/lib/security";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

const MAX_BATCH_CONTACTS = 100;

function parseContactIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const ids = value.map((id) => String(id || "").trim()).filter((id): id is string => Boolean(id));
  return Array.from(new Set(ids)).slice(0, MAX_BATCH_CONTACTS);
}

export async function POST(request: Request) {
  const originFailure = assertSameOriginRequest(request);
  if (originFailure) return originFailure;

  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const body = await request.json().catch(() => null);
  const contactIds = parseContactIds(body?.contactIds);
  const tagId = String(body?.tagId || "").trim();

  if (contactIds.length === 0) {
    return NextResponse.json({ error: "請先選擇至少一位聯絡人。" }, { status: 400 });
  }
  if (!tagId) {
    return NextResponse.json({ error: "tagId is required." }, { status: 400 });
  }

  const workspaceId = await getCurrentWorkspaceId();
  const tag = await getDb().tag.findFirst({ where: { id: tagId, workspaceId }, select: { id: true } });
  if (!tag) return NextResponse.json({ error: "找不到這個工作區的標籤。" }, { status: 404 });

  const selectedChannelId = await getSelectedInstagramChannelId();
  const scopedContacts = await getDb().contact.findMany({
    where: {
      id: { in: contactIds },
      ...instagramChannelWhere(selectedChannelId, workspaceId),
    },
    select: { id: true },
  });

  if (scopedContacts.length === 0) {
    return NextResponse.json({ error: "找不到可套用標籤的聯絡人。" }, { status: 404 });
  }

  const result = await getDb().contactTag.createMany({
    data: scopedContacts.map((contact) => ({ contactId: contact.id, tagId })),
    skipDuplicates: true,
  });

  return NextResponse.json({ ok: true, count: result.count, scopedCount: scopedContacts.length });
}

export async function DELETE(request: Request) {
  const originFailure = assertSameOriginRequest(request);
  if (originFailure) return originFailure;

  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const body = await request.json().catch(() => null);
  const contactIds = parseContactIds(body?.contactIds);
  const tagId = String(body?.tagId || "").trim();

  if (contactIds.length === 0) {
    return NextResponse.json({ error: "請先選擇至少一位聯絡人。" }, { status: 400 });
  }
  if (!tagId) {
    return NextResponse.json({ error: "tagId is required." }, { status: 400 });
  }

  const workspaceId = await getCurrentWorkspaceId();
  const tag = await getDb().tag.findFirst({ where: { id: tagId, workspaceId }, select: { id: true } });
  if (!tag) return NextResponse.json({ error: "找不到這個工作區的標籤。" }, { status: 404 });

  const selectedChannelId = await getSelectedInstagramChannelId();
  const scopedContacts = await getDb().contact.findMany({
    where: {
      id: { in: contactIds },
      ...instagramChannelWhere(selectedChannelId, workspaceId),
    },
    select: { id: true },
  });

  if (scopedContacts.length === 0) {
    return NextResponse.json({ error: "找不到可移除標籤的聯絡人。" }, { status: 404 });
  }

  const result = await getDb().contactTag.deleteMany({
    where: {
      tagId,
      contactId: { in: scopedContacts.map((contact) => contact.id) },
    },
  });

  return NextResponse.json({ ok: true, count: result.count, scopedCount: scopedContacts.length });
}
