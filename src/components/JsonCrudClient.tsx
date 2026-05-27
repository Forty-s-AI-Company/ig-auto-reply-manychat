"use client";

import { useState } from "react";

type JsonCrudClientProps = {
  title: string;
  description: string;
  endpoint: string;
  initialItems: Record<string, unknown>[];
  createTemplate: Record<string, unknown>;
  updateMethod?: "PATCH" | "PUT";
  queueBroadcast?: boolean;
};

type BroadcastPreviewRecipient = {
  id: string;
  displayName: string | null;
  externalId: string;
  consentStatus: string;
  channel: {
    id: string;
    type: string;
    name: string;
  };
};

type BroadcastPreview = {
  broadcast?: {
    id: string;
    name: string;
    status: string;
    scheduledAt: string | null;
    messageText: string;
  };
  target?: {
    tagId: string | null;
    segmentId: string | null;
  };
  totalCandidates?: number;
  recipientCount?: number;
  skippedCount?: number;
  recipients?: BroadcastPreviewRecipient[];
};

function isBroadcastPreview(value: unknown): value is BroadcastPreview {
  return Boolean(value && typeof value === "object");
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

export function JsonCrudClient({
  title,
  description,
  endpoint,
  initialItems,
  createTemplate,
  updateMethod = "PATCH",
  queueBroadcast = false,
}: JsonCrudClientProps) {
  const [items, setItems] = useState(initialItems);
  const [draft, setDraft] = useState(JSON.stringify(createTemplate, null, 2));
  const [editingId, setEditingId] = useState("");
  const [editingJson, setEditingJson] = useState("");
  const [preview, setPreview] = useState<BroadcastPreview | null>(null);
  const [error, setError] = useState("");

  async function reload() {
    const response = await fetch(endpoint);
    if (response.ok) setItems(await response.json());
  }

  async function createItem() {
    setError("");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: draft,
      });
      if (!response.ok) throw new Error((await response.json()).error || "新增失敗。");
      setDraft(JSON.stringify(createTemplate, null, 2));
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "新增失敗。");
    }
  }

  async function updateItem() {
    if (!editingId) return;
    setError("");
    try {
      const response = await fetch(`${endpoint}/${editingId}`, {
        method: updateMethod,
        headers: { "content-type": "application/json" },
        body: editingJson,
      });
      if (!response.ok) throw new Error((await response.json()).error || "更新失敗。");
      setEditingId("");
      setEditingJson("");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新失敗。");
    }
  }

  async function deleteItem(id: string) {
    if (!confirm("確定要刪除這筆資料嗎？")) return;
    await fetch(`${endpoint}/${id}`, { method: "DELETE" });
    await reload();
  }

  async function queue(id: string) {
    const response = await fetch(`${endpoint}/${id}/queue`, { method: "POST" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      alert(data.error || "加入佇列失敗。");
      return;
    }
    alert(`已加入 ${data.queued} 位收件人到佇列。`);
    await reload();
  }

  async function previewItem(id: string) {
    const response = await fetch(`${endpoint}/${id}/preview`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      alert(data.error || "讀取預覽失敗。");
      return;
    }
    setPreview(isBroadcastPreview(data) ? data : null);
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="text-sm text-zinc-400">{description}</p>
      </div>

      {error ? <p className="rounded-md bg-red-950 px-3 py-2 text-sm text-red-200">{error}</p> : null}

      <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <h3 className="mb-2 font-medium">新增資料</h3>
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className="h-48 w-full rounded-md border border-zinc-700 bg-zinc-950 p-3 font-mono text-sm"
        />
        <button onClick={createItem} className="mt-3 rounded-md bg-cyan-500 px-4 py-2 text-zinc-950">
          新增
        </button>
      </section>

      <section className="space-y-3">
        {items.map((item) => {
          const id = String(item.id);
          return (
            <div key={id} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{String(item.name || item.title || id)}</p>
                  <p className="text-xs text-zinc-500">{id}</p>
                </div>
                <div className="flex gap-2">
                  {queueBroadcast ? (
                    <button onClick={() => previewItem(id)} className="rounded-md border border-zinc-700 px-3 py-2 text-sm">
                      預覽
                    </button>
                  ) : null}
                  {queueBroadcast ? (
                    <button onClick={() => queue(id)} className="rounded-md border border-cyan-700 px-3 py-2 text-sm">
                      加入佇列
                    </button>
                  ) : null}
                  <button
                    onClick={() => {
                      setEditingId(id);
                      setEditingJson(JSON.stringify(item, null, 2));
                    }}
                    className="rounded-md border border-zinc-700 px-3 py-2 text-sm"
                  >
                    編輯
                  </button>
                  <button onClick={() => deleteItem(id)} className="rounded-md border border-red-900 px-3 py-2 text-sm text-red-200">
                    刪除
                  </button>
                </div>
              </div>
              <pre className="max-h-64 overflow-auto rounded-md bg-zinc-950 p-3 text-xs text-zinc-300">
                {JSON.stringify(item, null, 2)}
              </pre>
            </div>
          );
        })}
      </section>

      {editingId ? (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-3xl rounded-lg border border-zinc-800 bg-zinc-950 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-medium">編輯 {editingId}</h3>
              <button onClick={() => setEditingId("")} className="text-sm text-zinc-400">
                關閉
              </button>
            </div>
            <textarea
              value={editingJson}
              onChange={(event) => setEditingJson(event.target.value)}
              className="h-[50vh] w-full rounded-md border border-zinc-700 bg-zinc-900 p-3 font-mono text-sm"
            />
            <button onClick={updateItem} className="mt-3 rounded-md bg-cyan-500 px-4 py-2 text-zinc-950">
              儲存
            </button>
          </div>
        </div>
      ) : null}

      {preview ? (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-5xl rounded-lg border border-zinc-800 bg-zinc-950 p-4">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-medium">廣播預覽</h3>
                <p className="mt-1 text-sm text-zinc-400">{preview.broadcast?.name || "未命名廣播"}</p>
              </div>
              <button onClick={() => setPreview(null)} className="text-sm text-zinc-400">
                關閉
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-md border border-zinc-800 bg-zinc-900 p-3">
                <p className="text-xs text-zinc-500">候選聯絡人</p>
                <p className="mt-1 text-2xl font-semibold">{preview.totalCandidates ?? 0}</p>
              </div>
              <div className="rounded-md border border-cyan-900 bg-cyan-950/30 p-3">
                <p className="text-xs text-cyan-300">會收到</p>
                <p className="mt-1 text-2xl font-semibold text-cyan-100">{preview.recipientCount ?? 0}</p>
              </div>
              <div className="rounded-md border border-zinc-800 bg-zinc-900 p-3">
                <p className="text-xs text-zinc-500">略過</p>
                <p className="mt-1 text-2xl font-semibold">{preview.skippedCount ?? 0}</p>
              </div>
            </div>

            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div className="rounded-md bg-zinc-900 p-3">
                <dt className="text-zinc-500">目標</dt>
                <dd className="mt-1 font-mono text-xs text-zinc-200">
                  {preview.target?.segmentId ? `segmentId: ${preview.target.segmentId}` : `tagId: ${formatValue(preview.target?.tagId)}`}
                </dd>
              </div>
              <div className="rounded-md bg-zinc-900 p-3">
                <dt className="text-zinc-500">訊息</dt>
                <dd className="mt-1 text-zinc-200">{formatValue(preview.broadcast?.messageText)}</dd>
              </div>
            </dl>

            <div className="mt-4 max-h-[48vh] overflow-auto rounded-md border border-zinc-800">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="sticky top-0 bg-zinc-900 text-xs text-zinc-400">
                  <tr>
                    <th className="px-3 py-2 font-medium">姓名</th>
                    <th className="px-3 py-2 font-medium">External ID</th>
                    <th className="px-3 py-2 font-medium">渠道</th>
                    <th className="px-3 py-2 font-medium">同意狀態</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {(preview.recipients || []).map((recipient) => (
                    <tr key={recipient.id}>
                      <td className="px-3 py-2">{formatValue(recipient.displayName)}</td>
                      <td className="px-3 py-2 font-mono text-xs text-zinc-400">{recipient.externalId}</td>
                      <td className="px-3 py-2">
                        {recipient.channel.name} <span className="text-xs text-zinc-500">({recipient.channel.type})</span>
                      </td>
                      <td className="px-3 py-2">{recipient.consentStatus}</td>
                    </tr>
                  ))}
                  {preview.recipients?.length ? null : (
                    <tr>
                      <td className="px-3 py-6 text-center text-zinc-500" colSpan={4}>
                        目前沒有符合條件且可發送的收件人。
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
