import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("automation disabled UX", () => {
  const source = readFileSync("src/components/AutomationBuilderClient.tsx", "utf8");

  it("connects controlled basic automation actions to visible reasons", () => {
    expect(source).toContain('id={`${basic.testId}-reason`}');
    expect(source).toContain('aria-describedby={`${basic.testId}-reason`}');
  });

  it("connects the simple-release sequence gate to a visible reason", () => {
    expect(source).toContain('aria-describedby="automation-sequence-disabled-reason"');
    expect(source).toContain('id="automation-sequence-disabled-reason"');
    expect(source).toContain("不是假裝序列已經在簡版可直接使用");
  });
});
