import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const db = getDb();
  const [contacts, messages, openConversations, automations, recentMessages] =
    await Promise.all([
      db.contact.count(),
      db.message.count(),
      db.conversation.count({ where: { status: "open" } }),
      db.automation.count(),
      db.message.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { contact: true, channel: true },
      }),
    ]);

  return NextResponse.json({
    contacts,
    messages,
    openConversations,
    automations,
    recentMessages,
  });
}
