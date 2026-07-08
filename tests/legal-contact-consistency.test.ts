import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const contactPageSource = readFileSync("src/app/contact/page.tsx", "utf8");
const privacyPageSource = readFileSync("src/app/privacy-policy/page.tsx", "utf8");
const termsPageSource = readFileSync("src/app/terms-of-service/page.tsx", "utf8");
const deletionPageSource = readFileSync("src/app/data-deletion/page.tsx", "utf8");
const settingsPageSource = readFileSync("src/app/channels/page.tsx", "utf8");
const marketingInfoPageSource = readFileSync("src/components/marketing/MarketingInfoPage.tsx", "utf8");
const officialLandingSource = readFileSync("src/components/official/OfficialLandingPage.tsx", "utf8");
const officialLandingV2Source = readFileSync("src/components/official/OfficialV2LandingPage.tsx", "utf8");
const officialLandingV3Source = readFileSync("src/components/official/OfficialV3LandingPage.tsx", "utf8");
const metaVerificationStatusSource = readFileSync("docs/meta-verification-status.md", "utf8");
const metaReviewPackageSource = readFileSync("docs/meta-app-review-package.md", "utf8");

describe("legal and contact consistency", () => {
  it("keeps the same owner, contact email, and website across active public surfaces", () => {
    const sources = [
      contactPageSource,
      privacyPageSource,
      termsPageSource,
      deletionPageSource,
      settingsPageSource,
      marketingInfoPageSource,
      officialLandingSource,
      officialLandingV2Source,
      officialLandingV3Source,
      metaVerificationStatusSource,
      metaReviewPackageSource,
    ];

    for (const source of sources) {
      expect(source).toContain("Luo Shih Lin");
      expect(source).toContain("zeroyuanbrothers@gmail.com");
    }

    expect(settingsPageSource).toContain("https://inboxpilot.carry-digital-nomad.in.net/");
    expect(contactPageSource).toContain("https://inboxpilot.carry-digital-nomad.in.net/");
    expect(marketingInfoPageSource).toContain("https://inboxpilot.carry-digital-nomad.in.net/");
    expect(officialLandingSource).toContain("https://inboxpilot.carry-digital-nomad.in.net/");
    expect(officialLandingV2Source).toContain("https://inboxpilot.carry-digital-nomad.in.net/");
    expect(officialLandingV3Source).toContain("https://inboxpilot.carry-digital-nomad.in.net/");
    expect(metaVerificationStatusSource).toContain("https://inboxpilot.carry-digital-nomad.in.net/");
    expect(metaReviewPackageSource).toContain("https://inboxpilot.carry-digital-nomad.in.net/");
  });
});
