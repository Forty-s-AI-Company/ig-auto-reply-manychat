import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { syncInstagramCommentsFromActiveAutomations } from "@/lib/instagram/comments-sync";

export const runtime = "nodejs";

export async function POST() {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  try {
    const results = await syncInstagramCommentsFromActiveAutomations();
    return NextResponse.json({
      ok: true,
      processed: results.filter((result) => result.status === "processed").length,
      duplicated: results.filter((result) => result.status === "duplicated").length,
      ignored: results.filter((result) => result.status === "ignored").length,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Instagram comment sync failed." },
      { status: 400 },
    );
  }
}
