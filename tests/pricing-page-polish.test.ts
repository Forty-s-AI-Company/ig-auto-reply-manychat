import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const pricingClient = "src/components/PricingPageClient.tsx";
const pricingPage = "src/app/pricing/page.tsx";

describe("public pricing page polish", () => {
  it("uses Chinese SaaS pricing copy instead of mixed English product labels", () => {
    const source = readFileSync(pricingClient, "utf8");
    const pageSource = readFileSync(pricingPage, "utf8");

    expect(source).toContain("方案與價格");
    expect(source).toContain("活躍聯絡人");
    expect(source).toContain("訊息事件");
    expect(source).toContain("開始免費試用");
    expect(pageSource).toContain("InboxPilot 方案與價格");
    expect(source).not.toContain(">Pricing<");
    expect(pageSource).not.toContain("InboxPilot Pricing");
    expect(source).not.toContain(" active contacts");
    expect(source).not.toContain(" message events");
    expect(source).not.toContain(" Team Seats");
    expect(source).not.toContain("Retention 可");
  });

  it("keeps pricing actions accessible and aligned with the light product UI", () => {
    const source = readFileSync(pricingClient, "utf8");

    expect(source).toContain("bg-[#f8fafc]");
    expect(source).toContain("border-[#d7dbe0]");
    expect(source).toContain("focus-visible:outline");
    expect(source).toContain("PayUNI Sandbox 已驗證");
    expect(source).not.toMatch(/tracking-\[0\.18em\]|tracking-\[-0\.05em\]/);
  });
});
