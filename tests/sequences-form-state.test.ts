import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("sequences form state", () => {
  it("keeps the save button tied to the live sequence name input value", () => {
    const source = readFileSync("src/components/SequencesClient.tsx", "utf8");

    expect(source).toContain("const trimmedName = name.trim()");
    expect(source).toContain("const [hasHydrated, setHasHydrated] = useState(false)");
    expect(source).toContain("setHasHydrated(true)");
    expect(source).toContain("const canSaveSequence = hasHydrated && Boolean(trimmedName)");
    expect(source).toContain("function syncNameFromInput");
    expect(source).toContain("onChange={syncNameFromInput}");
    expect(source).toContain("onChangeCapture={syncNameFromInput}");
    expect(source).toContain("onInput={syncNameFromInput}");
    expect(source).toContain("onInputCapture={syncNameFromInput}");
    expect(source).toContain('aria-invalid={!trimmedName}');
    expect(source).toContain('data-testid="sequence-save-button"');
    expect(source).toContain("disabled={!canSaveSequence}");
    expect(source).toContain('title={saveDisabledReason || undefined}');
    expect(source).toContain("重新載入序列失敗，請稍後再試。");
    expect(source).toContain("刪除序列失敗，請稍後再試。");
  });
});
