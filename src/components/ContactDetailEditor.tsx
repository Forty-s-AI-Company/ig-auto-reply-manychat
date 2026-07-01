"use client";

import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type FormEvent } from "react";

type ContactTag = {
  tag: {
    id: string;
    name: string;
    color: string;
  };
};

type ContactSummary = {
  id: string;
  displayName: string;
  externalId: string;
  username: string | null;
  email: string | null;
  phone: string | null;
  consentLabel: string;
  channelName: string;
  tags: ContactTag[];
};

type TagOption = {
  id: string;
  name: string;
  color: string;
};

type ToastState = {
  tone: "success" | "danger";
  message: string;
} | null;

function normalizeNullable(value: string) {
  const trimmed = value.trim();
  return trimmed || null;
}

export function ContactDetailEditor({
  contact,
  allTags,
}: {
  contact: ContactSummary;
  allTags: TagOption[];
}) {
  const router = useRouter();
  const [username, setUsername] = useState(contact.username || "");
  const [email, setEmail] = useState(contact.email || "");
  const [phone, setPhone] = useState(contact.phone || "");
  const [selectedTagIds, setSelectedTagIds] = useState(() => new Set(contact.tags.map(({ tag }) => tag.id)));
  const [tagToAdd, setTagToAdd] = useState("");
  const [toast, setToast] = useState<ToastState>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isTagUpdating, setIsTagUpdating] = useState(false);
  const [isPending, startTransition] = useTransition();
  const tagSelectRef = useRef<HTMLSelectElement>(null);

  const selectedTags = allTags.filter((tag) => selectedTagIds.has(tag.id));
  const availableTags = allTags.filter((tag) => !selectedTagIds.has(tag.id));
  const hasChanges =
    username !== (contact.username || "") ||
    email !== (contact.email || "") ||
    phone !== (contact.phone || "");

  function refreshPage() {
    startTransition(() => router.refresh());
  }

  function resetFields() {
    setUsername(contact.username || "");
    setEmail(contact.email || "");
    setPhone(contact.phone || "");
    setToast(null);
  }

  async function saveContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    setToast(null);
    try {
      const response = await fetch(`/api/contacts/${contact.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          username: normalizeNullable(username),
          email: normalizeNullable(email),
          phone: normalizeNullable(phone),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "儲存聯絡人失敗。");
      }

      setToast({ tone: "success", message: "聯絡人資料已更新。" });
      refreshPage();
    } catch (error) {
      setToast({ tone: "danger", message: error instanceof Error ? error.message : "儲存聯絡人失敗。" });
    } finally {
      setIsSaving(false);
    }
  }

  async function addTag() {
    const nextTagId = tagToAdd || tagSelectRef.current?.value || "";
    if (isTagUpdating) return;
    if (!nextTagId) {
      setToast({ tone: "danger", message: "請先選擇要新增的標籤。" });
      return;
    }

    setIsTagUpdating(true);
    setToast(null);
    try {
      const response = await fetch(`/api/contacts/${contact.id}/tags`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tagId: nextTagId }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "新增標籤失敗。");
      }

      setSelectedTagIds((current) => new Set(current).add(nextTagId));
      setTagToAdd("");
      setToast({ tone: "success", message: "標籤已新增到聯絡人。" });
      refreshPage();
    } catch (error) {
      setToast({ tone: "danger", message: error instanceof Error ? error.message : "新增標籤失敗。" });
    } finally {
      setIsTagUpdating(false);
    }
  }

  async function removeTag(tagId: string) {
    if (isTagUpdating) return;

    setIsTagUpdating(true);
    setToast(null);
    try {
      const response = await fetch(`/api/contacts/${contact.id}/tags?tagId=${encodeURIComponent(tagId)}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "移除標籤失敗。");
      }

      setSelectedTagIds((current) => {
        const next = new Set(current);
        next.delete(tagId);
        return next;
      });
      setToast({ tone: "success", message: "標籤已從聯絡人移除。" });
      refreshPage();
    } catch (error) {
      setToast({ tone: "danger", message: error instanceof Error ? error.message : "移除標籤失敗。" });
    } finally {
      setIsTagUpdating(false);
    }
  }

  return (
    <section className="rounded-lg border border-[#d7dbe0] bg-white p-5 shadow-sm">
      <form onSubmit={saveContact} className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[#111827]">{contact.displayName}</h2>
            <p className="mt-1 text-sm text-[#667085]">
              {contact.channelName} / {contact.externalId} / {contact.consentLabel}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={resetFields}
              disabled={!hasChanges || isSaving || isPending}
              className="h-9 rounded-md border border-[#d7dbe0] bg-white px-3 text-sm text-[#344054] transition hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-60"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!hasChanges || isSaving || isPending}
              className="h-9 rounded-md bg-[#006fe6] px-3 text-sm font-medium text-white transition hover:bg-[#0057b8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving || isPending ? "儲存中" : "儲存變更"}
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="block text-sm font-medium text-[#344054]">
            使用者名稱
            <input
              id="contact-detail-username"
              name="username"
              data-testid="contact-detail-username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-[#d7dbe0] bg-white px-3 text-sm text-[#111827] outline-none focus:border-[#006fe6] focus:ring-2 focus:ring-[#dbeafe]"
              autoComplete="username"
              spellCheck={false}
              placeholder="例如：carry.digital.nomad"
            />
          </label>
          <label className="block text-sm font-medium text-[#344054]">
            Email
            <input
              id="contact-detail-email"
              name="email"
              data-testid="contact-detail-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-[#d7dbe0] bg-white px-3 text-sm text-[#111827] outline-none focus:border-[#006fe6] focus:ring-2 focus:ring-[#dbeafe]"
              autoComplete="email"
              spellCheck={false}
              placeholder="例如：hello@example.com"
            />
          </label>
          <label className="block text-sm font-medium text-[#344054]">
            電話
            <input
              id="contact-detail-phone"
              name="phone"
              data-testid="contact-detail-phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-[#d7dbe0] bg-white px-3 text-sm text-[#111827] outline-none focus:border-[#006fe6] focus:ring-2 focus:ring-[#dbeafe]"
              autoComplete="tel"
              inputMode="tel"
              placeholder="例如：0912 345 678"
            />
          </label>
        </div>
      </form>

      <div className="mt-6 border-t border-[#e4e7ec] pt-5">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#111827]">標籤</h3>
            <p className="mt-1 text-sm text-[#667085]">直接為此聯絡人新增或移除標籤。</p>
          </div>
          <div className="flex gap-2">
            <select
              ref={tagSelectRef}
              data-testid="contact-detail-tag-select"
              value={tagToAdd}
              onChange={(event) => setTagToAdd(event.target.value)}
              onInput={(event) => setTagToAdd(event.currentTarget.value)}
              disabled={availableTags.length === 0 || isTagUpdating}
              className="h-9 min-w-[180px] rounded-md border border-[#d7dbe0] bg-white px-3 text-sm text-[#344054] outline-none focus:border-[#006fe6] focus:ring-2 focus:ring-[#dbeafe] disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="選擇要新增的標籤"
            >
              <option value="">{availableTags.length === 0 ? "沒有可新增標籤" : "選擇標籤"}</option>
              {availableTags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addTag}
              data-testid="contact-detail-add-tag"
              disabled={availableTags.length === 0 || isTagUpdating}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d7dbe0] bg-white px-3 text-sm font-medium text-[#344054] transition hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              新增標籤
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm text-white"
              style={{ backgroundColor: tag.color }}
            >
              {tag.name}
              <button
                type="button"
                onClick={() => removeTag(tag.id)}
                data-testid={`contact-detail-remove-tag-${tag.name}`}
                disabled={isTagUpdating}
                className="inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-black/15 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label={`移除標籤 ${tag.name}`}
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </span>
          ))}
          {selectedTags.length === 0 ? <span className="text-sm text-[#98a2b3]">尚未加入標籤</span> : null}
        </div>
      </div>

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-5 right-5 z-50 w-[min(360px,calc(100vw-40px))] rounded-md border bg-white px-4 py-3 text-sm shadow-[0_16px_48px_rgba(16,24,40,0.18)] ${
            toast.tone === "success" ? "border-green-200 text-green-900" : "border-red-200 text-red-900"
          }`}
        >
          {toast.message}
        </div>
      ) : null}
    </section>
  );
}
