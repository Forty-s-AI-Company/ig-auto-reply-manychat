import { describe, expect, it } from "vitest";
import { keywordMatches } from "@/lib/automation/triggers";

describe("keyword automation matching", () => {
  it("matches contains keyword", () => {
    expect(keywordMatches("你好，我想領取資料", { keywords: ["領取"], match: "contains" })).toBe(
      true,
    );
  });

  it("does not match unrelated message", () => {
    expect(keywordMatches("只是路過看看", { keywords: ["領取"], match: "contains" })).toBe(false);
  });
});
