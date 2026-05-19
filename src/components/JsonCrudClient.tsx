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
      if (!response.ok) throw new Error((await response.json()).error || "建立失敗");
      setDraft(JSON.stringify(createTemplate, null, 2));
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "建立失敗");
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
      if (!response.ok) throw new Error((await response.json()).error || "更新失敗");
      setEditingId("");
      setEditingJson("");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新失敗");
    }
  }

  async function deleteItem(id: string) {
    if (!confirm("確定刪除？")) return;
    await fetch(`${endpoint}/${id}`, { method: "DELETE" });
    await reload();
  }

  async function queue(id: string) {
    const response = await fetch(`${endpoint}/${id}/queue`, { method: "POST" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      alert(data.error || "Queue failed");
      return;
    }
    alert(`已排入 ${data.queued} 位合規收件人`);
    await reload();
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="text-sm text-zinc-400">{description}</p>
      </div>
      {error ? <p className="rounded-md bg-red-950 px-3 py-2 text-sm text-red-200">{error}</p> : null}
      <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <h3 className="mb-2 font-medium">新增</h3>
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className="h-48 w-full rounded-md border border-zinc-700 bg-zinc-950 p-3 font-mono text-sm"
        />
        <button onClick={createItem} className="mt-3 rounded-md bg-cyan-500 px-4 py-2 text-zinc-950">
          建立
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
                    <button onClick={() => queue(id)} className="rounded-md border border-cyan-700 px-3 py-2 text-sm">
                      Queue
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
    </div>
  );
}
