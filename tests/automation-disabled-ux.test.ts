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

  it("keeps editor actions and destructive dialogs mobile and keyboard friendly", () => {
    expect(source).toContain("previewPanelRef.current?.scrollIntoView");
    expect(source).toContain("hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8d9]");
    expect(source).toContain("disabled:cursor-not-allowed disabled:bg-[#d7dbe0]");
    expect(source).toContain("rounded-sm text-zinc-400 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300");
    expect(source).toContain("mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end");
  });
});
