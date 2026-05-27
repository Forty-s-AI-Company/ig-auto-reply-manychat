import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { getUsageSummary } from "@/lib/billing/usage-service";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  return NextResponse.json(await getUsageSummary(await getCurrentWorkspaceId()));
}
