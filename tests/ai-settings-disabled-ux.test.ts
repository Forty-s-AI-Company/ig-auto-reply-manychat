import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("src/components/AiSettingsClient.tsx", "utf8");

describe("AI settings disabled UX", () => {
  it("keeps disabled model actions tied to visible helper copy", () => {
    expect(source).toContain("testModelDisabledReason");
    expect(source).toContain("refreshModelsDisabledReason");
    expect(source).toContain('aria-describedby={testModelDisabledReason ? "ai-test-model-disabled-reason" : undefined}');
    expect(source).toContain('id="ai-test-model-disabled-reason"');
    expect(source).toContain('aria-describedby={refreshModelsDisabledReason ? "ai-refresh-models-disabled-reason" : undefined}');
    expect(source).toContain('id="ai-refresh-models-disabled-reason"');
    expect(source).toContain("請先加密儲存這個供應商的 API Key");
  });

  it("keeps AI settings controls keyboard-visible and screen-reader friendly", () => {
    expect(source).toContain("focus-visible:ring-[#006fe6]");
    expect(source).toContain('<TestTube2 className="h-4 w-4" aria-hidden="true" />');
    expect(source).toContain('<Save className="h-4 w-4" aria-hidden="true" />');
    expect(source).toContain('<RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />');
    expect(source).toContain('<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />');
  });

  it("separates success, warning, and danger toast tones instead of showing every message as info", () => {
    expect(source).toContain('const [messageTone, setMessageTone] = useState<"info" | "success" | "warning" | "danger">("info");');
    expect(source).toContain('showMessage(error instanceof Error ? error.message : "模型測試失敗。", "danger")');
    expect(source).toContain('showMessage(`模型測試通過：${String(data.reply || "").slice(0, 80)}`, "success")');
    expect(source).toContain('showMessage("正式 SaaS 只能儲存 API 型 AI 供應商；CLI 請使用下方連接方式。", "warning")');
    expect(source).toContain('tone={messageTone}');
  });
});
