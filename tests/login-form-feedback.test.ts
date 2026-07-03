import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const loginFormSource = readFileSync("src/components/LoginForm.tsx", "utf8");

describe("login form feedback", () => {
  it("keeps email login from submitting before required fields are clear", () => {
    expect(loginFormSource).toContain("const trimmedEmail = email.trim()");
    expect(loginFormSource).toContain("const loginDisabledReason = submitting");
    expect(loginFormSource).toContain("請先輸入 Email。");
    expect(loginFormSource).toContain("請先輸入密碼。");
    expect(loginFormSource).toContain('disabled={Boolean(loginDisabledReason)}');
    expect(loginFormSource).toContain('aria-describedby={loginDisabledReason ? "login-submit-disabled-reason" : undefined}');
    expect(loginFormSource).toContain("login-submit-disabled-reason");
  });

  it("shows accessible login failure and network feedback", () => {
    expect(loginFormSource).toContain('role="alert"');
    expect(loginFormSource).toContain('aria-live="polite"');
    expect(loginFormSource).toContain("登入中…");
    expect(loginFormSource).toContain("無法連線到登入服務，請稍後再試。");
    expect(loginFormSource).toContain("email: trimmedEmail");
    expect(loginFormSource).toContain('autoComplete="current-password"');
  });
});
