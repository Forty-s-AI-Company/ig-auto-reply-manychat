import { NextResponse } from "next/server";
import { verifyMetaWebhook } from "@/lib/channels/meta";

export async function GET(request: Request) {
  const challenge = verifyMetaWebhook(new URL(request.url).searchParams);
  if (challenge === null) {
    return NextResponse.json({ error: "Meta webhook verification failed." }, { status: 403 });
  }
  return new Response(challenge, { status: 200 });
}

export async function POST() {
  return NextResponse.json({
    ok: true,
    scaffold: true,
    note: "Meta webhook scaffold only. Configure official Instagram/Messenger Graph API handlers before production use.",
  });
}
