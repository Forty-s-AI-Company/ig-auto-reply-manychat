import { NextResponse } from "next/server";
import { AI_PROVIDERS, listAiModels, normalizeProviderId } from "@/lib/ai/providers";
import { requireApiUser } from "@/lib/auth";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const provider = new URL(request.url).searchParams.get("provider") || "";
  const normalized = normalizeProviderId(provider);
  if (!normalized) {
    return NextResponse.json({ error: "不支援的 AI 供應商。" }, { status: 400 });
  }

  const workspaceId = await getCurrentWorkspaceId();
  const providerMeta = AI_PROVIDERS.find((item) => item.id === normalized);

  return NextResponse.json({
    provider: normalized,
    providerLabel: providerMeta?.label || normalized,
    models: await listAiModels(normalized, workspaceId),
  });
}
