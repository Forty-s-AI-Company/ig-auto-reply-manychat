import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ALL_IG_ACCOUNTS, IG_ACCOUNT_SCOPE_COOKIE } from "@/lib/account-scope";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

const accountScopeSchema = z.object({
  channelId: z.string().min(1),
});

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const parsed = accountScopeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "帳號切換資料格式不正確。" }, { status: 400 });
  }

  const { channelId } = parsed.data;
  const workspaceId = await getCurrentWorkspaceId();
  if (channelId !== ALL_IG_ACCOUNTS) {
    const exists = await getDb().channel.count({
      where: { id: channelId, workspaceId, type: "instagram", enabled: true },
    });

    if (!exists) {
      return NextResponse.json({ error: "找不到可用的 IG 帳號。" }, { status: 404 });
    }
  }

  const cookieStore = await cookies();
  cookieStore.set(IG_ACCOUNT_SCOPE_COOKIE, channelId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return NextResponse.json({ ok: true, channelId });
}
