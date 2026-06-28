import { describe, expect, it } from "vitest";
import { parseInstalledModelNames } from "../../AI_TEAM/scripts/local-models.mjs";

describe("AI_TEAM local model parsing", () => {
  it("parses ollama list output into model ids", () => {
    const output = [
      "NAME                       ID              SIZE      MODIFIED",
      "qwen2.5-coder:7b          dae161e27b0e    4.7 GB    18 hours ago",
      "qwen3:8b                  500a1f067a9f    5.2 GB    2 months ago",
      "deepseek-coder-v2:lite    63fb193b3a9b    8.9 GB    17 hours ago",
    ].join("\n");

    expect(parseInstalledModelNames(output)).toEqual([
      "qwen2.5-coder:7b",
      "qwen3:8b",
      "deepseek-coder-v2:lite",
    ]);
  });

  it("ignores empty lines and header-only output", () => {
    expect(parseInstalledModelNames("NAME  ID  SIZE  MODIFIED\n")).toEqual([]);
  });
});
