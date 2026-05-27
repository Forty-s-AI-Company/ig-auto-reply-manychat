import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Inbox,
  MessageCircle,
  PlugZap,
  Sparkles,
  Users,
} from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { getSelectedInstagramChannelId, instagramChannelWhere } from "@/lib/account-scope";
import { requireUser } from "@/lib/auth";
import { getMetaChannelConfig } from "@/lib/channels/meta";
import { publicChannelSelect } from "@/lib/channels/public";
import { getDb } from "@/lib/db";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

function directionLabel(direction: string) {
  return { inbound: "用戶訊息", outbound: "自動回覆" }[direction] || direction;
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export default async function DashboardPage() {
  await requireUser();
  const db = getDb();
  const workspaceId = await getCurrentWorkspaceId();
  const selectedChannelId = await getSelectedInstagramChannelId();
  const channelWhere = instagramChannelWhere(selectedChannelId, workspaceId);

  const [
    contacts,
    messages,
    openConversations,
    automations,
    connectedInstagramChannelRows,
    recentMessages,
    recentAutomations,
  ] = await Promise.all([
    db.contact.count({ where: channelWhere }),
    db.message.count({ where: channelWhere }),
    db.conversation.count({ where: { status: "open", ...channelWhere } }),
    db.automation.count({ where: { workspaceId } }),
    db.channel.findMany({ where: { workspaceId, type: "instagram", enabled: true }, select: { configJson: true, name: true } }),
    db.message.findMany({
      where: channelWhere,
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { contact: true, channel: { select: publicChannelSelect } },
    }),
    db.automation.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: "desc" },
      take: 4,
      include: { steps: true },
    }),
  ]);
  const connectedInstagramChannels = connectedInstagramChannelRows.filter((channel) => {
    const config = getMetaChannelConfig(channel.configJson);
    return Boolean(config.instagramUsername || config.instagramBusinessAccountId || config.instagramProfilePictureUrl || channel.name.startsWith("Instagram @"));
  }).length;

  const quickAutomations = [
    {
      title: "Instagram 預設回覆",
      description: "設定未命中關鍵字時的預設回覆。",
      href: "/automations/instagram-default-reply",
      icon: MessageCircle,
      label: "設定預設回覆",
    },
    {
      title: "私訊關鍵字回覆",
      description: "收到指定關鍵字後，自動回覆訊息並加標籤。",
      href: "/automations",
      icon: Sparkles,
      label: "建立關鍵字流程",
    },
    {
      title: "AI 常見問題回覆",
      description: "用知識庫回答常見問題，減少人工處理。",
      href: "/knowledge-base",
      icon: Bot,
      label: "整理知識庫",
    },
  ];

  const nextSteps = [
    {
      done: connectedInstagramChannels > 0,
      title: "連接 Instagram 帳號",
      href: "/channels/connect",
    },
    {
      done: automations > 0,
      title: "建立第一個自動化",
      href: "/automations",
    },
    {
      done: messages > 0,
      title: "送一則測試訊息並查看收件匣",
      href: "/mock-tester",
    },
  ];

  return (
    <AdminShell title="首頁">
      <div className="space-y-6">
        <section className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-cyan-300">首頁</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  InboxPilot 工作台
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                  從這裡檢查帳號連線、建立自動化、測試預設回覆，集中管理 Instagram 訊息與自動化流程。
                </p>
              </div>
              <Link
                href="/automations/instagram-default-reply"
                className="inline-flex items-center gap-2 rounded-md bg-cyan-400 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-cyan-300"
              >
                設定預設回覆
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "聯絡人", value: contacts, icon: Users },
                { label: "訊息", value: messages, icon: MessageCircle },
                { label: "待處理對話", value: openConversations, icon: Inbox },
                { label: "自動化", value: automations, icon: Sparkles },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-zinc-400">{item.label}</p>
                      <Icon className="h-4 w-4 text-zinc-500" />
                    </div>
                    <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-zinc-200">帳號連線狀態</p>
                <p className="mt-1 text-sm text-zinc-500">Instagram 連線狀態</p>
              </div>
              <PlugZap className="h-5 w-5 text-cyan-300" />
            </div>
            <div className="mt-5 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">已連線 IG 帳號</span>
                <span className="text-lg font-semibold text-white">{connectedInstagramChannels}</span>
              </div>
              <div className="mt-4 h-2 rounded-full bg-zinc-800">
                <div
                  className="h-2 rounded-full bg-cyan-400"
                  style={{ width: `${Math.min(100, (contacts / 1000) * 100)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-zinc-500">免費方案聯絡人用量：{contacts}/1000</p>
            </div>
            <div className="mt-4 space-y-2">
              {nextSteps.map((step) => (
                <Link
                  key={step.title}
                  href={step.href}
                  className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm hover:border-zinc-700"
                >
                  <span className={step.done ? "text-zinc-500 line-through" : "text-zinc-200"}>
                    {step.title}
                  </span>
                  {step.done ? (
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  ) : (
                    <ArrowRight className="h-4 w-4 text-zinc-500" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">快速建立自動化</h3>
              <p className="text-sm text-zinc-500">先把最常用的 IG 自動回覆流程做好。</p>
            </div>
            <Link href="/automations" className="text-sm text-cyan-300 hover:text-cyan-200">
              查看全部
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {quickAutomations.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 hover:border-cyan-700"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-950">
                    <Icon className="h-5 w-5 text-cyan-300" />
                  </div>
                  <h4 className="mt-4 font-medium text-white">{item.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{item.description}</p>
                  <p className="mt-4 inline-flex items-center gap-2 text-sm text-cyan-300">
                    {item.label}
                    <ArrowRight className="h-4 w-4" />
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900">
            <div className="border-b border-zinc-800 px-4 py-3">
              <h3 className="font-medium text-white">最近訊息</h3>
            </div>
            <div className="divide-y divide-zinc-800">
              {recentMessages.map((message) => (
                <div key={message.id} className="px-4 py-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-zinc-300">
                      {message.contact.displayName} / {message.channel.name} / {directionLabel(message.direction)}
                    </span>
                    <span className="text-zinc-500">{formatDate(message.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-zinc-100">{message.text || "非文字訊息"}</p>
                </div>
              ))}
              {recentMessages.length === 0 ? (
                <p className="px-4 py-6 text-sm text-zinc-500">
                  還沒有訊息。可以先用測試工具送一則測試訊息。
                </p>
              ) : null}
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900">
            <div className="border-b border-zinc-800 px-4 py-3">
              <h3 className="font-medium text-white">最近自動化</h3>
            </div>
            <div className="divide-y divide-zinc-800">
              {recentAutomations.map((automation) => (
                <Link
                  key={automation.id}
                  href="/automations"
                  className="block px-4 py-3 text-sm hover:bg-zinc-950"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium text-zinc-200">{automation.name}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        automation.enabled ? "bg-green-950 text-green-200" : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {automation.enabled ? "啟用中" : "已停止"}
                    </span>
                  </div>
                  <p className="mt-1 text-zinc-500">{automation.steps.length} 個步驟</p>
                </Link>
              ))}
              {recentAutomations.length === 0 ? (
                <p className="px-4 py-6 text-sm text-zinc-500">
                  還沒有自動化。從預設回覆或私訊關鍵字回覆開始最順。
                </p>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
