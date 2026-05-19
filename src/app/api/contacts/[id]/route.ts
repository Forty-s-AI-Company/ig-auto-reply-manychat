import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const { id } = await params;

  const contact = await getDb().contact.findUnique({
    where: { id },
    include: {
      channel: true,
      tags: { include: { tag: true } },
      conversations: {
        orderBy: { updatedAt: "desc" },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      },
    },
  });

  if (!contact) return NextResponse.json({ error: "Contact not found." }, { status: 404 });
  return NextResponse.json(contact);
}
