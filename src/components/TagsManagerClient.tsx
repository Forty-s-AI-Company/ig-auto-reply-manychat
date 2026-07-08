"use client";

import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const PRESET_COLORS = ["#2563eb", "#16a34a", "#f97316", "#dc2626", "#7c3aed", "#0891b2"];

type TagRow = {
  id: string;
  name: string;
  color: string;
};

export function TagsManagerClient({ initialTags }: { initialTags: TagRow[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingColor, setEditingColor] = useState(PRESET_COLORS[0]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [isPending, startTransition] = useTransition();

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function createTag(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("請輸入標籤名稱。");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: trimmedName, color }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "建立標籤失敗。");

      setName("");
      setColor(PRESET_COLORS[0]);
      setMessage(`已建立標籤「${data.name || trimmedName}」。`);
      refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "建立標籤失敗。");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(tag: TagRow) {
    setEditingId(tag.id);
    setEditingName(tag.name);
    setEditingColor(tag.color);
    setMessage("");
    setError("");
  }

  async function updateTag(tagId: string) {
    const trimmedName = editingName.trim();
    if (!trimmedName) {
      setError("請輸入標籤名稱。");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch(`/api/tags/${tagId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: trimmedName, color: editingColor }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "更新標籤失敗。");

      setEditingId(null);
      setMessage(`已更新標籤「${data.name || trimmedName}」。`);
      refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "更新標籤失敗。");
    } finally {
      setSaving(false);
    }
  }

  async function deleteTag(tag: TagRow) {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch(`/api/tags/${tag.id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "刪除標籤失敗。");

      setMessage(`已刪除標籤「${tag.name}」。`);
      refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "刪除標籤失敗。");
    } finally {
      setSaving(false);
    }
  }

  const disabled = saving || isPending;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      <section className="ip-dashboard-card p-5">
        <div>
          <p className="text-sm font-medium text-[var(--text-secondary)]">建立標籤</p>
          <h2 className="mt-1 text-xl font-semibold text-[var(--text-primary)]">整理聯絡人與收件匣</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            標籤會同步用在收件匣、聯絡人篩選與自動化分眾。建議用清楚短名稱，例如重要客戶、待追蹤、已購買。
          </p>
        </div>

        <form onSubmit={createTag} className="mt-5 space-y-4">
          <label className="block text-sm font-medium text-[var(--text-secondary)]">
            標籤名稱
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={40}
              placeholder="例如：VIP 客戶"
              className="mt-1 h-10 w-full rounded-md border border-[var(--border-soft)] bg-white px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#d9f4f5]"
            />
          </label>

          <ColorPicker value={color} onChange={setColor} />

          <button
            type="submit"
            disabled={disabled}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[#063a3d] hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {disabled ? "處理中…" : "建立標籤"}
          </button>
        </form>
      </section>

      <section className="ip-dashboard-card overflow-hidden">
        <div className="border-b border-[var(--border-soft)] px-5 py-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">目前標籤</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">編輯名稱與顏色，讓客服與自動化流程更容易辨識聯絡人狀態。</p>
          {message ? <p className="mt-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p> : null}
          {error ? <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        </div>

        <div className="divide-y divide-[var(--border-soft)]">
          {initialTags.map((tag) => {
            const isEditing = editingId === tag.id;
            return (
              <article key={tag.id} className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                {isEditing ? (
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                    <label className="block text-sm font-medium text-[var(--text-secondary)]">
                      標籤名稱
                      <input
                        value={editingName}
                        onChange={(event) => setEditingName(event.target.value)}
                        maxLength={40}
                        className="mt-1 h-10 w-full rounded-md border border-[var(--border-soft)] bg-white px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[#d9f4f5]"
                      />
                    </label>
                    <ColorPicker value={editingColor} onChange={setEditingColor} compact />
                  </div>
                ) : (
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: tag.color }} />
                      <p className="truncate font-semibold text-[var(--text-primary)]">{tag.name}</p>
                    </div>
                    <p className="mt-1 font-mono text-xs text-[var(--text-muted)]">{tag.color}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 md:justify-end">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => updateTag(tag.id)}
                        disabled={disabled}
                        className="inline-flex h-9 items-center gap-2 rounded-md bg-[var(--primary)] px-3 text-sm font-semibold text-[#063a3d] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Check className="h-4 w-4" aria-hidden="true" />
                        儲存
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        disabled={disabled}
                        className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--border-soft)] bg-white px-3 text-sm text-[var(--text-secondary)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                        取消
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => startEdit(tag)}
                        className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--border-soft)] bg-white px-3 text-sm text-[var(--text-secondary)] hover:bg-[var(--ip-surface-muted)]"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                        編輯
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTag(tag)}
                        disabled={disabled}
                        className="inline-flex h-9 items-center gap-2 rounded-md border border-red-200 bg-white px-3 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        刪除
                      </button>
                    </>
                  )}
                </div>
              </article>
            );
          })}

          {initialTags.length === 0 ? (
            <div className="px-5 py-10 text-sm leading-6 text-[var(--text-secondary)]">
              <p className="font-semibold text-[var(--text-primary)]">尚未建立標籤。</p>
              <p className="mt-1">先建立第一個標籤，之後就能在收件匣與聯絡人頁快速套用。</p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function ColorPicker({
  value,
  onChange,
  compact = false,
}: {
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text-secondary)]" htmlFor={compact ? "tag-edit-color" : "tag-create-color"}>
        顏色
      </label>
      <div className="mt-2 flex items-center gap-2">
        <input
          id={compact ? "tag-edit-color" : "tag-create-color"}
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-12 cursor-pointer rounded-md border border-[var(--border-soft)] bg-white p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
          aria-label="選擇標籤顏色"
        />
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onChange(preset)}
              aria-label={`使用顏色 ${preset}`}
              className="h-7 w-7 rounded-full border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
              style={{
                backgroundColor: preset,
                borderColor: value === preset ? "#111827" : "transparent",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
