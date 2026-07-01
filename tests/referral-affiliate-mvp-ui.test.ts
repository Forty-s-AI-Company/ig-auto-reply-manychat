import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function read(path: string) {
  return readFileSync(path, "utf8");
}

describe("referral and affiliate MVP UX guards", () => {
  it("keeps referrals from showing fake click metrics or raw status enums", () => {
    const source = read("src/app/referrals/page.tsx");

    expect(source).toContain("推薦折抵制度 v1");
    expect(source).toContain("受控開通");
    expect(source).toContain("不顯示假點擊數");
    expect(source).toContain("待確認折抵");
    expect(source).toContain("可用折抵");
    expect(source).toContain("referralStatusLabel");
    expect(source).toContain("7 天退款觀察期");
    expect(source).not.toContain("<span>{item.status}</span>");
  });

  it("keeps affiliate cash payout behind a controlled-opening gate", () => {
    const source = read("src/app/affiliate/page.tsx");

    expect(source).toContain("現金分潤後續開放");
    expect(source).toContain("正式產品主線目前以推薦折抵為主");
    expect(source).toContain("目前不開放現金提領");
    expect(source).toContain("分潤安全規則");
  });

  it("gives admin operators approve and reject controls for payout requests", () => {
    const source = read("src/app/admin/payouts/page.tsx");

    expect(source).toContain("/approve");
    expect(source).toContain("/reject");
    expect(source).toContain("內部保留的受控提領面板");
    expect(source).toContain("核准");
    expect(source).toContain("退回");
  });
});
