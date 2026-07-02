"use client";

import { Bot, CheckCircle2, MessageCircle, Play, Save, Send, Square } from "lucide-react";
import { useState } from "react";

type AutomationStep = {
  id?: string;
  order: number;
  type: "send_message" | "add_tag" | "remove_tag" | "wait" | "condition" | "ai_reply" | "set_field";
  configJson: Record<string, unknown>;
};

type AutomationItem = {
  id: string;
  name: string;
  enabled: boolean;
  triggerType: "keyword" | "new_contact" | "manual" | "webhook";
  triggerConfigJson: Record<string, unknown>;
  steps: AutomationStep[];
};

const defaultMessage =
  "嗨，謝謝你的訊息！我們已經收到，會盡快回覆你。如果你想先了解服務內容，可以直接告訴我你最想解決的問題。";

function getMessage(item?: AutomationItem | null) {
  const messageStep = item?.steps.find((step) => step.type === "send_message");
  return String(messageStep?.configJson.text || defaultMessage);
}

function toPayload(message: string, enabled: boolean) {
  return {
    name: "Instagram Default Reply",
    enabled,
    triggerType: "webhook",
    triggerConfigJson: {
      event: "instagram_default_reply",
      templateType: "instagram_default_reply",
    },
    steps: [
      {
        order: 1,
        type: "send_message",
        configJson: { text: message },
      },
    ],
  };
}

export function InstagramDefaultReplyClient({
  initialAutomation,
  instagramAccountName,
}: {
  initialAutomation?: AutomationItem | null;
  instagramAccountName?: string | null;
}) {
  const [automation, setAutomation] = useState(initialAutomation || null);
  const [message, setMessage] = useState(getMessage(initialAutomation));
  const [enabled, setEnabled] = useState(initialAutomation?.enabled ?? false);
  const [activeTab, setActiveTab] = useState<"preview" | "test">("preview");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [testCode] = useState("326");
  const noticeTone = notice.includes("失敗") ? "error" : "success";
  const isDirty = message !== getMessage(automation) || enabled !== (automation?.enabled ?? false);
  const status = enabled ? "啟用中" : "已停止";

  async function save() {
    setSaving(true);
    setNotice("");
    try {
      const endpoint = automation?.id ? `/api/automations/${automation.id}` : "/api/automations";
      const response = await fetch(endpoint, {
        method: automation?.id ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(toPayload(message, enabled)),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "儲存失敗。");
      setAutomation(data);
      setNotice("已儲存預設回覆。");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "儲存失敗。");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#087f95]">自動化 / Instagram</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold text-[#111827]">Instagram 預設回覆</h2>
            <span
              className={`rounded-full border px-2 py-1 text-xs font-medium ${
                enabled
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-[#d7dbe0] bg-white text-[#667085]"
              }`}
            >
              {status}
            </span>
            <span className="rounded-full border border-[#d7dbe0] bg-white px-2 py-1 text-xs font-medium text-[#667085]">
              {isDirty ? "尚未儲存" : "已儲存"}
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">
            當 IG 用戶的訊息沒有命中其他關鍵字流程時，就會走這個預設回覆。這一頁提供接近主流自動化工具的預設回覆編輯體驗。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setEnabled((value) => !value)}
            className="inline-flex items-center gap-2 rounded-md border border-[#d7dbe0] bg-white px-4 py-2 text-sm font-medium text-[#344054] hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8d9] focus-visible:ring-offset-2"
          >
            {enabled ? <Square className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
            {enabled ? "停止" : "啟用"}
          </button>
          <button
            type="button"
            disabled={saving || !isDirty}
            onClick={save}
            className="inline-flex items-center gap-2 rounded-md bg-[#0057d9] px-4 py-2 text-sm font-medium text-white hover:bg-[#0047b3] disabled:cursor-not-allowed disabled:bg-[#b8c2cc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8d9] focus-visible:ring-offset-2"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {saving ? "儲存中…" : "儲存"}
          </button>
        </div>
      </div>

      {notice ? (
        <p
          className={`rounded-md border px-3 py-2 text-sm ${
            noticeTone === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
          aria-live="polite"
        >
          {notice}
        </p>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="rounded-lg border border-[#d7dbe0] bg-white p-5 shadow-sm">
          <div className="rounded-lg border border-[#d7dbe0] bg-[#f8fafc] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#e6f8fb] text-[#087f95]">
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-medium text-[#111827]">觸發條件</p>
                <p className="text-sm text-[#667085]">Instagram 訊息沒有命中其他自動化</p>
              </div>
            </div>
          </div>

          <div className="mx-8 h-8 w-px bg-[#d7dbe0]" />

          <div className="rounded-lg border border-[#a5e4ef] bg-[#f0fbfd] p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-[#087f95] shadow-sm">
                <Send className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-medium text-[#111827]">傳送訊息</p>
                <p className="text-sm text-[#667085]">預設回覆內容</p>
              </div>
            </div>
            <label htmlFor="instagram-default-reply-message" className="sr-only">
              預設回覆內容
            </label>
            <textarea
              id="instagram-default-reply-message"
              name="instagram-default-reply-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={8}
              className="w-full rounded-md border border-[#d7dbe0] bg-white px-3 py-2 text-sm leading-6 text-[#111827] placeholder:text-[#667085] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8d9] focus-visible:ring-offset-2"
            />
            <p className="mt-2 text-xs leading-5 text-[#667085]">
              建議保持簡短，並引導用戶回覆一個明確選項。太長的自動回覆通常會讓轉換率悄悄睡著。
            </p>
          </div>

          <div className="mt-5 rounded-lg border border-[#d7dbe0] bg-[#f8fafc] p-4">
            <div className="flex items-center gap-3">
              <Bot className="h-5 w-5 text-[#667085]" aria-hidden="true" />
              <div>
                <p className="font-medium text-[#111827]">下一步</p>
                <p className="text-sm text-[#667085]">之後可以接 AI FAQ、加標籤、或轉人工處理。</p>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-[#d7dbe0] bg-white p-3 shadow-sm">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                aria-pressed={activeTab === "preview"}
                className={`rounded-md px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8d9] focus-visible:ring-offset-2 ${
                  activeTab === "preview" ? "bg-[#0057d9] text-white" : "bg-[#f8fafc] text-[#667085] hover:bg-[#eef4f8]"
                }`}
              >
                預覽
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("test")}
                aria-pressed={activeTab === "test"}
                className={`rounded-md px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8d9] focus-visible:ring-offset-2 ${
                  activeTab === "test" ? "bg-[#0057d9] text-white" : "bg-[#f8fafc] text-[#667085] hover:bg-[#eef4f8]"
                }`}
              >
                測試
              </button>
            </div>
          </div>

          {activeTab === "preview" ? (
            <div className="rounded-lg border border-[#d7dbe0] bg-white p-4 shadow-sm">
              <div className="mb-4 text-center">
                <p className="text-sm font-medium text-[#111827]">{instagramAccountName || "你的 IG 帳號"}</p>
                <p className="text-xs text-[#667085]">商業聊天</p>
              </div>
              <div className="space-y-3 rounded-lg border border-[#d7dbe0] bg-[#f8fafc] p-3">
                <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-[#0057d9] px-3 py-2 text-sm text-white">
                  想了解課程
                </div>
                <div className="max-w-[88%] rounded-2xl rounded-bl-md border border-[#d7dbe0] bg-white px-3 py-2 text-sm leading-6 text-[#111827]">
                  {message}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-[#d7dbe0] bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-[#111827]">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                測試預設回覆
              </div>
              <ol className="mt-4 space-y-3 text-sm text-[#344054]">
                <li className="rounded-md border border-[#d7dbe0] bg-[#f8fafc] p-3">
                  1. 用測試 IG 帳號私訊 {instagramAccountName || "你的 IG 帳號"}。
                </li>
                <li className="rounded-md border border-[#d7dbe0] bg-[#f8fafc] p-3">
                  2. 傳送測試碼：<span className="font-semibold text-[#087f95]">{testCode}</span>
                </li>
                <li className="rounded-md border border-[#d7dbe0] bg-[#f8fafc] p-3">
                  3. 回收件匣檢查對話與自動回覆是否成立。
                </li>
              </ol>
              <p className="mt-4 text-xs leading-5 text-[#667085]">
                目前這裡先提供本機測試流程。若要做到 QR code 即時測試，需要接上 Meta / Instagram 實際 API。
              </p>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}
