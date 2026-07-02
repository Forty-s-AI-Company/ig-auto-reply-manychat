import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("sequences form state", () => {
  it("keeps the save button tied to the live sequence name input value", () => {
    const source = readFileSync("src/components/SequencesClient.tsx", "utf8");

    expect(source).toContain("const trimmedName = name.trim()");
    expect(source).toContain("const [hasHydrated, setHasHydrated] = useState(false)");
    expect(source).toContain("setName(nameInputRef.current.value)");
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
    expect(source).toContain('aria-describedby={!canSaveSequence ? "sequence-save-disabled-reason" : undefined}');
    expect(source).toContain('id="sequence-save-disabled-reason"');
    expect(source).toContain('aria-describedby={subscribeDisabledReason ? "sequence-subscribe-disabled-reason" : undefined}');
    expect(source).toContain('id="sequence-subscribe-disabled-reason"');
    expect(source).toContain("重新載入序列失敗，請稍後再試。");
    expect(source).toContain("刪除序列失敗，請稍後再試。");
    expect(source).toContain('role="dialog"');
    expect(source).toContain('aria-modal="true"');
    expect(source).toContain('data-testid="sequence-confirm-delete"');
    expect(source).toContain("function requestRemoveStep");
    expect(source).toContain("function confirmRemoveStep");
    expect(source).toContain('data-testid={`sequence-step-remove-${index}`}');
    expect(source).toContain('data-testid="sequence-step-confirm-remove"');
    expect(source).toContain("移除序列步驟？");
    expect(source).toContain("這只會先修改草稿");
    expect(source).not.toContain('confirm("確定要刪除這個序列？")');
    expect(source).not.toContain("onClick={() => removeStep(index)}");
  });
});
