import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { cookies } from "next/headers";
import { ALL_IG_ACCOUNTS, IG_ACCOUNT_SCOPE_COOKIE } from "@/lib/account-scope";
import { requireApiUser } from "@/lib/auth";
import { encryptMetaConfigJson } from "@/lib/channels/meta";
import { publicChannelSelect } from "@/lib/channels/public";
import { getDb } from "@/lib/db";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

const channelUpdateSchema = z.object({
  enabled: z.boolean().optional(),
  name: z.string().min(1).optional(),
  configJson: z.unknown().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const { id } = await params;
  const workspaceId = await getCurrentWorkspaceId();
  const parsed = channelUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid channel." }, { status: 400 });
  const channel = await getDb().channel.findFirst({ where: { id, workspaceId }, select: { id: true } });
  if (!channel) return NextResponse.json({ error: "找不到這個工作區的 IG 帳號。" }, { status: 404 });

  const data: Prisma.ChannelUpdateInput = {
    enabled: parsed.data.enabled,
    name: parsed.data.name,
    configJson:
      parsed.data.configJson === undefined
        ? undefined
        : encryptMetaConfigJson(parsed.data.configJson),
  };

  return NextResponse.json(
    await getDb().channel.update({
      where: { id },
      data,
      select: publicChannelSelect,
    }),
  );
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const { id } = await params;
  const workspaceId = await getCurrentWorkspaceId();
  const channel = await getDb().channel.findFirst({
    where: { id, workspaceId },
    select: { id: true, type: true },
  });

  if (!channel) {
    return NextResponse.json({ error: "找不到這個渠道或 IG 帳號。" }, { status: 404 });
  }

  await getDb().channel.delete({ where: { id } });

  if (channel.type === "instagram") {
    const cookieStore = await cookies();
    if (cookieStore.get(IG_ACCOUNT_SCOPE_COOKIE)?.value === id) {
      cookieStore.set(IG_ACCOUNT_SCOPE_COOKIE, ALL_IG_ACCOUNTS, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
