import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { tagSchema } from "@/lib/validation";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  return NextResponse.json(await getDb().tag.findMany({ orderBy: { name: "asc" } }));
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const parsed = tagSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid tag." }, { status: 400 });

  const tag = await getDb().tag.create({ data: parsed.data });
  return NextResponse.json(tag);
}
