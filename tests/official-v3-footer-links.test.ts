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
