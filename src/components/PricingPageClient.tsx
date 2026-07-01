"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { billingPlans, formatTwd } from "@/lib/billing";
import type { BillingPlan } from "@/lib/billing";

const planDisplayNames: Partial<Record<BillingPlan["key"], string>> = {
  trial: "免費試用",
};

const planBadges: Partial<Record<BillingPlan["key"], string>> = {
  creator: "創作者推薦",
  pro: "成長團隊",
};

function getPlanDisplayName(plan: BillingPlan) {
  return planDisplayNames[plan.key] ?? plan.name;
}

function formatPlanLimit(value: number | null, suffix: string) {
  return value === null ? "不限" : `${value.toLocaleString()} ${suffix}`;
}

export function PricingPageClient() {
  const publicPlans = billingPlans.filter((plan) => plan.key !== "agency");

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#111827]">
      <header className="border-b border-[#d7dbe0] bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <Link href="/official" className="text-2xl font-black tracking-[-0.03em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-600">
            InboxPilot
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-600">
              登入
            </Link>
            <Link href="/signup" className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950 shadow-sm hover:bg-cyan-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-700">
              免費開始
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-14">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-cyan-700">方案與價格</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.03em] text-slate-950 md:text-5xl">
            依照 IG 訊息營運規模選擇方案
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            從單一創作者到多人營運團隊，依活躍聯絡人、訊息事件、團隊席次與資料保存天數控管成本。
            Instagram 帳號數目前不額外計費；AI 可串接自有 API Key，模型費用不列入平台月費。
          </p>
        </div>

        <div className="mt-8 grid gap-3 rounded-lg border border-[#d7dbe0] bg-white p-4 text-sm text-slate-700 md:grid-cols-3">
          <p>
            <span className="font-bold text-slate-950">7 天試用</span>
            <br />
            先測 IG 留言與私訊流程，再決定是否升級。
          </p>
          <p>
            <span className="font-bold text-slate-950">用量透明</span>
            <br />
            方案以活躍聯絡人、訊息事件與團隊席次計算。
          </p>
          <p>
            <span className="font-bold text-slate-950">PayUNI Sandbox 已驗證</span>
            <br />
            正式收費切換前仍維持測試站交易流程。
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {publicPlans.map((plan) => (
            <article
              key={plan.key}
              className="flex min-h-[520px] flex-col rounded-lg border border-[#d7dbe0] bg-white p-5 shadow-sm"
            >
              <div className="flex min-h-8 items-start justify-between gap-3">
                <h2 className="text-xl font-bold text-slate-950">{getPlanDisplayName(plan)}</h2>
                {planBadges[plan.key] ? (
                  <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-bold text-cyan-800">
                    {planBadges[plan.key]}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 min-h-[72px] text-sm leading-6 text-slate-600">{plan.description}</p>
              <div className="mt-5">
                <p className="text-3xl font-black text-slate-950">{formatTwd(plan.priceMonthly || 0)}</p>
                <p className="text-xs font-medium text-slate-500">月繳價格，年繳 {formatTwd(plan.priceYearly || 0)}</p>
              </div>
              <ul className="mt-5 space-y-3 text-sm text-slate-700">
                <li className="flex gap-2">
                  <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600" />
                  {formatPlanLimit(plan.activeContactsLimit, "位活躍聯絡人")}
                </li>
                <li className="flex gap-2">
                  <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600" />
                  {formatPlanLimit(plan.messageEventsLimit, "則訊息事件")}
                </li>
                <li className="flex gap-2">
                  <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600" />
                  自動化 {plan.automationsLimit === null ? "不限" : `${plan.automationsLimit} 條`}
                </li>
                <li className="flex gap-2">
                  <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600" />
                  {plan.teamSeatsLimit.toLocaleString()} 個團隊席次
                </li>
                <li className="flex gap-2">
                  <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600" />
                  對話資料保存 {plan.conversationRetentionDays} 天
                </li>
                <li className="flex gap-2">
                  <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600" />
                  現金分潤 {plan.affiliateCashPayoutEligible ? "可申請" : "暫不開放"}
                </li>
              </ul>
              <Link
                href="/signup"
                className="mt-auto inline-flex items-center justify-center gap-2 rounded-md bg-[#111827] px-4 py-3 text-sm font-bold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-600"
              >
                {plan.key === "trial" ? "開始免費試用" : "選擇這個方案"}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>

        <section className="mt-8 rounded-lg border border-cyan-200 bg-cyan-50 p-5 text-sm leading-7 text-cyan-950">
          <strong>加量包：</strong>
          訊息事件、活躍聯絡人、團隊席次與資料保存天數可按月加購；可用折抵金折抵，也會產生較低比例的聯盟分潤。
        </section>
      </section>
    </main>
  );
}
