import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  return NextResponse.json(await getDb().channel.findMany({ orderBy: { createdAt: "asc" } }));
}
