import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const tagId = String(body?.tagId || "");
  if (!tagId) return NextResponse.json({ error: "tagId is required." }, { status: 400 });

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

  await getDb().contactTag.deleteMany({ where: { contactId: id, tagId } });
  return NextResponse.json({ ok: true });
}
