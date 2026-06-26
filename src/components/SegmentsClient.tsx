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

  const totalContacts = useMemo(
    () => segments.reduce((sum, segment) => sum + (segment.contactCount || 0), 0),
    [segments],
  );

  async function reload() {
    const response = await fetch("/api/segments");
    if (response.ok) setSegments(await response.json());
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
    await fetch(`/api/segments/${id}`, { method: "DELETE" });
    if (draft.id === id) setDraft(emptyDraft);
    await reload();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">受眾分群</h2>
          <p className="mt-1 text-sm text-zinc-400">
            用標籤、同意狀態、IG 帳號與最近互動時間建立可重複使用的受眾。
          </p>
        </div>
        <div className="rounded-md border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-300">
          分群數：{segments.length}，目前命中：{totalContacts}
        </div>
      </div>

      {error ? <p className="rounded-md bg-red-950 px-3 py-2 text-sm text-red-200">{error}</p> : null}

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-3">
          {segments.map((segment) => (
            <article key={segment.id} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{segment.name}</p>
                  <p className="mt-1 text-sm text-zinc-400">{segment.description || "沒有描述"}</p>
                  <p className="mt-2 text-sm text-cyan-200">命中聯絡人：{segment.contactCount || 0}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDraft(toDraft(segment))}
                    className="rounded-md border border-zinc-700 px-3 py-2 text-sm"
                  >
                    編輯
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(segment.id)}
                    className="rounded-md border border-red-900 px-3 py-2 text-sm text-red-200"
                  >
                    刪除
                  </button>
                </div>
              </div>
            </article>
          ))}
          {segments.length === 0 ? (
            <p className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 text-sm text-zinc-500">
              尚未建立分群。
            </p>
          ) : null}
        </div>

        <aside className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-medium">{isEditing ? "編輯分群" : "新增分群"}</h3>
            {isEditing ? (
              <button type="button" onClick={() => setDraft(emptyDraft)} className="text-sm text-zinc-400">
                取消
              </button>
            ) : null}
          </div>

          <div className="space-y-4">
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-400">分群名稱</span>
              <input
                value={draft.name}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-400">描述</span>
              <textarea
                value={draft.description}
                onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-400">搜尋字</span>
              <input
                value={draft.q}
                onChange={(event) => setDraft({ ...draft, q: event.target.value })}
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-400">標籤</span>
              <select
                value={draft.tagId}
                onChange={(event) => setDraft({ ...draft, tagId: event.target.value })}
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
              >
                <option value="">不限標籤</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>{tag.name}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-400">同意狀態</span>
              <select
                value={draft.consentStatus}
                onChange={(event) => setDraft({ ...draft, consentStatus: event.target.value })}
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
              >
                <option value="">不限</option>
                <option value="opted_in">已同意</option>
                <option value="opted_out">已退訂</option>
                <option value="unknown">未知</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-400">IG 帳號</span>
              <select
                value={draft.channelId}
                onChange={(event) => setDraft({ ...draft, channelId: event.target.value })}
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
              >
                <option value="">不限 IG 帳號</option>
                {channels.map((channel) => (
                  <option key={channel.id} value={channel.id}>{channel.name}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-400">最近互動天數</span>
              <input
                type="number"
                min="1"
                max="365"
                value={draft.lastInboundWithinDays}
                onChange={(event) => setDraft({ ...draft, lastInboundWithinDays: event.target.value })}
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
              />
            </label>
            <button
              type="button"
              onClick={save}
              className="w-full rounded-md bg-cyan-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-cyan-400"
            >
              {isEditing ? "更新分群" : "建立分群"}
            </button>
          </div>
        </aside>
      </section>
    </div>
  );
}
