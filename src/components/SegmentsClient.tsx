"use client";

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

  async function remove(id: string) {
    if (!confirm("確定要刪除這個分群？")) return;
    setError("");
    const response = await fetch(`/api/segments/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error || "刪除分群失敗，請稍後再試。");
      return;
    }
    if (draft.id === id) setDraft(emptyDraft);
    await reload();
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
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" aria-live="polite">
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
                    onClick={() => remove(segment.id)}
                    className="rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-medium text-[#b42318] hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2"
                  >
                    刪除
                  </button>
                </div>
              </div>
            </article>
          ))}
          {segments.length === 0 ? (
            <p className="rounded-lg border border-dashed border-[#d7dbe0] bg-[#f8fafc] p-6 text-sm leading-6 text-[#667085]">
              尚未建立分群。右側可以先用標籤、同意狀態或互動天數建立第一個受眾。
            </p>
          ) : null}
        </div>

        <aside className="rounded-lg border border-[#d7dbe0] bg-white p-4 shadow-sm">
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
    </div>
  );
}
