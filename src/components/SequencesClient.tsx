"use client";

import { useMemo, useState } from "react";

type SequenceStep = {
  id: string;
  order: number;
  delaySeconds: number;
  messageJson: { text?: string };
};

type SequenceItem = {
  id: string;
  name: string;
  enabled: boolean;
  steps: SequenceStep[];
  activeSubscriptionCount?: number;
};

type ContactOption = {
  id: string;
  displayName: string;
  externalId: string;
};

type StepDraft = {
  order: number;
  delaySeconds: string;
  text: string;
};

const emptyStep: StepDraft = { order: 1, delaySeconds: "0", text: "歡迎加入，這是第一封序列訊息。" };

export function SequencesClient({
  initialSequences,
  contacts,
}: {
  initialSequences: SequenceItem[];
  contacts: ContactOption[];
}) {
  const [sequences, setSequences] = useState(initialSequences);
  const [name, setName] = useState("新名單培養序列");
  const [enabled, setEnabled] = useState(true);
  const [steps, setSteps] = useState<StepDraft[]>([emptyStep]);
  const [editingSequenceId, setEditingSequenceId] = useState("");
  const [selectedSequenceId, setSelectedSequenceId] = useState(initialSequences[0]?.id || "");
  const [selectedContactId, setSelectedContactId] = useState(contacts[0]?.id || "");
  const [message, setMessage] = useState("");

  const selectedSequence = useMemo(
    () => sequences.find((sequence) => sequence.id === selectedSequenceId),
    [selectedSequenceId, sequences],
  );

  async function reload() {
    const response = await fetch("/api/sequences");
    if (response.ok) {
      const next = await response.json();
      setSequences(next);
      if (!selectedSequenceId && next[0]) setSelectedSequenceId(next[0].id);
    }
  }

  function updateStep(index: number, patch: Partial<StepDraft>) {
    setSteps((current) =>
      current.map((step, itemIndex) => (itemIndex === index ? { ...step, ...patch } : step)),
    );
  }

  function addStep() {
    setSteps((current) => [
      ...current,
      { order: current.length + 1, delaySeconds: "86400", text: "下一封序列訊息。" },
    ]);
  }

  function removeStep(index: number) {
    setSteps((current) =>
      current
        .filter((_, itemIndex) => itemIndex !== index)
        .map((step, itemIndex) => ({ ...step, order: itemIndex + 1 })),
    );
  }

  function editSequence(sequence: SequenceItem) {
    setEditingSequenceId(sequence.id);
    setSelectedSequenceId(sequence.id);
    setName(sequence.name);
    setEnabled(sequence.enabled);
    setSteps(
      sequence.steps.map((step, index) => ({
        order: index + 1,
        delaySeconds: String(step.delaySeconds),
        text: step.messageJson.text || "",
      })),
    );
  }

  function resetDraft() {
    setEditingSequenceId("");
    setName("新名單培養序列");
    setEnabled(true);
    setSteps([emptyStep]);
  }

  async function createSequence() {
    setMessage("");
    const payload = {
      name: name.trim(),
      enabled,
      steps: steps.map((step, index) => ({
        order: index + 1,
        delaySeconds: Number(step.delaySeconds || 0),
        messageJson: { text: step.text.trim() },
      })),
    };

    const response = await fetch(editingSequenceId ? `/api/sequences/${editingSequenceId}` : "/api/sequences", {
      method: editingSequenceId ? "PUT" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(data.error || "建立序列失敗。");
      return;
    }
    setMessage("序列已建立。");
    setSelectedSequenceId(data.id);
    if (editingSequenceId) {
      setMessage("序列已更新。");
      setEditingSequenceId("");
    }
    await reload();
  }

  async function deleteSequence(id: string) {
    if (!confirm("確定要刪除這個序列？")) return;
    await fetch(`/api/sequences/${id}`, { method: "DELETE" });
    if (selectedSequenceId === id) setSelectedSequenceId("");
    await reload();
  }

  async function subscribe() {
    if (!selectedSequenceId || !selectedContactId) {
      setMessage("請先選擇序列與聯絡人。");
      return;
    }
    const response = await fetch(`/api/sequences/${selectedSequenceId}/subscribe`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ contactId: selectedContactId }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(data.error || "訂閱序列失敗。");
      return;
    }
    setMessage("已把聯絡人加入序列，worker 會依時間送出訊息。");
    await reload();
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
      <section className="space-y-3">
        <div className="rounded-lg border border-[#d7dbe0] bg-white p-4">
          <h2 className="text-lg font-semibold text-[#111827]">序列列表</h2>
          <p className="mt-1 text-sm text-[#667085]">用來安排多封延遲訊息，例如歡迎、提醒、成交追蹤。</p>
        </div>

        {sequences.map((sequence) => (
          <article key={sequence.id} className="rounded-lg border border-[#d7dbe0] bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-[#111827]">{sequence.name}</h3>
                <p className="mt-1 text-sm text-[#667085]">
                  {sequence.enabled ? "已啟用" : "已停用"} · {sequence.steps.length} 個步驟 · 訂閱中 {sequence.activeSubscriptionCount || 0}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => editSequence(sequence)}
                  className="rounded-md border border-[#d7dbe0] px-3 py-2 text-sm text-[#344054] hover:bg-[#f8fafc]"
                >
                  編輯
                </button>
                <button
                  type="button"
                  onClick={() => deleteSequence(sequence.id)}
                  className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                >
                  刪除
                </button>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {sequence.steps.map((step) => (
                <div key={step.id} className="rounded-md bg-[#f8fafc] px-3 py-2 text-sm text-[#4b5563]">
                  第 {step.order} 封 · 延遲 {step.delaySeconds} 秒：{step.messageJson.text || ""}
                </div>
              ))}
            </div>
          </article>
        ))}

        {sequences.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[#d7dbe0] bg-white p-6 text-sm text-[#667085]">
            尚未建立序列。
          </p>
        ) : null}
      </section>

      <aside className="space-y-4">
        {message ? <p className="rounded-md border border-[#d7dbe0] bg-white px-3 py-2 text-sm text-[#344054]">{message}</p> : null}

        <section className="rounded-lg border border-[#d7dbe0] bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-[#111827]">{editingSequenceId ? "編輯序列" : "建立序列"}</h2>
            {editingSequenceId ? (
              <button type="button" onClick={resetDraft} className="text-xs text-[#667085]">
                取消
              </button>
            ) : null}
          </div>
          <div className="mt-4 space-y-3">
            <label className="block text-sm">
              <span className="mb-1 block text-[#667085]">名稱</span>
              <input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-md border border-[#d7dbe0] px-3 py-2" />
            </label>
            <label className="flex items-center gap-2 text-sm text-[#344054]">
              <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />
              啟用序列
            </label>
            {steps.map((step, index) => (
              <div key={index} className="rounded-md border border-[#d7dbe0] p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-[#111827]">第 {index + 1} 封</p>
                  {steps.length > 1 ? (
                    <button type="button" onClick={() => removeStep(index)} className="text-xs text-red-600">
                      移除
                    </button>
                  ) : null}
                </div>
                <label className="block text-sm">
                  <span className="mb-1 block text-[#667085]">延遲秒數</span>
                  <input
                    type="number"
                    min="0"
                    value={step.delaySeconds}
                    onChange={(event) => updateStep(index, { delaySeconds: event.target.value })}
                    className="w-full rounded-md border border-[#d7dbe0] px-3 py-2"
                  />
                </label>
                <label className="mt-2 block text-sm">
                  <span className="mb-1 block text-[#667085]">訊息</span>
                  <textarea
                    value={step.text}
                    onChange={(event) => updateStep(index, { text: event.target.value })}
                    className="h-24 w-full resize-none rounded-md border border-[#d7dbe0] px-3 py-2"
                  />
                </label>
              </div>
            ))}
            <button type="button" onClick={addStep} className="w-full rounded-md border border-[#d7dbe0] px-3 py-2 text-sm text-[#344054]">
              新增步驟
            </button>
            <button type="button" onClick={createSequence} className="w-full rounded-md bg-[#006fe6] px-4 py-2 text-sm font-medium text-white">
              {editingSequenceId ? "更新序列" : "建立序列"}
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-[#d7dbe0] bg-white p-4">
          <h2 className="font-semibold text-[#111827]">訂閱聯絡人</h2>
          <div className="mt-4 space-y-3">
            <label className="block text-sm">
              <span className="mb-1 block text-[#667085]">序列</span>
              <select value={selectedSequenceId} onChange={(event) => setSelectedSequenceId(event.target.value)} className="w-full rounded-md border border-[#d7dbe0] px-3 py-2">
                <option value="">選擇序列</option>
                {sequences.map((sequence) => (
                  <option key={sequence.id} value={sequence.id}>{sequence.name}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-[#667085]">聯絡人</span>
              <select value={selectedContactId} onChange={(event) => setSelectedContactId(event.target.value)} className="w-full rounded-md border border-[#d7dbe0] px-3 py-2">
                <option value="">選擇聯絡人</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>{contact.displayName || contact.externalId}</option>
                ))}
              </select>
            </label>
            <button type="button" onClick={subscribe} className="w-full rounded-md bg-[#006fe6] px-4 py-2 text-sm font-medium text-white">
              加入序列
            </button>
            {selectedSequence ? (
              <p className="text-xs leading-5 text-[#667085]">
                目前選取：{selectedSequence.name}。加入後，worker 會依每個步驟的延遲時間建立排程訊息。
              </p>
            ) : null}
          </div>
        </section>
      </aside>
    </div>
  );
}
