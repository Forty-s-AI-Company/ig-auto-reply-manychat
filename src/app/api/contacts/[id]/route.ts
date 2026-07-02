import { NextResponse } from "next/server";
import { z } from "zod";
import { getSelectedInstagramChannelId, instagramChannelWhere } from "@/lib/account-scope";
import { requireApiUser } from "@/lib/auth";
import { publicChannelSelect } from "@/lib/channels/public";
import { upsertContactFieldValue } from "@/lib/contact-fields";
import { getDb } from "@/lib/db";
import { assertSameOriginRequest } from "@/lib/security";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

type Params = { params: Promise<{ id: string }> };

const nullableText = z
  .string()
  .max(200)
  .optional()
  .nullable()
  .transform((value) => {
    if (value === undefined) return undefined;
    const trimmed = value?.trim() || "";
    return trimmed || null;
  });

const contactUpdateSchema = z.object({
  username: nullableText,
  email: nullableText,
  phone: nullableText,
  customFields: z
    .array(
      z.object({
        definitionId: z.string().min(1).optional(),
        key: z.string().min(1).optional(),
        value: z.string().max(2000).default(""),
      }),
    )
    .optional()
    .default([]),
});

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const { id } = await params;
  const workspaceId = await getCurrentWorkspaceId();
  const selectedChannelId = await getSelectedInstagramChannelId();
  const channelWhere = instagramChannelWhere(selectedChannelId, workspaceId);

  const contact = await getDb().contact.findFirst({
    where: { id, ...channelWhere },
    include: {
      channel: { select: publicChannelSelect },
      tags: { include: { tag: true } },
      conversations: {
        orderBy: { updatedAt: "desc" },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      },
    },
  });

  if (!contact) return NextResponse.json({ error: "找不到這個 IG 帳號的聯絡人。" }, { status: 404 });
  return NextResponse.json(contact);
}

export async function PATCH(request: Request, { params }: Params) {
  const originFailure = assertSameOriginRequest(request);
  if (originFailure) return originFailure;

  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const { id } = await params;
  const parsed = contactUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "聯絡人資料格式不正確。" }, { status: 400 });

  const workspaceId = await getCurrentWorkspaceId();
  const selectedChannelId = await getSelectedInstagramChannelId();
  const channelWhere = instagramChannelWhere(selectedChannelId, workspaceId);
  const contact = await getDb().contact.findFirst({
    where: { id, ...channelWhere },
    select: { id: true },
  });
  if (!contact) return NextResponse.json({ error: "找不到這個 IG 帳號的聯絡人。" }, { status: 404 });

  const { customFields, ...contactFields } = parsed.data;
  const updated = await getDb().contact.update({
    where: { id },
    data: contactFields,
    include: {
      channel: { select: publicChannelSelect },
      tags: { include: { tag: true } },
    },
  });

  const updatedCustomFields = [];
  for (const field of customFields) {
    updatedCustomFields.push(
      await upsertContactFieldValue({
        workspaceId,
        contactId: id,
        definitionId: field.definitionId,
        key: field.key,
        value: field.value,
      }),
    );
  }

  return NextResponse.json({ ...updated, customFields: updatedCustomFields });
}
