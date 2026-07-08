"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Tag = { id: string; name: string };
type Channel = { id: string; name: string };
type Segment = {
  id: string;
  name: string;
  description?: string | null;
  filterJson: {
    q?: string | null;
    tagId?: string | null;
    consentStatus?: "opted_in" | "opted_out" | "unknown" | null;
    channelId?: string | null;
    lastInboundWithinDays?: number | null;
  };
  contactCount?: number;
};

type Draft = {
  id?: string;
  name: string;
  description: string;
  q: string;
  tagId: string;
  consentStatus: string;
  channelId: string;
  lastInboundWithinDays: string;
};

const emptyDraft: Draft = {
  name: "高互動名單",
  description: "最近互動且同意接收廣播的聯絡人",
  q: "",
  tagId: "",
  consentStatus: "opted_in",
  channelId: "",
  lastInboundWithinDays: "30",
};

function toDraft(segment: Segment): Draft {
  return {
    id: segment.id,
    name: segment.name,
    description: segment.description || "",
    q: segment.filterJson.q || "",
    tagId: segment.filterJson.tagId || "",
    consentStatus: segment.filterJson.consentStatus || "",
    channelId: segment.filterJson.channelId || "",
    lastInboundWithinDays: segment.filterJson.lastInboundWithinDays
      ? String(segment.filterJson.lastInboundWithinDays)
      : "",
  };
}

function toPayload(draft: Draft) {
  return {
    name: draft.name.trim(),
    description: draft.description.trim() || null,
    filterJson: {
      q: draft.q.trim() || null,
      tagId: draft.tagId || null,
      consentStatus: draft.consentStatus || null,
      channelId: draft.channelId || null,
      lastInboundWithinDays: draft.lastInboundWithinDays ? Number(draft.lastInboundWithinDays) : null,
    },
  };
}

export function SegmentsClient({
  initialSegments,
  tags,
  channels,
}: {
  initialSegments: Segment[];
  tags: Tag[];
  channels: Channel[];
}) {
  const [segments, setSegments] = useState(initialSegments);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [error, setError] = useState("");
  const [pendingDeleteSegment, setPendingDeleteSegment] = useState<Segment | null>(null);
  const [deleting, setDeleting] = useState(false);
  const isEditing = Boolean(draft.id);
  const canSave = Boolean(draft.name.trim());

  const totalContacts = useMemo(
    () => segments.reduce((sum, segment) => sum + (segment.contactCount || 0), 0),
    [segments],
  );

  async function reload() {
    const response = await fetch("/api/segments");
    if (response.ok) {
      setSegments(await response.json());
      return;
    }
    setError("重新載入分群失敗，請稍後再試。");
  }

  async function save() {
    setError("");
    const payload = toPayload(draft);
    if (!payload.name) {
      setError("請輸入分群名稱。");
      return;
    }

    const response = await fetch(draft.id ? `/api/segments/${draft.id}` : "/api/segments", {
      method: draft.id ? "PUT" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error || "儲存分群失敗。");
      return;
    }

    setDraft(emptyDraft);
    await reload();
  }

  function requestRemove(segment: Segment) {
    setError("");
    setPendingDeleteSegment(segment);
  }

  async function confirmRemove() {
    if (!pendingDeleteSegment) return;

    setError("");
    setDeleting(true);
    try {
      const response = await fetch(`/api/segments/${pendingDeleteSegment.id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(typeof data.error === "string" ? data.error : "刪除分群失敗，請稍後再試。");
      }
      if (draft.id === pendingDeleteSegment.id) setDraft(emptyDraft);
      setPendingDeleteSegment(null);
      await reload();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "刪除分群失敗，請稍後再試。");
    } finally {
      setDeleting(false);
    }
  }

  function focusSegmentEditor() {
    document.getElementById("segments-editor-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
    const nameInput = document.querySelector<HTMLInputElement>('input[name="segment-name"]');
    nameInput?.focus();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-[#111827]">受眾分群</h2>
          <p className="mt-1 text-sm leading-6 text-[#667085]">
            用標籤、同意狀態、IG 帳號與最近互動時間建立可重複使用的受眾。
          </p>
        </div>
        <div className="rounded-md border border-[#d7dbe0] bg-white px-4 py-3 text-sm font-medium text-[#344054] shadow-sm">
          分群數：{segments.length}，目前命中：{totalContacts}
        </div>
      </div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-3">
          {segments.map((segment) => (
            <article key={segment.id} className="rounded-lg border border-[#d7dbe0] bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-[#111827]">{segment.name}</p>
                  <p className="mt-1 text-sm leading-6 text-[#667085]">{segment.description || "沒有描述"}</p>
                  <p className="mt-2 text-sm font-medium text-[#087f95]">命中聯絡人：{segment.contactCount || 0}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDraft(toDraft(segment))}
                    className="rounded-md border border-[#d7dbe0] bg-white px-3 py-2 text-sm font-medium text-[#344054] hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8d9] focus-visible:ring-offset-2"
                  >
                    編輯
                  </button>
                  <button
                    type="button"
                    onClick={() => requestRemove(segment)}
                    className="rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-medium text-[#b42318] hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2"
                  >
                    刪除
                  </button>
                </div>
              </div>
            </article>
          ))}
          {segments.length === 0 ? (
            <div
              data-testid="segments-empty-state"
              className="rounded-lg border border-dashed border-[#d7dbe0] bg-[#f8fafc] p-6 text-sm leading-6 text-[#667085]"
            >
              <p className="text-base font-semibold text-[#111827]">尚未建立分群。</p>
              <p className="mt-2">
                可以先從聯絡人常用條件開始，例如已訂閱、最近互動或指定標籤；建立後，之後的廣播與分析就能直接重用這組受眾。
              </p>
              {channels.length === 0 ? (
                <p className="mt-2 text-xs text-[#98a2b3]">
                  目前還沒有已連接的 Instagram 帳號；若你想用帳號維度做分群，先到設定完成連線。
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={focusSegmentEditor}
                  data-testid="segments-empty-create-cta"
                  className="inline-flex h-9 items-center justify-center rounded-md bg-[#0057d9] px-3 text-sm font-medium text-white hover:bg-[#0047b3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8d9] focus-visible:ring-offset-2"
                >
                  建立第一個分群
                </button>
                <Link
                  href="/contacts"
                  data-testid="segments-empty-open-contacts"
                  className="inline-flex h-9 items-center justify-center rounded-md border border-[#d7dbe0] bg-white px-3 text-sm font-medium text-[#344054] hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8d9] focus-visible:ring-offset-2"
                >
                  前往聯絡人
                </Link>
                {channels.length === 0 ? (
                  <Link
                    href="/channels/connect"
                    data-testid="segments-empty-connect-instagram"
                    className="inline-flex h-9 items-center justify-center rounded-md border border-[#d7dbe0] bg-white px-3 text-sm font-medium text-[#344054] hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8d9] focus-visible:ring-offset-2"
                  >
                    前往設定連接 IG
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <aside id="segments-editor-card" className="rounded-lg border border-[#d7dbe0] bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-medium text-[#111827]">{isEditing ? "編輯分群" : "新增分群"}</h3>
            {isEditing ? (
              <button
                type="button"
                onClick={() => setDraft(emptyDraft)}
                className="text-sm font-medium text-[#087f95] hover:text-[#0b4a6f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8d9] focus-visible:ring-offset-2"
              >
                取消
              </button>
            ) : null}
          </div>

          <div className="space-y-4">
            <label className="block text-sm">
              <span className="mb-1 block text-[#667085]">分群名稱</span>
              <input
                name="segment-name"
                autoComplete="off"
                value={draft.name}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                className="w-full rounded-md border border-[#d7dbe0] bg-white px-3 py-2 text-[#111827] placeholder:text-[#667085] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8d9] focus-visible:ring-offset-2"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-[#667085]">描述</span>
              <textarea
                name="segment-description"
                value={draft.description}
                onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                className="w-full rounded-md border border-[#d7dbe0] bg-white px-3 py-2 text-[#111827] placeholder:text-[#667085] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8d9] focus-visible:ring-offset-2"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-[#667085]">搜尋字</span>
              <input
                name="segment-search"
                autoComplete="off"
                value={draft.q}
                onChange={(event) => setDraft({ ...draft, q: event.target.value })}
                className="w-full rounded-md border border-[#d7dbe0] bg-white px-3 py-2 text-[#111827] placeholder:text-[#667085] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8d9] focus-visible:ring-offset-2"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-[#667085]">標籤</span>
              <select
                name="segment-tag"
                value={draft.tagId}
                onChange={(event) => setDraft({ ...draft, tagId: event.target.value })}
                className="w-full rounded-md border border-[#d7dbe0] bg-white px-3 py-2 text-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8d9] focus-visible:ring-offset-2"
              >
                <option value="">不限標籤</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>{tag.name}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-[#667085]">同意狀態</span>
              <select
                name="segment-consent-status"
                value={draft.consentStatus}
                onChange={(event) => setDraft({ ...draft, consentStatus: event.target.value })}
                className="w-full rounded-md border border-[#d7dbe0] bg-white px-3 py-2 text-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8d9] focus-visible:ring-offset-2"
              >
                <option value="">不限</option>
                <option value="opted_in">已同意</option>
                <option value="opted_out">已退訂</option>
                <option value="unknown">未知</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-[#667085]">IG 帳號</span>
              <select
                name="segment-channel"
                value={draft.channelId}
                onChange={(event) => setDraft({ ...draft, channelId: event.target.value })}
                className="w-full rounded-md border border-[#d7dbe0] bg-white px-3 py-2 text-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8d9] focus-visible:ring-offset-2"
              >
                <option value="">不限 IG 帳號</option>
                {channels.map((channel) => (
                  <option key={channel.id} value={channel.id}>{channel.name}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-[#667085]">最近互動天數</span>
              <input
                type="number"
                name="segment-last-inbound-days"
                inputMode="numeric"
                min="1"
                max="365"
                value={draft.lastInboundWithinDays}
                onChange={(event) => setDraft({ ...draft, lastInboundWithinDays: event.target.value })}
                className="w-full rounded-md border border-[#d7dbe0] bg-white px-3 py-2 text-[#111827] placeholder:text-[#667085] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8d9] focus-visible:ring-offset-2"
              />
            </label>
            <button
              type="button"
              onClick={save}
              disabled={!canSave}
              title={canSave ? undefined : "請先輸入分群名稱。"}
              aria-describedby={canSave ? undefined : "segment-save-disabled-reason"}
              data-testid="segments-save-button"
              className="w-full rounded-md bg-[#0057d9] px-4 py-2 text-sm font-medium text-white hover:bg-[#0047b3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8d9] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#98a2b3] disabled:hover:bg-[#98a2b3]"
            >
              {isEditing ? "更新分群" : "建立分群"}
            </button>
            {!canSave ? (
              <p id="segment-save-disabled-reason" className="text-xs leading-5 text-[#667085]">
                請先輸入分群名稱，才能儲存這組篩選條件。
              </p>
            ) : null}
          </div>
        </aside>
      </section>
      {pendingDeleteSegment ? (
        <SegmentDeleteDialog
          segment={pendingDeleteSegment}
          deleting={deleting}
          onCancel={() => setPendingDeleteSegment(null)}
          onConfirm={confirmRemove}
        />
      ) : null}
    </div>
  );
}

function SegmentDeleteDialog({
  segment,
  deleting,
  onCancel,
  onConfirm,
}: {
  segment: Segment;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="segment-delete-title"
        data-testid="segments-delete-dialog"
        className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto overscroll-contain rounded-lg border border-[#d7dbe0] bg-white shadow-xl"
      >
        <div className="border-b border-[#d7dbe0] px-5 py-4">
          <p id="segment-delete-title" className="text-lg font-semibold text-[#111827]">
            刪除分眾名單？
          </p>
          <p className="mt-2 text-sm leading-6 text-[#667085]">
            你即將刪除「{segment.name}」。這不會刪除聯絡人，但已使用這個分眾的廣播或分析條件可能需要重新選擇受眾。
          </p>
        </div>
        <div className="bg-[#fff8f6] px-5 py-3 text-sm leading-6 text-[#b42318]">
          刪除前請確認沒有正在排程或準備中的廣播依賴這個分眾。
        </div>
        <div className="flex flex-col-reverse gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-md border border-[#d7dbe0] bg-white px-4 py-2 text-sm font-medium text-[#344054] hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8d9] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            data-testid="segments-confirm-delete"
            className="rounded-md bg-[#b42318] px-4 py-2 text-sm font-semibold text-white hover:bg-[#912018] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#fecdca] disabled:text-[#912018]"
          >
            {deleting ? "刪除中…" : "確認刪除"}
          </button>
        </div>
      </div>
    </div>
  );
}
