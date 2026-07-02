import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const pageSource = readFileSync("src/app/admin/invoices/page.tsx", "utf8");
const buttonSource = readFileSync("src/components/AdminInvoiceRefundButton.tsx", "utf8");
const profileMenuSource = readFileSync("src/components/InboxPilotProfileMenu.tsx", "utf8");

describe("admin invoices refund UI", () => {
  it("keeps refund reconciliation as an admin-only controlled operation with clear copy", () => {
    expect(pageSource).toContain("帳單退款與折抵沖回");
    expect(pageSource).toContain("它不會自動向 PayUNI 發起退款");
    expect(pageSource).toContain("只有已付款帳單可標記退款");
    expect(pageSource).toContain('invoice.status === "paid"');
    expect(buttonSource).toContain("確認標記退款？");
    expect(buttonSource).toContain('role="dialog"');
    expect(buttonSource).toContain('aria-modal="true"');
    expect(buttonSource).toContain('data-testid="admin-invoice-refund-confirm"');
    expect(buttonSource).not.toContain("window.confirm");
    expect(buttonSource).toContain("/api/admin/invoices/${invoiceId}/refund");
  });

  it("uses localized statuses and exposes an admin entry point without raw payment enums", () => {
    expect(pageSource).toContain("paymentStatusLabel");
    expect(pageSource).toContain("付款失敗");
    expect(pageSource).toContain("狀態待確認");
    expect(pageSource).not.toContain("latestOrder.status}</p>");
    expect(profileMenuSource).toContain('href="/admin/invoices"');
    expect(profileMenuSource).toContain("帳單退款處理");
  });
});
