import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const formSource = readFileSync("src/components/SignupForm.tsx", "utf8");
const pageSource = readFileSync("src/app/signup/page.tsx", "utf8");

describe("signup light theme", () => {
  it("keeps signup aligned with the light login surface", () => {
    expect(pageSource).toContain("bg-[#f5f6f7]");
    expect(formSource).toContain("border-[#d7dbe0]");
    expect(formSource).toContain("bg-white");
    expect(formSource).toContain("text-[#111827]");
    expect(formSource).toContain("focus-visible:ring-2");
    expect(`${pageSource}\n${formSource}`).not.toMatch(/bg-zinc-9|bg-zinc-8|border-zinc-8|border-zinc-7|text-zinc-100|text-zinc-200|text-zinc-300|text-cyan-300|bg-cyan-500/);
  });

  it("uses accessible signup fields and clear async feedback", () => {
    expect(formSource).toContain('name="email"');
    expect(formSource).toContain('type="email"');
    expect(formSource).toContain('autoComplete="new-password"');
    expect(formSource).toContain('name="referralCode"');
    expect(formSource).toContain('data-testid="signup-referral-helper"');
    expect(formSource).toContain('data-testid="signup-selected-plan"');
    expect(formSource).toContain('data-testid="signup-back-to-pricing"');
    expect(formSource).toContain("PayUNI Sandbox");
    expect(formSource).toContain('role="alert"');
    expect(formSource).toContain('aria-live="polite"');
    expect(formSource).toContain("建立中…");
    expect(formSource).toContain("signup-submit-disabled-reason");
    expect(formSource).toContain("請先輸入你的名稱。");
    expect(formSource).toContain("密碼至少需要 8 個字元。");
    expect(formSource).toContain('aria-describedby={signupDisabledReason ? "signup-submit-disabled-reason" : undefined}');
  });

  it("preserves referral attribution from signup links for email and Google signup", () => {
    expect(formSource).toContain('new URLSearchParams(window.location.search).get("ref")');
    expect(formSource).toContain('new URLSearchParams(window.location.search).get("plan")');
    expect(formSource).toContain("useSyncExternalStore");
    expect(formSource).toContain("const visibleReferralCode = referralCodeInput ?? urlReferralCode");
    expect(formSource).toContain("const effectiveReferralCode = visibleReferralCode.trim()");
    expect(formSource).toContain("const selectedPlanLabel = selectedPlan ? planLabels[selectedPlan] : \"\"");
    expect(formSource).toContain("referralCode: effectiveReferralCode || null");
    expect(formSource).toContain("encodeURIComponent(effectiveReferralCode)");
    expect(formSource).toContain("已從邀請連結帶入推薦碼");
    expect(formSource).toContain("折抵只能用於方案費，不可提現");
  });
});
