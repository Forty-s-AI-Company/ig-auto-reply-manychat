"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

const PRESET_COLORS = ["#2563eb", "#16a34a", "#f97316", "#dc2626", "#7c3aed", "#0891b2"];

type CreatedTag = { id: string; name: string; color: string };

type ContactTagCreateButtonProps = {
  variant?: "icon" | "inline";
  buttonLabel?: string;
  modalDescription?: string;
  onCreated?: (tag: CreatedTag) => void | Promise<void>;
};

export function ContactTagCreateButton({
  variant = "icon",
  buttonLabel = "新增標籤",
  modalDescription = "建立後會出現在左側標籤清單。",
  onCreated,
}: ContactTagCreateButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isPending, startTransition] = useTransition();

  function closeDialog() {
    if (isSaving || isPending) return;
    setIsOpen(false);
    setName("");
    setColor(PRESET_COLORS[0]);
    setError("");
  }

  async function createTag(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("請輸入標籤名稱。");
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: trimmedName, color }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "新增標籤失敗。");
      }

      const createdTag = data as CreatedTag;
      await onCreated?.(createdTag);

      setIsOpen(false);
      setName("");
      setColor(PRESET_COLORS[0]);
      startTransition(() => router.refresh());
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "新增標籤失敗。");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      {variant === "inline" ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-[#d7dbe0] bg-white px-2.5 text-xs font-medium text-[#344054] transition hover:bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#006fe6] focus:ring-offset-2"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          {buttonLabel}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label={buttonLabel}
          title={buttonLabel}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[#667085] transition hover:bg-[#e4e7ec] hover:text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#006fe6] focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      )}

      {isOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-contact-tag-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4"
        >
          <div className="w-full max-w-sm rounded-lg border border-[#d7dbe0] bg-white p-5 shadow-xl">
            <div className="mb-4">
              <h2 id="create-contact-tag-title" className="text-base font-semibold text-[#111827]">
                新增標籤
              </h2>
              <p className="mt-1 text-sm text-[#667085]">{modalDescription}</p>
            </div>

            <form onSubmit={createTag} className="space-y-4">
              <label className="block text-sm font-medium text-[#344054]">
                新標籤名稱
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={40}
                  autoFocus
                  className="mt-1 h-10 w-full rounded-md border border-[#d7dbe0] px-3 text-sm text-[#111827] outline-none focus:border-[#006fe6] focus:ring-2 focus:ring-[#dbeafe]"
                  placeholder="例如：VIP、待追蹤"
                />
              </label>

              <div>
                <label className="block text-sm font-medium text-[#344054]" htmlFor="contact-tag-color">
                  顏色
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    id="contact-tag-color"
                    type="color"
                    value={color}
                    onChange={(event) => setColor(event.target.value)}
                    className="h-10 w-12 cursor-pointer rounded-md border border-[#d7dbe0] bg-white p-1"
                    aria-label="選擇標籤顏色"
                  />
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setColor(preset)}
                        aria-label={`使用顏色 ${preset}`}
                        className="h-7 w-7 rounded-full border-2"
                        style={{
                          backgroundColor: preset,
                          borderColor: color === preset ? "#111827" : "transparent",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeDialog}
                  disabled={isSaving || isPending}
                  className="h-9 rounded-md border border-[#d7dbe0] bg-white px-3 text-sm text-[#344054] hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isPending}
                  className="h-9 rounded-md bg-[#006fe6] px-3 text-sm font-medium text-white hover:bg-[#0057b8] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving || isPending ? "儲存中" : "建立標籤"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
