"use client";

import { CalendarClock, Eye, Megaphone, Send, Trash2, Users } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

type BroadcastItem = {
  id: string;
  name: string;
  status: "draft" | "queued" | "sending" | "sent" | "failed";
  targetConfigJson: unknown;
  messageJson: unknown;
  scheduledAt?: string | null;
  sentCount: number;
  failedCount: number;
  updatedAt: string;
};

type Option = {
  id: string;
  name: string;
};

type Preview = {
  totalCandidates: number;
  recipientCount: number;
  skippedCount: number;
  recipients: Array<{ id: string; displayName: string; consentStatus: string }>;
};

type FormState = {
  name: string;
  audienceType: "segment" | "tag";
  audienceId: string;
  message: string;
  scheduledAt: string;
};

function asRecord(value: unknown) {
  return (value || {}) as Record<string, unknown>;
}

function getMessageText(value: unknown) {
  return String(asRecord(value).text || "");
}

function getTargetLabel(value: unknown, tags: Option[], segments: Option[]) {
  const target = asRecord(value);
  const segmentId = String(target.segmentId || "");
  const tagId = String(target.tagId || "");
  if (segmentId) return segments.find((segment) => segment.id === segmentId)?.name || "分眾";
  if (tagId) return tags.find((tag) => tag.id === tagId)?.name || "標籤";
  return "未設定";
}

function statusLabel(status: BroadcastItem["status"]) {
  return {
    draft: "草稿",
    queued: "已排程",
    sending: "發送中",
    sent: "已完成",
    failed: "失敗",
  }[status];
}

function formatDate(value?: string | null) {
  if (!value) return "立即發送";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "立即發送";
  return new Intl.DateTimeFormat("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function toPayload(form: FormState) {
  return {
    name: form.name.trim(),
    targetConfigJson:
      form.audienceType === "segment"
        ? { segmentId: form.audienceId }
        : { tagId: form.audienceId },
    messageJson: { text: form.message.trim() },
    scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : null,
  };
}

export function BroadcastsClient({
  initialBroadcasts,
  tags,
  segments,
}: {
  initialBroadcasts: BroadcastItem[];
  tags: Option[];
  segments: Option[];
}) {
  const defaultAudienceType = segments.length > 0 ? "segment" : "tag";
  const defaultAudienceId = segments[0]?.id || tags[0]?.id || "";
  const [broadcasts, setBroadcasts] = useState(initialBroadcasts);
  const [form, setForm] = useState<FormState>({
    name: "",
    audienceType: defaultAudienceType,
    audienceId: defaultAudienceId,
    message: "",
    scheduledAt: "",
  });
  const [preview, setPreview] = useState<Record<string, Preview>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const audienceOptions = form.audienceType === "segment" ? segments : tags;
  const canSubmit = form.name.trim() && form.audienceId && form.message.trim();

  const totals = useMemo(
    () => ({
      draft: broadcasts.filter((item) => item.status === "draft").length,
      queued: broadcasts.filter((item) => item.status === "queued" || item.status === "sending").length,
      sent: broadcasts.reduce((sum, item) => sum + item.sentCount, 0),
    }),
    [broadcasts],
  );

  async function createBroadcast() {
    if (!canSubmit) return;
    setFeedback(null);
    const response = await fetch("/api/broadcasts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toPayload(form)),
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      setFeedback(body?.error || "建立廣播活動失敗。");
      return;
    }
    setBroadcasts((items) => [body, ...items]);
    setForm({ name: "", audienceType: defaultAudienceType, audienceId: defaultAudienceId, message: "", scheduledAt: "" });
    setFeedback("已建立草稿。先預覽受眾，確認後即可排程。");
  }

  async function loadPreview(id: string) {
    setBusyId(id);
    setFeedback(null);
    const response = await fetch(`/api/broadcasts/${id}/preview`);
    const body = await response.json().catch(() => null);
    setBusyId(null);
    if (!response.ok) {
      setFeedback(body?.error || "讀取預覽失敗。");
      return;
    }
    setPreview((items) => ({ ...items, [id]: body }));
  }

  async function queueBroadcast(id: string) {
    setBusyId(id);
    setFeedback(null);
    const response = await fetch(`/api/broadcasts/${id}/queue`, { method: "POST" });
    const body = await response.json().catch(() => null);
    setBusyId(null);
    if (!response.ok) {
      setFeedback(body?.error || "排程發送失敗。");
      return;
    }
    setBroadcasts((items) => items.map((item) => (item.id === id ? { ...item, status: "queued" } : item)));
    setFeedback(`已建立 ${body?.queued ?? 0} 個發送任務。`);
  }

  async function deleteBroadcast(id: string) {
    setBusyId(id);
    setFeedback(null);
    const response = await fetch(`/api/broadcasts/${id}`, { method: "DELETE" });
    const body = await response.json().catch(() => null);
    setBusyId(null);
    if (!response.ok) {
      setFeedback(body?.error || "刪除廣播活動失敗。");
      return;
    }
    setBroadcasts((items) => items.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-3 md:grid-cols-3">
        <Metric icon={<Megaphone className="h-5 w-5" />} label="草稿" value={totals.draft} />
        <Metric icon={<CalendarClock className="h-5 w-5" />} label="排程中" value={totals.queued} />
        <Metric icon={<Users className="h-5 w-5" />} label="已送達事件" value={totals.sent} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <div className="ip-dashboard-card p-5">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">新增廣播活動</h2>
            <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">選擇標籤或分眾，撰寫訊息，先建立草稿再預覽發送名單。</p>
          </div>
          <div className="mt-5 space-y-4">
            <Field label="活動名稱">
              <input className="ip-input w-full" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="例如：五月回購提醒" />
            </Field>
            <Field label="受眾">
              <div className="grid grid-cols-2 gap-2">
                {(["segment", "tag"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      const options = type === "segment" ? segments : tags;
                      setForm((current) => ({ ...current, audienceType: type, audienceId: options[0]?.id || "" }));
                    }}
                    className={`rounded-md border px-3 py-2 text-sm font-medium ${
                      form.audienceType === type
                        ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--teal-dark)]"
                        : "border-[var(--border)] bg-white text-[var(--text-secondary)]"
                    }`}
                  >
                    {type === "segment" ? "分眾" : "標籤"}
                  </button>
                ))}
              </div>
              <select className="ip-input mt-2 w-full" value={form.audienceId} onChange={(event) => setForm((current) => ({ ...current, audienceId: event.target.value }))}>
                {audienceOptions.length === 0 ? <option value="">尚無可用受眾</option> : null}
                {audienceOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="訊息內容">
              <textarea className="ip-input min-h-32 w-full resize-y" value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} placeholder="輸入要發送的私訊內容" maxLength={2000} />
              <p className="mt-1 text-xs text-[var(--text-muted)]">{form.message.length}/2000</p>
            </Field>
            <Field label="排程時間">
              <input className="ip-input w-full" type="datetime-local" value={form.scheduledAt} onChange={(event) => setForm((current) => ({ ...current, scheduledAt: event.target.value }))} />
            </Field>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={createBroadcast}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[#063a3d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Megaphone className="h-4 w-4" />
              建立草稿
            </button>
            {feedback ? <p className="rounded-md border border-[var(--border-soft)] bg-[var(--ip-surface-muted)] px-3 py-2 text-sm text-[var(--text-secondary)]">{feedback}</p> : null}
          </div>
        </div>

        <div className="ip-dashboard-card overflow-hidden">
          <div className="border-b border-[var(--border-soft)] px-5 py-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">活動列表</h2>
          </div>
          <div className="divide-y divide-[var(--border-soft)]">
            {broadcasts.map((item) => {
              const itemPreview = preview[item.id];
              return (
                <article key={item.id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-[var(--text-primary)]">{item.name}</h3>
                        <span className="rounded-full bg-[var(--ip-surface-muted)] px-2 py-0.5 text-xs font-medium text-[var(--text-secondary)]">{statusLabel(item.status)}</span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--text-secondary)]">{getMessageText(item.messageJson)}</p>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--text-muted)]">
                        <span>受眾：{getTargetLabel(item.targetConfigJson, tags, segments)}</span>
                        <span>時間：{formatDate(item.scheduledAt)}</span>
                        <span>成功 {item.sentCount} / 失敗 {item.failedCount}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <IconButton label="預覽" disabled={busyId === item.id} onClick={() => loadPreview(item.id)} icon={<Eye className="h-4 w-4" />} />
                      <IconButton label="排程" disabled={busyId === item.id || item.status === "sent"} onClick={() => queueBroadcast(item.id)} icon={<Send className="h-4 w-4" />} primary />
                      <IconButton label="刪除" disabled={busyId === item.id || item.status === "sending"} onClick={() => deleteBroadcast(item.id)} icon={<Trash2 className="h-4 w-4" />} danger />
                    </div>
                  </div>
                  {itemPreview ? (
                    <div className="mt-4 grid gap-3 rounded-md border border-[var(--border-soft)] bg-[var(--ip-surface-muted)] p-4 text-sm sm:grid-cols-3">
                      <PreviewStat label="候選人數" value={itemPreview.totalCandidates} />
                      <PreviewStat label="可發送" value={itemPreview.recipientCount} />
                      <PreviewStat label="略過" value={itemPreview.skippedCount} />
                    </div>
                  ) : null}
                </article>
              );
            })}
            {broadcasts.length === 0 ? (
              <div className="p-8 text-center text-sm text-[var(--text-muted)]">尚未建立廣播活動。先從左側建立一個草稿。</div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="ip-dashboard-card flex items-center gap-4 p-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--primary-soft)] text-[var(--teal-dark)]">{icon}</span>
      <div>
        <p className="text-sm text-[var(--text-secondary)]">{label}</p>
        <p className="text-2xl font-semibold text-[var(--text-primary)]">{value}</p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-[var(--text-primary)]">{label}</span>
      {children}
    </label>
  );
}

function IconButton({
  label,
  icon,
  onClick,
  disabled,
  primary,
  danger,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  danger?: boolean;
}) {
  const className = primary
    ? "bg-[var(--primary)] text-[#063a3d] border-[var(--primary)]"
    : danger
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-[var(--border)] bg-white text-[var(--text-secondary)]";
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={label}
      className={`inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {icon}
      {label}
    </button>
  );
}

function PreviewStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{value}</p>
    </div>
  );
}
