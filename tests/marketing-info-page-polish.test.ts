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

  it("keeps public API docs scoped to launch-safe Instagram and Meta surfaces", () => {
    const apiDocsSource = readFileSync("src/app/api-docs/page.tsx", "utf8");

    expect(apiDocsSource).toContain("launch-safe API");
    expect(apiDocsSource).toContain("Instagram OAuth");
    expect(apiDocsSource).toContain("/api/meta/oauth/start");
    expect(apiDocsSource).toContain("/api/webhooks/meta");
    expect(apiDocsSource).toContain("PayUNI Sandbox");
    expect(apiDocsSource).toContain("其他通路、本機測試 provider");
    expect(apiDocsSource).not.toContain("/api/oauth/meta-facebook");
    expect(apiDocsSource).not.toContain("/api/oauth/telegram-bot");
    expect(apiDocsSource).not.toContain("/api/oauth/mock");
    expect(apiDocsSource).not.toContain("/api/webhooks/telegram");
    expect(apiDocsSource).not.toContain("/api/webhooks/whatsapp");
  });

  it("keeps the contact page support copy safe for secrets and payment data", () => {
    const contactSource = readFileSync("src/app/contact/page.tsx", "utf8");

    expect(contactSource).toContain("PayUNI");
    expect(contactSource).toContain("敏感資料請先遮蔽");
    expect(contactSource).toContain("請避免在信件中貼上完整密鑰、token、卡號或 cookie");
    expect(contactSource).toContain("App ID 或 Business ID 可先遮蔽部分數字");
    expect(contactSource).toContain("遮蔽後的查詢編號");
    expect(contactSource).toContain("請不要寄完整卡號或正式金鑰");
    expect(contactSource).not.toContain("PayUni");
    expect(contactSource).not.toContain("Payuni");
    expect(contactSource).not.toContain("請提供 Meta App ID");
    expect(contactSource).not.toContain("請提供 PayUni 商店代號");
  });
});
