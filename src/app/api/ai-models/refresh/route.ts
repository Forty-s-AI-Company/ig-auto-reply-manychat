import { NextResponse } from "next/server";
import {
  AI_PROVIDERS,
  canUseAiProvider,
  getAiProviderMeta,
  getProviderApiKey,
  normalizeProviderId,
  refreshAiModels,
} from "@/lib/ai/providers";
import { requireApiUser } from "@/lib/auth";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const workspaceId = await getCurrentWorkspaceId();
  const body = await request.json().catch(() => ({}));
  const provider = typeof body.provider === "string" ? normalizeProviderId(body.provider) : null;

  if (provider) {
    const providerMeta = getAiProviderMeta(provider);
    if (!providerMeta || !canUseAiProvider(provider)) {
      return NextResponse.json({ error: "正式 SaaS 版不支援直接抓取本機 CLI 模型；本機開發可使用 CLI 橋接。" }, { status: 400 });
    }

    if (providerMeta.kind === "api" && !(await getProviderApiKey(workspaceId, provider))) {
      return NextResponse.json({ error: `請先儲存 ${providerMeta.label} API Key，再抓取最新模型。` }, { status: 400 });
    }

    const models = await refreshAiModels(provider, workspaceId);
    return NextResponse.json({ ok: true, provider, count: models.length, models });
  }

  const counts: Record<string, number> = {};
  const skipped: Record<string, string> = {};
  for (const providerMeta of AI_PROVIDERS.filter((item) => canUseAiProvider(item.id))) {
    if (providerMeta.kind === "api" && !(await getProviderApiKey(workspaceId, providerMeta.id))) {
      skipped[providerMeta.id] = "missing_api_key";
      continue;
    }

    counts[providerMeta.id] = (await refreshAiModels(providerMeta.id, workspaceId)).length;
  }

  return NextResponse.json({ ok: true, counts, skipped });
}
