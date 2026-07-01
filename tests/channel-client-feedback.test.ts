import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const clientFeedbackFiles = [
  "src/components/DisconnectChannelButton.tsx",
  "src/components/oauth/OAuthPopupConnectButton.tsx",
];

describe("channel client feedback", () => {
  it("uses inline feedback instead of native alert dialogs for recoverable channel errors", () => {
    for (const file of clientFeedbackFiles) {
      const source = readFileSync(file, "utf8");

      expect(source, file).not.toMatch(/\bwindow\.alert\s*\(/);
      expect(source, file).not.toMatch(/[^\w.]alert\s*\(/);
      expect(source, file).toContain('aria-live="polite"');
    }
  });
});
