import { NextResponse } from "next/server";
import {
  AI_PROVIDERS,
  canUseAiProvider,
  getAiProviderMeta,
  getCredentialsStatus,
  getWorkspaceAiSetting,
  isLocalAiCliEnabled,
  saveProviderApiKey,
  saveWorkspaceAiSetting,
} from "@/lib/ai/providers";
import { requireApiUser } from "@/lib/auth";
import { aiCredentialSchema, aiSettingSchema } from "@/lib/validation";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const workspaceId = await getCurrentWorkspaceId();

  return NextResponse.json({
    setting: await getWorkspaceAiSetting(workspaceId),
    providers: AI_PROVIDERS,
    credentials: await getCredentialsStatus(workspaceId),
    localCliEnabled: isLocalAiCliEnabled(),
  });
}

export async function PUT(request: Request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const parsed = aiSettingSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "AI 設定格式不正確。" }, { status: 400 });
  }

  const workspaceId = await getCurrentWorkspaceId();
  if (!canUseAiProvider(parsed.data.provider)) {
    return NextResponse.json({ error: "正式 SaaS 版不支援直接使用本機 CLI，請改用 API Key；本機開發可使用 CLI 橋接。" }, { status: 400 });
  }

  const setting = await saveWorkspaceAiSetting({
      workspaceId,
      provider: parsed.data.provider,
      model: parsed.data.model,
      reasoningEffort: parsed.data.reasoningEffort,
      thinkingLevel: parsed.data.thinkingLevel,
    });

  return NextResponse.json(setting);
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const parsed = aiCredentialSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "AI API Key 格式不正確。" }, { status: 400 });
  }

  const workspaceId = await getCurrentWorkspaceId();
  const provider = getAiProviderMeta(parsed.data.provider);
  if (!provider || provider.kind !== "api") {
    return NextResponse.json({ error: "SaaS 版目前只支援 API 型 AI 供應商儲存 API Key。" }, { status: 400 });
  }

  await saveProviderApiKey({
    workspaceId,
    provider: parsed.data.provider,
    apiKey: parsed.data.apiKey,
  });

  return NextResponse.json({
    ok: true,
    credentials: await getCredentialsStatus(workspaceId),
  });
}
