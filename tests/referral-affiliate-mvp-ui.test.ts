import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function read(path: string) {
  return readFileSync(path, "utf8");
}

describe("referral and affiliate MVP UX guards", () => {
  it("keeps referrals from showing fake click metrics or raw status enums", () => {
    const source = read("src/app/referrals/page.tsx");

    expect(source).toContain("點擊追蹤");
    expect(source).toContain("受控開通");
    expect(source).toContain("不顯示假點擊數");
    expect(source).toContain("referralStatusLabel");
    expect(source).toContain("付費轉換");
    expect(source).not.toContain("<span>{item.status}</span>");
  });

  it("shows affiliate payout gates and anti-fraud rules before self-service payout is enabled", () => {
    const source = read("src/app/affiliate/page.tsx");

    expect(source).toContain("提領狀態");
    expect(source).toContain("申請提領（營運審核開通）");
    expect(source).toContain("分潤安全規則");
    expect(source).toContain("自己的推薦碼");
    expect(source).toContain("不自動匯款");
  });

  it("gives admin operators approve and reject controls for payout requests", () => {
    const source = read("src/app/admin/payouts/page.tsx");

    expect(source).toContain("/approve");
    expect(source).toContain("/reject");
    expect(source).toContain("核准只代表進入批次對帳");
    expect(source).toContain("核准");
    expect(source).toContain("退回");
  });
});
