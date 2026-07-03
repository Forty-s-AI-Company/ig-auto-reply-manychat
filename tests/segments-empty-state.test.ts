import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("segments empty state", () => {
  it("turns a brand-new Segments page into a guided next-step surface", () => {
    const source = readFileSync("src/components/SegmentsClient.tsx", "utf8");

    expect(source).toContain('data-testid="segments-empty-state"');
    expect(source).toContain('data-testid="segments-empty-create-cta"');
    expect(source).toContain('data-testid="segments-empty-open-contacts"');
    expect(source).toContain('data-testid="segments-empty-connect-instagram"');
    expect(source).toContain("目前還沒有已連接的 Instagram 帳號");
    expect(source).toContain("建立第一個分群");
    expect(source).toContain('id="segments-editor-card"');
  });
});
