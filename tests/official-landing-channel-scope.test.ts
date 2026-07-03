import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("official landing channel scope", () => {
  it("only advertises the currently supported Instagram and Meta authorization scope", () => {
    const source = readFileSync("src/components/official/OfficialLandingPage.tsx", "utf8");

    expect(source).toContain("目前聚焦支援 Instagram 與 Meta 授權");
    expect(source).toContain("Focused on Instagram and Meta authorization");
    expect(source).toContain('label: "Instagram"');
    expect(source).toContain('label: "Meta OAuth"');
    expect(source).not.toContain("siWhatsapp");
    expect(source).not.toContain("siTiktok");
    expect(source).not.toContain("siYoutube");
    expect(source).not.toContain("siFacebook");
    expect(source).not.toContain('label: "WhatsApp"');
    expect(source).not.toContain('label: "Messenger"');
    expect(source).not.toContain('label: "TikTok"');
  });
});
