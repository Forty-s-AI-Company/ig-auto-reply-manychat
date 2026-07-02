import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("src/components/InstagramDefaultReplyClient.tsx", "utf8");

describe("Instagram default reply light-theme polish", () => {
  it("keeps the editor aligned with the light dashboard UI", () => {
    expect(source).toContain("bg-[#f8fafc]");
    expect(source).toContain("border-[#d7dbe0]");
    expect(source).toContain("bg-white");
    expect(source).toContain("text-[#111827]");

    expect(source).not.toMatch(
      /bg-zinc-9|bg-zinc-8|border-zinc-8|border-zinc-7|text-zinc-100|text-zinc-200|text-zinc-300|text-cyan-300|bg-cyan-400|hover:bg-cyan-300/,
    );
  });

  it("keeps form and feedback semantics production-ready", () => {
    expect(source).toContain('htmlFor="instagram-default-reply-message"');
    expect(source).toContain('id="instagram-default-reply-message"');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain("focus-visible:ring");
  });
});
