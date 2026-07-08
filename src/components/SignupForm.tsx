"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

function subscribeToUrlReferral() {
  return () => {};
}

const planLabels: Record<string, string> = {
  trial: "免費試用",
  starter: "Starter",
  creator: "Creator",
  pro: "Pro",
  business: "Business",
};

function getUrlReferralCode() {
  return new URLSearchParams(window.location.search).get("ref")?.trim() || "";
}

function getServerUrlReferralCode() {
  return "";
}

function getUrlSelectedPlan() {
  const plan = new URLSearchParams(window.location.search).get("plan")?.trim() || "";
  return planLabels[plan] ? plan : "";
}

function getServerSelectedPlan() {
  return "";
}

export function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCodeInput, setReferralCodeInput] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const urlReferralCode = useSyncExternalStore(subscribeToUrlReferral, getUrlReferralCode, getServerUrlReferralCode);
  const selectedPlan = useSyncExternalStore(subscribeToUrlReferral, getUrlSelectedPlan, getServerSelectedPlan);
  const visibleReferralCode = referralCodeInput ?? urlReferralCode;
  const effectiveReferralCode = visibleReferralCode.trim();
  const selectedPlanLabel = selectedPlan ? planLabels[selectedPlan] : "";
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const signupDisabledReason = submitting
    ? "正在建立帳號，請稍候。"
    : !trimmedName
      ? "請先輸入你的名稱。"
      : !trimmedEmail
        ? "請先輸入 Email。"
        : password.length < 8
          ? "密碼至少需要 8 個字元。"
          : null;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    if (signupDisabledReason) {
      setError(signupDisabledReason);
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          workspaceName: `${trimmedName || trimmedEmail || "InboxPilot"} Workspace`,
          email: trimmedEmail,
          password,
          referralCode: effectiveReferralCode || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "註冊失敗，請稍後再試。");
        setSubmitting(false);
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setError("無法連線到註冊服務，請稍後再試。");
      setSubmitting(false);
    }
  }

  const googleSignupHref = `/api/auth/google/start${
    effectiveReferralCode ? `?ref=${encodeURIComponent(effectiveReferralCode)}` : ""
  }`;

  return (
    <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-lg border border-[#d7dbe0] bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-medium text-[#667085]">IG 自動化控制台</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#111827]">建立平台登入帳號</h1>
      </div>
      {selectedPlanLabel ? (
        <div
          data-testid="signup-selected-plan"
          className="rounded-md border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm leading-6 text-cyan-950"
        >
          目前從「{selectedPlanLabel}」方案入口進來。建立帳號後，可先到「方案與用量」確認付款、推薦折抵與升級安排。
        </div>
      ) : null}
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert" aria-live="polite">
          {error}
        </p>
      ) : null}
      <a
        href={googleSignupHref}
        className="flex w-full items-center justify-center gap-3 rounded-md border border-[#d7dbe0] bg-white px-4 py-2.5 text-sm font-semibold text-[#111827] transition hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e] focus-visible:ring-offset-2"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4285f4] text-xs font-bold text-white">G</span>
        使用 Google 建立帳號
      </a>
      <div className="flex items-center gap-3 text-xs text-[#667085]">
        <span className="h-px flex-1 bg-[#e5e7eb]" />
        或使用 Email 建立
        <span className="h-px flex-1 bg-[#e5e7eb]" />
      </div>
      <label className="block text-sm font-medium text-[#475467]" htmlFor="signup-name">
        你的名稱
        <input
          id="signup-name"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          className="mt-1 w-full rounded-md border border-[#d7dbe0] bg-white px-3 py-2 text-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e] focus-visible:ring-offset-2"
        />
      </label>
      <label className="block text-sm font-medium text-[#475467]" htmlFor="signup-email">
        Email
        <input
          id="signup-email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          spellCheck={false}
          className="mt-1 w-full rounded-md border border-[#d7dbe0] bg-white px-3 py-2 text-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e] focus-visible:ring-offset-2"
        />
      </label>
      <label className="block text-sm font-medium text-[#475467]" htmlFor="signup-password">
        密碼
        <input
          id="signup-password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          className="mt-1 w-full rounded-md border border-[#d7dbe0] bg-white px-3 py-2 text-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e] focus-visible:ring-offset-2"
        />
      </label>
      <label className="block text-sm font-medium text-[#475467]" htmlFor="signup-referral-code">
        推薦碼（選填）
        <input
          id="signup-referral-code"
          name="referralCode"
          value={visibleReferralCode}
          onChange={(event) => setReferralCodeInput(event.target.value)}
          autoComplete="off"
          spellCheck={false}
          className="mt-1 w-full rounded-md border border-[#d7dbe0] bg-white px-3 py-2 text-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e] focus-visible:ring-offset-2"
        />
        <span className="mt-1 block text-xs leading-5 text-[#667085]" data-testid="signup-referral-helper">
          {urlReferralCode
            ? "已從邀請連結帶入推薦碼。折抵會在有效付費並超過退款觀察期後才可用，不可提現。"
            : "有推薦碼可填在這裡；折抵只能用於方案費，不可提現。"}
        </span>
      </label>
      <button
        type="submit"
        disabled={Boolean(signupDisabledReason)}
        aria-describedby={signupDisabledReason ? "signup-submit-disabled-reason" : undefined}
        title={signupDisabledReason || undefined}
        className="w-full rounded-md bg-[#006fe6] px-4 py-2 font-medium text-white hover:bg-[#0057b8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006fe6] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#e5e7eb] disabled:text-[#667085]"
      >
        {submitting ? "建立中…" : "建立帳號"}
      </button>
      {signupDisabledReason ? (
        <p id="signup-submit-disabled-reason" className="text-xs leading-5 text-[#667085]">
          {signupDisabledReason}
        </p>
      ) : null}
      <p className="text-center text-sm text-[#667085]">
        已經有帳號？{" "}
        <Link href="/login" className="rounded-sm font-medium text-[#006fe6] hover:text-[#0057b8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006fe6] focus-visible:ring-offset-2">
          回到登入
        </Link>
      </p>
      <p className="text-center text-xs text-[#667085]">
        想重新比較功能與用量？{" "}
        <Link href="/pricing" data-testid="signup-back-to-pricing" className="rounded-sm font-medium text-[#006fe6] hover:text-[#0057b8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006fe6] focus-visible:ring-offset-2">
          回看方案與價格
        </Link>
      </p>
    </form>
  );
}
