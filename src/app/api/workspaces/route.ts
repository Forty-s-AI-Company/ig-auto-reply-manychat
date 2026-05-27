import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { workspaceCreateSchema } from "@/lib/validation";
import { createWorkspaceForUser, getUserWorkspaces } from "@/lib/workspaces";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  return NextResponse.json(await getUserWorkspaces(auth.user.id));
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const parsed = workspaceCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "工作區名稱格式不正確。" }, { status: 400 });
  }

  const workspace = await createWorkspaceForUser(auth.user, parsed.data.name);
  return NextResponse.json(workspace);
}
