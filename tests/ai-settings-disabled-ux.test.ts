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
});
