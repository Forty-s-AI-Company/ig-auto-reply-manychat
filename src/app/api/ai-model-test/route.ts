import { NextResponse } from "next/server";
import {
  canUseAiProvider,
  getAiProviderMeta,
  getProviderApiKey,
  markProviderTestResult,
  saveWorkspaceAiSetting,
} from "@/lib/ai/providers";
import { generateFaqReply } from "@/lib/ai/faq";
import { requireApiUser } from "@/lib/auth";
import { assertRateLimit, assertSameOriginRequest } from "@/lib/security";
import { aiModelTestSchema } from "@/lib/validation";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export async function POST(request: Request) {
  const originFailure = assertSameOriginRequest(request);
  if (originFailure) return originFailure;

  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const rateLimitFailure = await assertRateLimit({
    key: `ai-model-test:${auth.user.id}`,
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });
  if (rateLimitFailure) return rateLimitFailure;

  const parsed = aiModelTestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "AI 模型測試資料格式不正確。" }, { status: 400 });
  }

  const workspaceId = await getCurrentWorkspaceId();
  const providerMeta = getAiProviderMeta(parsed.data.provider);
  await saveWorkspaceAiSetting({
    workspaceId,
    provider: parsed.data.provider,
    model: parsed.data.model,
    reasoningEffort: parsed.data.reasoningEffort,
    thinkingLevel: parsed.data.thinkingLevel,
  });

  if (!providerMeta || !canUseAiProvider(parsed.data.provider)) {
    const message = "正式 SaaS 版不支援直接使用本機 CLI；本機開發可使用 Codex / Antigravity CLI 橋接。";
    await markProviderTestResult({
      workspaceId,
      provider: parsed.data.provider,
      model: parsed.data.model,
      ok: false,
      error: message,
    });
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (providerMeta.kind === "api" && !(await getProviderApiKey(workspaceId, parsed.data.provider))) {
    const message = `請先儲存 ${providerMeta.label} API Key，再測試模型。`;
    await markProviderTestResult({
      workspaceId,
      provider: parsed.data.provider,
      model: parsed.data.model,
      ok: false,
      error: message,
    });
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const reply = await generateFaqReply(
      "請用一句話介紹 InboxPilot 可以做什麼。",
      "這是後台 AI 模型連線測試，請回覆一小段可讀內容。",
      workspaceId,
      { bypassApproval: true },
    );
    const ok = Boolean(reply.trim());
    await markProviderTestResult({ workspaceId, provider: parsed.data.provider, model: parsed.data.model, ok });
    if (!ok) return NextResponse.json({ error: "模型沒有回傳可用內容。" }, { status: 400 });
    return NextResponse.json({ ok: true, reply });
  } catch (error) {
    const message = error instanceof Error ? error.message : "模型測試失敗。";
    await markProviderTestResult({
      workspaceId,
      provider: parsed.data.provider,
      model: parsed.data.model,
      ok: false,
      error: message,
    });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
