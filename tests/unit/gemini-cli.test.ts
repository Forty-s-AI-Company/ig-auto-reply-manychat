import { afterEach, describe, expect, it, vi } from "vitest";
import { getGeminiCliCommandCandidates } from "@/lib/ai/gemini-cli";

describe("gemini cli command resolution", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("prefers agy before the legacy antigravity command when no override is set", () => {
    expect(getGeminiCliCommandCandidates()).toEqual(["agy", "gemini", "antigravity"]);
  });

  it("keeps explicit env overrides at the front", () => {
    vi.stubEnv("ANTIGRAVITY_CLI_COMMAND", "custom-antigravity");
    vi.stubEnv("GEMINI_CLI_COMMAND", "custom-gemini");

    expect(getGeminiCliCommandCandidates()).toEqual(["custom-antigravity", "custom-gemini", "agy", "gemini", "antigravity"]);
  });
});
