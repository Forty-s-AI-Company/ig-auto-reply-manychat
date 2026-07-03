import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("marketing info page polish", () => {
  it("keeps low-frequency public/support pages aligned with the light SaaS design system", () => {
    const source = readFileSync("src/components/marketing/MarketingInfoPage.tsx", "utf8");

    expect(source).toContain("bg-[#f8fafc]");
    expect(source).toContain("border-[#d7dbe0]");
    expect(source).toContain("rounded-lg");
    expect(source).toContain("focus-visible:outline");
    expect(source).toContain('aria-hidden="true"');
    expect(source).toContain("break-words");

    expect(source).not.toMatch(/#fffdf2|#ffdd35|shadow-\[0_5px_0_#111\]|rounded-\[28px\]|tracking-\[-0\.06em\]/);
  });

  it("keeps the help center copy actionable instead of placeholder-like", () => {
    const helpCenterSource = readFileSync("src/app/help-center/page.tsx", "utf8");

    expect(helpCenterSource).toContain('ctaLabel="開始連接 Instagram"');
    expect(helpCenterSource).toContain('ctaHref="/channels/connect"');
    expect(helpCenterSource).toContain("確認左側帳號切換器");
    expect(helpCenterSource).toContain("受控開通的進階節點");
    expect(helpCenterSource).not.toContain("這裡放");
  });
});
