import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("src/components/SegmentsClient.tsx", "utf8");

describe("segments light-theme polish", () => {
  it("keeps the Segments surface aligned with the light dashboard UI", () => {
    expect(source).toContain("bg-[#f8fafc]");
    expect(source).toContain("border-[#d7dbe0]");
    expect(source).toContain("bg-white");
    expect(source).toContain("text-[#111827]");

    expect(source).not.toMatch(
      /bg-zinc-9|bg-zinc-8|border-zinc-8|border-zinc-7|text-zinc-100|text-zinc-200|text-zinc-300|text-cyan-200|bg-cyan-500|hover:bg-cyan-400/,
    );
  });

  it("keeps editable filters accessible enough for a SaaS settings form", () => {
    expect(source).toContain('name="segment-name"');
    expect(source).toContain('name="segment-search"');
    expect(source).toContain('name="segment-tag"');
    expect(source).toContain('name="segment-last-inbound-days"');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain("focus-visible:ring");
    expect(source).toContain('data-testid="segments-save-button"');
    expect(source).toContain('id="segment-save-disabled-reason"');
    expect(source).toContain("請先輸入分群名稱，才能儲存這組篩選條件。");
  });
});
