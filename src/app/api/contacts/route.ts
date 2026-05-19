import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || undefined;
  const contacts = await getDb().contact.findMany({
    where: q
      ? {
          OR: [
            { displayName: { contains: q } },
            { username: { contains: q } },
            { email: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { updatedAt: "desc" },
    include: {
      channel: true,
      tags: { include: { tag: true } },
      conversations: { orderBy: { updatedAt: "desc" }, take: 3 },
    },
  });

  return NextResponse.json(contacts);
}
