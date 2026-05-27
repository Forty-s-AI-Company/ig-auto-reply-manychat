import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { IG_ACCOUNT_SCOPE_COOKIE } from "@/lib/account-scope";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { workspaceScopeSchema } from "@/lib/validation";
import { WORKSPACE_SCOPE_COOKIE } from "@/lib/workspaces";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const parsed = workspaceScopeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "工作區切換資料格式不正確。" }, { status: 400 });
  }

  const membership = await getDb().workspaceUser.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: parsed.data.workspaceId,
        userId: auth.user.id,
      },
    },
    select: { workspaceId: true },
  });

  if (!membership) {
    return NextResponse.json({ error: "你沒有這個工作區的權限。" }, { status: 403 });
  }

  const cookieStore = await cookies();
  cookieStore.set(WORKSPACE_SCOPE_COOKIE, parsed.data.workspaceId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  cookieStore.delete(IG_ACCOUNT_SCOPE_COOKIE);

  return NextResponse.json({ ok: true, workspaceId: parsed.data.workspaceId });
}
