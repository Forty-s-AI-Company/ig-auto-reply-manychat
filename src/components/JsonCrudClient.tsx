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

function getJsonValidationMessage(value: string) {
  const trimmedValue = value.trim();
  if (!trimmedValue) return "JSON 內容不能空白。";

  try {
    const parsed = JSON.parse(trimmedValue);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return "請輸入 JSON 物件，例如 { \"name\": \"重要客戶\" }。";
    }
    return "";
  } catch {
    return "JSON 格式無法解析，請檢查逗號、雙引號或括號。";
  }
}

const primaryButtonClass =
  "rounded-md bg-[#006fe6] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0057b8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006fe6] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButtonClass =
  "rounded-md border border-[#d7dbe0] bg-white px-3 py-2 text-sm font-medium text-[#344054] transition hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006fe6] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const dangerButtonClass =
  "rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

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
  const [deleteTargetId, setDeleteTargetId] = useState("");
  const [preview, setPreview] = useState<BroadcastPreview | null>(null);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const draftValidationMessage = getJsonValidationMessage(draft);
  const editingValidationMessage = editingId ? getJsonValidationMessage(editingJson) : "";

  async function reload() {
    const response = await fetch(endpoint);
    if (response.ok) {
      setItems(await response.json());
      return;
    }
    setError("重新載入資料失敗，請稍後再試。");
  }

  async function createItem() {
    setError("");
    setFeedback("");
    if (draftValidationMessage) {
      setError(`新增${title}前請先修正：${draftValidationMessage}`);
      return;
    }
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: draft,
      });
      if (!response.ok) throw new Error((await response.json()).error || "新增失敗。");
      setDraft(JSON.stringify(createTemplate, null, 2));
      setFeedback("已新增資料。");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "新增失敗。");
    }
  }

  async function updateItem() {
    if (!editingId) return;
    setError("");
    setFeedback("");
    if (editingValidationMessage) {
      setError(`儲存${title}前請先修正：${editingValidationMessage}`);
      return;
    }
    try {
      const response = await fetch(`${endpoint}/${editingId}`, {
        method: updateMethod,
        headers: { "content-type": "application/json" },
        body: editingJson,
      });
      if (!response.ok) throw new Error((await response.json()).error || "更新失敗。");
      setEditingId("");
      setEditingJson("");
      setFeedback("已儲存變更。");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新失敗。");
    }
  }

  async function deleteItem(id: string) {
    setError("");
    setFeedback("");
    const response = await fetch(`${endpoint}/${id}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(typeof data.error === "string" ? data.error : "刪除失敗，請稍後再試。");
      return;
    }
    setFeedback("已刪除資料。");
    setDeleteTargetId("");
    await reload();
  }

  async function queue(id: string) {
    setError("");
    setFeedback("");
    const response = await fetch(`${endpoint}/${id}/queue`, { method: "POST" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(typeof data.error === "string" ? data.error : "加入佇列失敗。");
      return;
    }
    setFeedback(`已加入 ${data.queued ?? 0} 位收件人到佇列。`);
    await reload();
  }

  async function previewItem(id: string) {
    setError("");
    setFeedback("");
    const response = await fetch(`${endpoint}/${id}/preview`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(typeof data.error === "string" ? data.error : "讀取預覽失敗。");
      return;
    }
    setPreview(isBroadcastPreview(data) ? data : null);
    setFeedback("已讀取廣播預覽。");
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-[#111827]">{title}</h2>
        <p className="mt-1 text-sm text-[#667085]">{description}</p>
      </div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      {feedback ? (
        <p className="rounded-md border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm text-cyan-800" role="status" aria-live="polite">
          {feedback}
        </p>
      ) : null}

      <section className="rounded-lg border border-[#d7dbe0] bg-white p-4 shadow-sm">
        <h3 className="mb-2 font-medium text-[#111827]">新增{title}</h3>
        <p className="mb-3 text-sm leading-6 text-[#667085]">請確認 JSON 欄位後再新增；儲存後會立即套用到目前工作區。</p>
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          aria-invalid={Boolean(draftValidationMessage)}
          aria-describedby="json-crud-draft-help"
          spellCheck={false}
          className="h-48 w-full rounded-md border border-[#d7dbe0] bg-[#f8fafc] p-3 font-mono text-sm text-[#111827] outline-none focus:border-[#006fe6] focus:ring-2 focus:ring-[#006fe6]/15"
        />
        <p
          id="json-crud-draft-help"
          className={`mt-2 text-sm leading-6 ${draftValidationMessage ? "text-red-700" : "text-[#667085]"}`}
        >
          {draftValidationMessage || "JSON 格式有效，送出後會建立在目前工作區。"}
        </p>
        <button
          onClick={createItem}
          disabled={Boolean(draftValidationMessage)}
          title={draftValidationMessage || undefined}
          className={`mt-3 ${primaryButtonClass}`}
        >
          新增
        </button>
      </section>

      <section className="space-y-3">
        {items.map((item) => {
          const id = String(item.id);
          return (
            <div key={id} className="rounded-lg border border-[#d7dbe0] bg-white p-4 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-[#111827]">{String(item.name || item.title || id)}</p>
                  <p className="text-xs text-[#667085]">{id}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {queueBroadcast ? (
                    <button onClick={() => previewItem(id)} className={secondaryButtonClass}>
                      預覽
                    </button>
                  ) : null}
                  {queueBroadcast ? (
                    <button onClick={() => queue(id)} className="rounded-md border border-[#006fe6] bg-white px-3 py-2 text-sm font-medium text-[#006fe6] transition hover:bg-[#eff6ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006fe6] focus-visible:ring-offset-2">
                      加入佇列
                    </button>
                  ) : null}
                  <button
                    onClick={() => {
                      setEditingId(id);
                      setEditingJson(JSON.stringify(item, null, 2));
                    }}
                    className={secondaryButtonClass}
                  >
                    編輯
                  </button>
                  <button onClick={() => setDeleteTargetId(id)} className={dangerButtonClass}>
                    刪除
                  </button>
                </div>
              </div>
              <pre className="max-h-64 overflow-auto rounded-md border border-[#edf0f2] bg-[#f8fafc] p-3 text-xs text-[#344054]">
                {JSON.stringify(item, null, 2)}
              </pre>
            </div>
          );
        })}
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#cfd4dc] bg-white p-8 text-center">
            <p className="text-sm font-medium text-[#111827]">目前還沒有{title}資料</p>
            <p className="mt-2 text-sm leading-6 text-[#667085]">可以先用上方 JSON 範本建立第一筆資料；若只是測試環境，請使用不含真實個資的內容。</p>
          </div>
        ) : null}
      </section>

      {editingId ? (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-3xl rounded-lg border border-[#d7dbe0] bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-medium text-[#111827]">編輯 {editingId}</h3>
              <button onClick={() => setEditingId("")} className="rounded-md px-2 py-1 text-sm text-[#667085] hover:bg-[#f8fafc] hover:text-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006fe6] focus-visible:ring-offset-2">
                關閉
              </button>
            </div>
            <textarea
              value={editingJson}
              onChange={(event) => setEditingJson(event.target.value)}
              aria-invalid={Boolean(editingValidationMessage)}
              aria-describedby="json-crud-edit-help"
              spellCheck={false}
              className="h-[50vh] w-full rounded-md border border-[#d7dbe0] bg-[#f8fafc] p-3 font-mono text-sm text-[#111827] outline-none focus:border-[#006fe6] focus:ring-2 focus:ring-[#006fe6]/15"
            />
            <p
              id="json-crud-edit-help"
              className={`mt-2 text-sm leading-6 ${editingValidationMessage ? "text-red-700" : "text-[#667085]"}`}
            >
              {editingValidationMessage || "JSON 格式有效，儲存後會立即更新這筆資料。"}
            </p>
            <button
              onClick={updateItem}
              disabled={Boolean(editingValidationMessage)}
              title={editingValidationMessage || undefined}
              className={`mt-3 ${primaryButtonClass}`}
            >
              儲存
            </button>
          </div>
        </div>
      ) : null}

      {deleteTargetId ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4" role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="json-crud-delete-title"
            aria-describedby="json-crud-delete-description"
            className="w-full max-w-md rounded-lg border border-red-200 bg-white p-5 shadow-xl"
          >
            <h3 id="json-crud-delete-title" className="text-base font-semibold text-[#111827]">
              確認刪除資料？
            </h3>
            <p id="json-crud-delete-description" className="mt-2 text-sm leading-6 text-[#475467]">
              這會刪除 ID 為 <span className="font-mono text-xs text-[#111827]">{deleteTargetId}</span> 的資料。刪除後需要重新建立，請先確認它沒有被其他流程使用。
            </p>
            <div className="mt-5 flex flex-col-reverse justify-end gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setDeleteTargetId("")}
                className={secondaryButtonClass}
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => deleteItem(deleteTargetId)}
                data-testid="json-crud-confirm-delete"
                className="rounded-md border border-red-700 bg-red-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2"
              >
                確認刪除
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {preview ? (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-5xl rounded-lg border border-[#d7dbe0] bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-medium text-[#111827]">廣播預覽</h3>
                <p className="mt-1 text-sm text-[#667085]">{preview.broadcast?.name || "未命名廣播"}</p>
              </div>
              <button onClick={() => setPreview(null)} className="rounded-md px-2 py-1 text-sm text-[#667085] hover:bg-[#f8fafc] hover:text-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006fe6] focus-visible:ring-offset-2">
                關閉
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-md border border-[#d7dbe0] bg-[#f8fafc] p-3">
                <p className="text-xs text-[#667085]">候選聯絡人</p>
                <p className="mt-1 text-2xl font-semibold text-[#111827]">{preview.totalCandidates ?? 0}</p>
              </div>
              <div className="rounded-md border border-cyan-200 bg-cyan-50 p-3">
                <p className="text-xs text-cyan-700">會收到</p>
                <p className="mt-1 text-2xl font-semibold text-cyan-900">{preview.recipientCount ?? 0}</p>
              </div>
              <div className="rounded-md border border-[#d7dbe0] bg-[#f8fafc] p-3">
                <p className="text-xs text-[#667085]">略過</p>
                <p className="mt-1 text-2xl font-semibold text-[#111827]">{preview.skippedCount ?? 0}</p>
              </div>
            </div>

            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div className="rounded-md bg-[#f8fafc] p-3">
                <dt className="text-[#667085]">目標</dt>
                <dd className="mt-1 font-mono text-xs text-[#344054]">
                  {preview.target?.segmentId ? `segmentId: ${preview.target.segmentId}` : `tagId: ${formatValue(preview.target?.tagId)}`}
                </dd>
              </div>
              <div className="rounded-md bg-[#f8fafc] p-3">
                <dt className="text-[#667085]">訊息</dt>
                <dd className="mt-1 text-[#344054]">{formatValue(preview.broadcast?.messageText)}</dd>
              </div>
            </dl>

            <div className="mt-4 max-h-[48vh] overflow-auto rounded-md border border-[#d7dbe0]">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="sticky top-0 bg-[#f8fafc] text-xs text-[#667085]">
                  <tr>
                    <th className="px-3 py-2 font-medium">姓名</th>
                    <th className="px-3 py-2 font-medium">External ID</th>
                    <th className="px-3 py-2 font-medium">渠道</th>
                    <th className="px-3 py-2 font-medium">同意狀態</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf0f2] text-[#344054]">
                  {(preview.recipients || []).map((recipient) => (
                    <tr key={recipient.id}>
                      <td className="px-3 py-2">{formatValue(recipient.displayName)}</td>
                      <td className="px-3 py-2 font-mono text-xs text-[#667085]">{recipient.externalId}</td>
                      <td className="px-3 py-2">
                        {recipient.channel.name} <span className="text-xs text-[#667085]">({recipient.channel.type})</span>
                      </td>
                      <td className="px-3 py-2">{recipient.consentStatus}</td>
                    </tr>
                  ))}
                  {preview.recipients?.length ? null : (
                    <tr>
                      <td className="px-3 py-6 text-center text-[#667085]" colSpan={4}>
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
