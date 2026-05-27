import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { subscribeContactToSequence } from "@/lib/sequences";
import { sequenceSubscribeSchema } from "@/lib/validation";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const parsed = sequenceSubscribeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "訂閱序列需要指定聯絡人。" }, { status: 400 });
  }

  const { id } = await params;
  const workspaceId = await getCurrentWorkspaceId();
  try {
    const subscription = await subscribeContactToSequence({
      workspaceId,
      sequenceId: id,
      contactId: parsed.data.contactId,
    });
    return NextResponse.json(subscription);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "訂閱序列失敗。" },
      { status: 400 },
    );
  }
}
