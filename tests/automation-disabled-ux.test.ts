import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("automation disabled UX", () => {
  const source = readFileSync("src/components/AutomationBuilderClient.tsx", "utf8");

  it("connects controlled basic automation actions to visible reasons", () => {
    expect(source).toContain('id={`${basic.testId}-reason`}');
    expect(source).toContain('aria-describedby={`${basic.testId}-reason`}');
    expect(source).toContain('action: "即將推出"');
  });

  it("connects the simple-release sequence gate to a visible reason", () => {
    expect(source).toContain('aria-describedby="automation-sequence-disabled-reason"');
    expect(source).toContain('id="automation-sequence-disabled-reason"');
    expect(source).toContain("不是假裝序列已經在簡版可直接使用");
  });

  it("keeps editor actions and destructive dialogs mobile and keyboard friendly", () => {
    expect(source).toContain("previewPanelRef.current?.scrollIntoView");
    expect(source).toContain('title="功能即將推出"');
    expect(source).toContain("功能即將推出。");
    expect(source).toContain('id="automation-delete-title" className="text-lg font-semibold text-zinc-950"');
    expect(source).toContain('id="automation-node-delete-title" className="text-lg font-semibold text-zinc-950"');
    expect(source).not.toContain("更多操作屬於受控開通功能");
    expect(source).not.toContain("回收桶屬於受控開通功能");
    expect(source).not.toContain('placeholder="搜尋其他自動化…"');
    expect(source).toContain("hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8d9]");
    expect(source).toContain("disabled:cursor-not-allowed disabled:bg-[#d7dbe0]");
    expect(source).toContain("text-red-600 hover:bg-red-50");
    expect(source).toContain("disabled:cursor-not-allowed disabled:bg-red-200");
    expect(source).toContain("mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end");
  });

  it("announces Instagram media fetch failures clearly", () => {
    expect(source).toContain('title={mediaLoading ? "正在抓取 Instagram 貼文，請稍候。" : "重新抓取 Instagram 貼文"}');
    expect(source).toContain('role="alert" aria-live="polite"');
    expect(source).toContain("重新連接 Instagram");
  });
});
