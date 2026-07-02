import { NextResponse } from "next/server";
import { getSelectedInstagramChannelId } from "@/lib/account-scope";
import { requireApiUser } from "@/lib/auth";
import { buildAnalyticsState } from "@/lib/analytics-state";
import { getAnalyticsSummary } from "@/lib/dashboard-summary";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const workspaceId = await getCurrentWorkspaceId();
  const selectedChannelId = await getSelectedInstagramChannelId();
  const analytics = await getAnalyticsSummary({ workspaceId, selectedChannelId });

  return NextResponse.json({
    ...analytics,
    state: buildAnalyticsState(analytics),
  });
}
