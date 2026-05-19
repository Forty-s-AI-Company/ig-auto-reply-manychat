import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

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
  const parsed = channelUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid channel." }, { status: 400 });

  const data: Prisma.ChannelUpdateInput = {
    enabled: parsed.data.enabled,
    name: parsed.data.name,
    configJson:
      parsed.data.configJson === undefined
        ? undefined
        : (parsed.data.configJson as Prisma.InputJsonValue),
  };

  return NextResponse.json(await getDb().channel.update({ where: { id }, data }));
}
