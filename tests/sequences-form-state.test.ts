import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("sequences form state", () => {
  it("keeps the save button tied to the live sequence name input value", () => {
    const source = readFileSync("src/components/SequencesClient.tsx", "utf8");

    expect(source).toContain("const trimmedName = name.trim()");
    expect(source).toContain("onInput={(event) => setName(event.currentTarget.value)}");
    expect(source).toContain('aria-invalid={!trimmedName}');
    expect(source).toContain('data-testid="sequence-save-button"');
    expect(source).toContain("disabled={!canSaveSequence}");
    expect(source).toContain('title={saveDisabledReason || undefined}');
  });
});
