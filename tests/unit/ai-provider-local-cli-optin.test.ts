import { afterEach, describe, expect, it, vi } from "vitest";
import { canUseAiProvider, isLocalAiCliEnabled } from "@/lib/ai/providers";

describe("AI local CLI opt-in", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("keeps local CLI providers opt-in in non-development automation environments", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("AI_ENABLE_LOCAL_CLI", "");

    expect(isLocalAiCliEnabled()).toBe(false);
    expect(canUseAiProvider("codex_cli")).toBe(false);
    expect(canUseAiProvider("antigravity_cli")).toBe(false);
    expect(canUseAiProvider("chatgpt")).toBe(true);
  });
});
