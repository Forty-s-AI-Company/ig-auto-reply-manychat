import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const clientFeedbackFiles = [
  "src/components/DisconnectChannelButton.tsx",
  "src/components/oauth/OAuthPopupConnectButton.tsx",
  "src/components/JsonCrudClient.tsx",
];

describe("channel client feedback", () => {
  it("uses inline feedback instead of native alert dialogs for recoverable client errors", () => {
    for (const file of clientFeedbackFiles) {
      const source = readFileSync(file, "utf8");

      expect(source, file).not.toMatch(/\bwindow\.alert\s*\(/);
      expect(source, file).not.toMatch(/[^\w.]alert\s*\(/);
      expect(source, file).toContain('aria-live="polite"');
    }
  });

  it("keeps Instagram channel action controls aligned with the light settings UI", () => {
    const profileRefresh = readFileSync("src/components/RefreshInstagramProfileButton.tsx", "utf8");
    const instagramActions = readFileSync("src/components/InstagramChannelActions.tsx", "utf8");

    expect(profileRefresh).toContain('bg-white');
    expect(profileRefresh).toContain('text-[#b54708]');
    expect(profileRefresh).not.toMatch(/text-amber-100|bg-amber-900/);
    expect(instagramActions).toContain('bg-[#f0f9ff]');
    expect(instagramActions).toContain('text-[#0b4a6f]');
    expect(instagramActions).toContain("Instagram 功能檢查");
    expect(instagramActions).not.toContain("功能已開始實作");
    expect(instagramActions).not.toMatch(/維持 disabled/);
    expect(instagramActions).not.toMatch(/bg-cyan-950|text-cyan-100|text-zinc-100|border-zinc-700|hover:bg-zinc-800/);
  });
});
