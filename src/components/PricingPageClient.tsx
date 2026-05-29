"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { billingPlans, formatTwd } from "@/lib/billing";

export function PricingPageClient() {
  const publicPlans = billingPlans.filter((plan) => plan.key !== "agency");

  return (
    <main className="min-h-screen bg-[#f7f7f2] text-[#111827]">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <Link href="/official" className="text-2xl font-black tracking-[-0.04em]">
            InboxPilot
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-zinc-600">
              登入
            </Link>
            <Link href="/signup" className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-bold text-zinc-950">
              免費開始
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-14">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">Pricing</p>
          <h1 className="mt-3 text-5xl font-black tracking-[-0.05em]">對齊 InboxPilot 成本結構的正式方案</h1>
          <p className="mt-5 text-lg leading-8 text-zinc-600">
            IG 帳號數暫時不限，平台用 active contacts、message events、team seats 與資料保存天數控成本。
            AI 可用，但 API Key 由使用者自行串接，AI token 成本不列入平台費用。
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-5">
          {publicPlans.map((plan) => (
            <article key={plan.key} className="flex min-h-[520px] flex-col rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold">{plan.name}</h2>
              <p className="mt-2 min-h-[72px] text-sm leading-6 text-zinc-600">{plan.description}</p>
              <div className="mt-5">
                <p className="text-3xl font-black">{formatTwd(plan.priceMonthly || 0)}</p>
                <p className="text-xs text-zinc-500">每月，年繳 {formatTwd(plan.priceYearly || 0)}</p>
              </div>
              <ul className="mt-5 space-y-3 text-sm text-zinc-700">
                <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-cyan-600" />{plan.activeContactsLimit.toLocaleString()} active contacts</li>
                <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-cyan-600" />{plan.messageEventsLimit.toLocaleString()} message events</li>
                <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-cyan-600" />自動化 {plan.automationsLimit === null ? "不限" : `${plan.automationsLimit} 條`}</li>
                <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-cyan-600" />資料保存 {plan.conversationRetentionDays} 天</li>
                <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-cyan-600" />現金分潤 {plan.affiliateCashPayoutEligible ? "可申請" : "不可提領"}</li>
              </ul>
              <Link
                href="/signup"
                className="mt-auto inline-flex items-center justify-center gap-2 rounded-md bg-[#111827] px-4 py-3 text-sm font-bold text-white"
              >
                開始使用
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>

        <section className="mt-8 rounded-lg border border-cyan-200 bg-cyan-50 p-5 text-sm leading-7 text-cyan-950">
          <strong>加量包：</strong>Message Events、Active Contacts、Team Seats、Retention 可按月加購，可用折抵金折抵，也會產生較低比例聯盟分潤。
        </section>
      </section>
    </main>
  );
}
