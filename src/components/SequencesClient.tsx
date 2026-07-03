"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";

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
  const [deleteTargetId, setDeleteTargetId] = useState("");
  const [pendingRemoveStepIndex, setPendingRemoveStepIndex] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [hasHydrated, setHasHydrated] = useState(false);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const trimmedName = name.trim();
  const selectedSequence = useMemo(
    () => sequences.find((sequence) => sequence.id === selectedSequenceId),
    [selectedSequenceId, sequences],
  );
  const invalidStep = steps.find((step) => {
    const delaySeconds = Number(step.delaySeconds);
    return !step.text.trim() || !Number.isFinite(delaySeconds) || delaySeconds < 0;
  });
  const canSaveSequence = hasHydrated && Boolean(trimmedName) && steps.length > 0 && !invalidStep;
  const hasContacts = contacts.length > 0;
  const saveDisabledReason = !hasHydrated
    ? "序列表單正在載入，請稍候。"
    : !trimmedName
    ? "請先填寫序列名稱。"
    : invalidStep
      ? "每個步驟都需要填寫訊息，延遲秒數也不能小於 0。"
      : "";
  const subscribeDisabledReason = !selectedSequenceId
    ? "請先選擇要訂閱的序列。"
    : !hasContacts
      ? "目前還沒有可加入序列的聯絡人，先到聯絡人或收件匣建立第一筆對話。"
    : !selectedContactId
      ? "請先選擇要加入序列的聯絡人。"
      : "";

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      if (nameInputRef.current) {
        setName(nameInputRef.current.value);
      }
      setHasHydrated(true);
    }, 0);
    return () => window.clearTimeout(hydrationTimer);
  }, []);

  useEffect(() => {
    const element = nameInputRef.current;
    if (!element) return;

    const syncNameFromDom = () => setName(element.value);
    element.addEventListener("input", syncNameFromDom);
    element.addEventListener("change", syncNameFromDom);

    return () => {
      element.removeEventListener("input", syncNameFromDom);
      element.removeEventListener("change", syncNameFromDom);
    };
  }, []);

  async function reload() {
    const response = await fetch("/api/sequences");
    if (response.ok) {
      const next = await response.json();
      setSequences(next);
      if (!selectedSequenceId && next[0]) setSelectedSequenceId(next[0].id);
      return;
    }
    setMessage("重新載入序列失敗，請稍後再試。");
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

  function requestRemoveStep(index: number) {
    setMessage("");
    setPendingRemoveStepIndex(index);
  }

  function confirmRemoveStep() {
    if (pendingRemoveStepIndex === null) return;
    const removedOrder = pendingRemoveStepIndex + 1;
    removeStep(pendingRemoveStepIndex);
    setPendingRemoveStepIndex(null);
    setMessage(`已從草稿移除第 ${removedOrder} 封，儲存後才會套用。`);
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

  function syncNameFromInput(event: FormEvent<HTMLInputElement>) {
    setName(event.currentTarget.value);
  }

  function focusSequenceEditor() {
    nameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    nameInputRef.current?.focus();
  }

  async function createSequence() {
    if (!canSaveSequence) {
      setMessage(saveDisabledReason || "請先完成序列內容。");
      return;
    }
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
    setMessage("");
    const response = await fetch(`/api/sequences/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setMessage(data.error || "刪除序列失敗，請稍後再試。");
      return;
    }
    if (selectedSequenceId === id) setSelectedSequenceId("");
    setDeleteTargetId("");
    await reload();
  }

  async function subscribe() {
    if (subscribeDisabledReason) {
      setMessage(subscribeDisabledReason);
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
                  className="rounded-md border border-[#d7dbe0] px-3 py-2 text-sm text-[#344054] hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8d9] focus-visible:ring-offset-2"
                >
                  編輯
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTargetId(sequence.id)}
                  className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2"
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
          <div
            data-testid="sequences-empty-state"
            className="rounded-lg border border-dashed border-[#d7dbe0] bg-[#f8fafc] p-6 text-sm text-[#667085]"
          >
            <p className="text-base font-semibold text-[#111827]">尚未建立序列。</p>
            <p className="mt-2 leading-6">
              可以先建立第一個培養流程，再把聯絡人加入序列；如果目前還沒有聯絡人，先回收件匣或聯絡人完成第一筆名單。
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={focusSequenceEditor}
                data-testid="sequences-empty-create-cta"
                className="inline-flex h-9 items-center justify-center rounded-md bg-[#006fe6] px-3 text-sm font-medium text-white hover:bg-[#0057b8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8d9] focus-visible:ring-offset-2"
              >
                建立第一個序列
              </button>
              <Link
                href="/contacts"
                data-testid="sequences-empty-open-contacts"
                className="inline-flex h-9 items-center justify-center rounded-md border border-[#d7dbe0] bg-white px-3 text-sm font-medium text-[#344054] hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8d9] focus-visible:ring-offset-2"
              >
                前往聯絡人
              </Link>
            </div>
          </div>
        ) : null}
      </section>

      <aside className="space-y-4">
        {message ? (
          <p className="rounded-md border border-[#d7dbe0] bg-white px-3 py-2 text-sm text-[#344054]" role="status" aria-live="polite">
            {message}
          </p>
        ) : null}

        <section id="sequence-editor-card" className="rounded-lg border border-[#d7dbe0] bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-[#111827]">{editingSequenceId ? "編輯序列" : "建立序列"}</h2>
            {editingSequenceId ? (
              <button
                type="button"
                onClick={resetDraft}
                className="rounded-md text-xs text-[#667085] hover:text-[#344054] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8d9] focus-visible:ring-offset-2"
              >
                取消
              </button>
            ) : null}
          </div>
          <div className="mt-4 space-y-3">
            <label className="block text-sm">
              <span className="mb-1 block text-[#667085]">名稱</span>
              <input
                ref={nameInputRef}
                name="sequenceName"
                required
                autoComplete="off"
                aria-invalid={!trimmedName}
                value={name}
                onChange={syncNameFromInput}
                onChangeCapture={syncNameFromInput}
                onInput={syncNameFromInput}
                onInputCapture={syncNameFromInput}
                className="w-full rounded-md border border-[#d7dbe0] px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8d9] focus-visible:ring-offset-2"
                data-testid="sequence-name-input"
              />
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
                    <button
                      type="button"
                      onClick={() => requestRemoveStep(index)}
                      data-testid={`sequence-step-remove-${index}`}
                      className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2"
                    >
                      移除
                    </button>
                  ) : null}
                </div>
                <label className="block text-sm">
                  <span className="mb-1 block text-[#667085]">延遲秒數</span>
                  <input
                    type="number"
                    min="0"
                    name={`sequence-step-delay-${index}`}
                    inputMode="numeric"
                    value={step.delaySeconds}
                    onChange={(event) => updateStep(index, { delaySeconds: event.target.value })}
                    className="w-full rounded-md border border-[#d7dbe0] px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8d9] focus-visible:ring-offset-2"
                  />
                </label>
                <label className="mt-2 block text-sm">
                  <span className="mb-1 block text-[#667085]">訊息</span>
                  <textarea
                    name={`sequence-step-message-${index}`}
                    value={step.text}
                    onChange={(event) => updateStep(index, { text: event.target.value })}
                    className="h-24 w-full resize-none rounded-md border border-[#d7dbe0] px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8d9] focus-visible:ring-offset-2"
                  />
                </label>
              </div>
            ))}
            <button type="button" onClick={addStep} className="w-full rounded-md border border-[#d7dbe0] px-3 py-2 text-sm text-[#344054] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8d9] focus-visible:ring-offset-2">
              新增步驟
            </button>
            <button
              type="button"
              onClick={createSequence}
              disabled={!canSaveSequence}
              title={saveDisabledReason || undefined}
              aria-describedby={!canSaveSequence ? "sequence-save-disabled-reason" : undefined}
              className="w-full rounded-md bg-[#006fe6] px-4 py-2 text-sm font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8d9] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              data-testid="sequence-save-button"
            >
              {editingSequenceId ? "更新序列" : "建立序列"}
            </button>
            {!canSaveSequence ? (
              <p id="sequence-save-disabled-reason" className="text-xs leading-5 text-[#667085]">
                {saveDisabledReason}
              </p>
            ) : null}
          </div>
        </section>

        <section className="rounded-lg border border-[#d7dbe0] bg-white p-4">
          <h2 className="font-semibold text-[#111827]">訂閱聯絡人</h2>
          <div className="mt-4 space-y-3">
            <label className="block text-sm">
              <span className="mb-1 block text-[#667085]">序列</span>
              <select
                value={selectedSequenceId}
                name="sequence-subscribe-sequence"
                onChange={(event) => setSelectedSequenceId(event.target.value)}
                className="w-full rounded-md border border-[#d7dbe0] px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8d9] focus-visible:ring-offset-2"
                data-testid="sequence-subscribe-sequence-select"
              >
                <option value="">選擇序列</option>
                {sequences.map((sequence) => (
                  <option key={sequence.id} value={sequence.id}>{sequence.name}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-[#667085]">聯絡人</span>
              <select
                value={selectedContactId}
                name="sequence-subscribe-contact"
                onChange={(event) => setSelectedContactId(event.target.value)}
                className="w-full rounded-md border border-[#d7dbe0] px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8d9] focus-visible:ring-offset-2"
                data-testid="sequence-subscribe-contact-select"
              >
                <option value="">選擇聯絡人</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>{contact.displayName || contact.externalId}</option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={subscribe}
              disabled={Boolean(subscribeDisabledReason)}
              title={subscribeDisabledReason || undefined}
              aria-describedby={subscribeDisabledReason ? "sequence-subscribe-disabled-reason" : undefined}
              className="w-full rounded-md bg-[#006fe6] px-4 py-2 text-sm font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8d9] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              data-testid="sequence-subscribe-button"
            >
              加入序列
            </button>
            {subscribeDisabledReason ? (
              <p id="sequence-subscribe-disabled-reason" className="text-xs leading-5 text-[#667085]">
                {subscribeDisabledReason}
              </p>
            ) : null}
            {!hasContacts ? (
              <Link
                href="/contacts"
                data-testid="sequence-subscribe-open-contacts"
                className="inline-flex text-xs font-medium text-[#087f95] hover:text-[#0b4a6f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8d9] focus-visible:ring-offset-2"
              >
                先前往聯絡人整理名單
              </Link>
            ) : null}
            {selectedSequence ? (
              <p className="text-xs leading-5 text-[#667085]">
                目前選取：{selectedSequence.name}。加入後，worker 會依每個步驟的延遲時間建立排程訊息。
              </p>
            ) : null}
          </div>
        </section>
      </aside>
      {deleteTargetId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sequence-delete-title"
            data-testid="sequence-delete-dialog"
            className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto overscroll-contain rounded-lg border border-red-200 bg-white p-5 shadow-xl"
          >
            <h2 id="sequence-delete-title" className="text-base font-semibold text-[#111827]">
              確認刪除序列？
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#475467]">
              刪除後，這個序列的步驟與後續訂閱排程會一併移除。若只是暫停發送，請改用「停用序列」再儲存。
            </p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteTargetId("")}
                className="rounded-md border border-[#d7dbe0] bg-white px-3 py-2 text-sm font-medium text-[#344054] transition hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8d9] focus-visible:ring-offset-2"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => deleteSequence(deleteTargetId)}
                data-testid="sequence-confirm-delete"
                className="rounded-md border border-red-700 bg-red-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2"
              >
                確認刪除
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {pendingRemoveStepIndex !== null ? (
        <SequenceStepRemoveDialog
          stepOrder={pendingRemoveStepIndex + 1}
          onCancel={() => setPendingRemoveStepIndex(null)}
          onConfirm={confirmRemoveStep}
        />
      ) : null}
    </div>
  );
}

function SequenceStepRemoveDialog({
  stepOrder,
  onCancel,
  onConfirm,
}: {
  stepOrder: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sequence-step-remove-title"
        data-testid="sequence-step-remove-dialog"
        className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto overscroll-contain rounded-lg border border-red-200 bg-white p-5 shadow-xl"
      >
        <h2 id="sequence-step-remove-title" className="text-base font-semibold text-[#111827]">
          移除序列步驟？
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#475467]">
          你即將從目前草稿移除第 {stepOrder} 封訊息。這只會先修改草稿，按下「建立序列」或「更新序列」後才會套用。
        </p>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-[#d7dbe0] bg-white px-3 py-2 text-sm font-medium text-[#344054] transition hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8d9] focus-visible:ring-offset-2"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            data-testid="sequence-step-confirm-remove"
            className="rounded-md border border-red-700 bg-red-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2"
          >
            確認移除
          </button>
        </div>
      </div>
    </div>
  );
}
