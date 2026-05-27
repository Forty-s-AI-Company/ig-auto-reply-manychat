import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { getWorkspaceEntitlement } from "@/lib/billing/entitlements";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const workspaceId = await getCurrentWorkspaceId();
  return NextResponse.json(await getWorkspaceEntitlement(workspaceId));
}
