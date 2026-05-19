import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { sendOutboundMessage } from "@/lib/messages";
import { outboundMessageSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const { id } = await params;
  const parsed = outboundMessageSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid message." }, { status: 400 });
  }

  try {
    const message = await sendOutboundMessage(id, parsed.data.text);
    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Send failed." },
      { status: 400 },
    );
  }
}
