import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const conversations = await getDb().conversation.findMany({
    orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
    include: {
      contact: { include: { tags: { include: { tag: true } } } },
      channel: true,
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return NextResponse.json(conversations);
}
