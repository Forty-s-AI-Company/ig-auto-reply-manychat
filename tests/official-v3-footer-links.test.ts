import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("official v3 footer links", () => {
  it("uses real public routes instead of placeholder footer links", () => {
    const source = readFileSync("src/components/official/OfficialV3LandingPage.tsx", "utf8");

    expect(source).toContain('href: "/privacy-policy"');
    expect(source).toContain('href: "/terms-of-service"');
    expect(source).toContain('href: "/contact"');
    expect(source).toContain("footerLinks.map");
    expect(source).not.toContain('href="#" className="hover:text-white"');
  });
});

describe("official v2 launch channel scope", () => {
  it("does not advertise Messenger as an active launch-scope channel", () => {
    const source = readFileSync("src/components/official/OfficialV2LandingPage.tsx", "utf8");

    expect(source).toContain("Meta OAuth 和 Webhook");
    expect(source).toContain("Meta OAuth, and webhooks");
    expect(source).not.toContain("siFacebook");
    expect(source).not.toContain('label: "Messenger"');
    expect(source).not.toContain("Messenger permissions");
  });
});
