import { NextResponse } from "next/server";
import { getSelectedInstagramChannelId, instagramChannelWhere } from "@/lib/account-scope";
import { requireApiUser } from "@/lib/auth";
import { upsertContactFieldValue } from "@/lib/contact-fields";
import { getDb } from "@/lib/db";
import { assertSameOriginRequest } from "@/lib/security";
import { contactFieldValueSchema } from "@/lib/validation";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const { id } = await params;
  const workspaceId = await getCurrentWorkspaceId();
  const selectedChannelId = await getSelectedInstagramChannelId();
  const contact = await getDb().contact.findFirst({
    where: { id, ...instagramChannelWhere(selectedChannelId, workspaceId) },
    select: { id: true },
  });
  if (!contact) return NextResponse.json({ error: "找不到這個工作區的聯絡人。" }, { status: 404 });

  const values = await getDb().contactFieldValue.findMany({
    where: { contactId: id },
    include: { definition: true },
    orderBy: { definition: { createdAt: "asc" } },
  });
  return NextResponse.json(values);
}

export async function PUT(request: Request, { params }: Params) {
  const originFailure = assertSameOriginRequest(request);
  if (originFailure) return originFailure;

  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const parsed = contactFieldValueSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "欄位值資料不完整。" }, { status: 400 });
  }

  const { id } = await params;
  const workspaceId = await getCurrentWorkspaceId();
  try {
    const value = await upsertContactFieldValue({
      workspaceId,
      contactId: id,
      definitionId: parsed.data.definitionId,
      key: parsed.data.key,
      value: parsed.data.value,
    });
    return NextResponse.json(value);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "儲存自訂欄位失敗。" },
      { status: 400 },
    );
  }
}
