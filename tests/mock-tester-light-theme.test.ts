import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("src/components/MockTesterClient.tsx", "utf8");

describe("mock tester light theme", () => {
  it("keeps the mock tester aligned with the light dashboard system", () => {
    expect(source).toContain("border-[var(--border-soft)]");
    expect(source).toContain("bg-white");
    expect(source).toContain("bg-[var(--ip-surface-muted)]");
    expect(source).toContain("focus-visible:ring-2");
    expect(source).not.toMatch(/bg-zinc-9|bg-zinc-8|border-zinc-8|border-zinc-7|text-zinc-100|text-zinc-200|text-zinc-300|text-cyan-300|bg-cyan-500/);
  });

  it("shows clear async feedback instead of silent raw JSON only", () => {
    expect(source).toContain("送出中…");
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain('role="status"');
    expect(source).toContain('name="mockExternalId"');
    expect(source).toContain('name="mockDisplayName"');
    expect(source).toContain('name="mockMessageText"');
  });
});
