import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("src/app/billing/page.tsx", "utf8");

describe("billing page status copy", () => {
  it("renders invoice and PayUNI order statuses as user-facing Chinese labels", () => {
    expect(source).toContain("invoiceStatusLabel");
    expect(source).toContain("paymentStatusLabel");
    expect(source).toContain("已退款");
    expect(source).toContain("待付款");
    expect(source).toContain("付款失敗");
    expect(source).toContain("退款，推薦折抵會依規則取消或沖回");
    expect(source).not.toContain("<span>{invoice.status}</span>");
    expect(source).not.toContain("<span>{order.status}</span>");
  });
});
