"use client";

import Link from "next/link";
import { Filter, Plus, Search, Tags, Users, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ContactTagCreateButton } from "@/components/ContactTagCreateButton";

type ContactTag = {
  id: string;
  name: string;
  color: string;
};

type ContactRow = {
  id: string;
  displayName: string;
  username?: string | null;
  externalId: string;
  channelName: string;
  consentStatus: string;
  consentLabel: string;
  tags: ContactTag[];
  conversationsCount: number;
  lastInteractionLabel: string;
};

type ContactsListClientProps = {
  contacts: ContactRow[];
  tags: ContactTag[];
  totalContacts: number;
  subscribedCount: number;
  unknownCount: number;
  q: string;
  status: string;
  tagId: string;
};

const statusOptions = [
  { value: "", label: "全部狀態" },
  { value: "opted_in", label: "已訂閱" },
  { value: "unknown", label: "未知狀態" },
  { value: "opted_out", label: "已取消訂閱" },
];

function buildContactHref(pathname: string, updates: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(updates)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function ContactsListClient({
  contacts,
  tags,
  totalContacts,
  subscribedCount,
  unknownCount,
  q,
  status,
  tagId,
}: ContactsListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState(status);
  const [draftTagId, setDraftTagId] = useState(tagId);
  const [batchTagId, setBatchTagId] = useState(tags[0]?.id || "");
  const [isSegmentDialogOpen, setIsSegmentDialogOpen] = useState(false);
  const [segmentName, setSegmentName] = useState("Contacts 篩選分眾");
  const [segmentDescription, setSegmentDescription] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);
  const [isPending, startTransition] = useTransition();

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const visibleIds = contacts.map((contact) => contact.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedSet.has(id));
  const activeTag = tags.find((tag) => tag.id === tagId);

  useEffect(() => {
    queueMicrotask(() => setIsHydrated(true));
  }, []);

  function updateFilters(nextStatus: string, nextTagId: string, nextQ = q) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextQ.trim()) params.set("q", nextQ.trim());
    else params.delete("q");
    if (nextStatus) params.set("status", nextStatus);
    else params.delete("status");
    if (nextTagId) params.set("tag", nextTagId);
    else params.delete("tag");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
    setSelectedIds([]);
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    updateFilters(status, tagId, String(formData.get("q") || ""));
  }

  function applyFilter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateFilters(draftStatus, draftTagId);
    setIsFilterOpen(false);
  }

  function toggleContact(id: string) {
    setMessage("");
    setError("");
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function toggleAllVisible() {
    setMessage("");
    setError("");
    if (allVisibleSelected) {
      setSelectedIds((current) => current.filter((id) => !visibleIds.includes(id)));
      return;
    }
    setSelectedIds((current) => Array.from(new Set([...current, ...visibleIds])));
  }

  async function batchAddTag() {
    setMessage("");
    setError("");
    if (selectedIds.length === 0) {
      setError("請先勾選聯絡人。");
      return;
    }
    if (!batchTagId) {
      setError("請先選擇要加入的標籤。");
      return;
    }

    try {
      const response = await fetch("/api/contacts/batch-tags", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ contactIds: selectedIds, tagId: batchTagId }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "批次加標籤失敗。");

      setSelectedIds([]);
      setMessage(`已為 ${data.count || selectedIds.length} 位聯絡人加入標籤。`);
      startTransition(() => router.refresh());
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "批次加標籤失敗。");
    }
  }

  async function batchRemoveTag() {
    setMessage("");
    setError("");
    if (selectedIds.length === 0) {
      setError("請先勾選聯絡人。");
      return;
    }
    if (!batchTagId) {
      setError("請先選擇要移除的標籤。");
      return;
    }

    try {
      const response = await fetch("/api/contacts/batch-tags", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ contactIds: selectedIds, tagId: batchTagId }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "批次移除標籤失敗。");

      setSelectedIds([]);
      setMessage(`已從 ${data.count || 0} 位聯絡人移除標籤。`);
      startTransition(() => router.refresh());
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "批次移除標籤失敗。");
    }
  }

  async function createSegmentFromCurrentFilter() {
    setMessage("");
    setError("");
    const name = segmentName.trim();
    if (!name) {
      setError("請輸入分眾名稱。");
      return;
    }

    try {
      const response = await fetch("/api/contacts/segments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          description: segmentDescription.trim() || null,
          q,
          status: status || null,
          tagId: tagId || null,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "建立分眾失敗。");

      setIsSegmentDialogOpen(false);
      setMessage(`已建立分眾「${data.name || name}」。`);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "建立分眾失敗。");
    }
  }

  return (
    <div
      className="flex h-[calc(100vh-100px)] min-h-0 overflow-hidden rounded-lg border border-[#d7dbe0] bg-white"
      data-testid="contacts-list-client"
      data-ready={isHydrated ? "true" : "false"}
    >
      <aside className="hidden w-[260px] shrink-0 border-r border-[#d7dbe0] bg-[#f7f7f7] lg:block">
        <div className="space-y-1 p-3 text-sm">
          <ContactNavLink
            href={buildContactHref(pathname, { q })}
            active={!status && !tagId}
            icon={<Users className="h-4 w-4" />}
            label="全部聯絡人"
            count={totalContacts}
          />
          <ContactNavLink
            href={buildContactHref(pathname, { q, status: "opted_in" })}
            active={status === "opted_in"}
            icon={<Users className="h-4 w-4" />}
            label="已訂閱"
            count={subscribedCount}
          />
          <ContactNavLink
            href={buildContactHref(pathname, { q, status: "unknown" })}
            active={status === "unknown"}
            icon={<Users className="h-4 w-4" />}
            label="未知狀態"
            count={unknownCount}
          />
        </div>
        <div className="border-t border-[#e4e7ec] px-3 py-4">
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-[#667085]">
            <span>標籤</span>
            <ContactTagCreateButton />
          </div>
          <div className="space-y-1">
            {tags.map((tag) => (
              <ContactNavLink
                key={tag.id}
                href={buildContactHref(pathname, { q, status, tag: tag.id })}
                active={tagId === tag.id}
                icon={<Tags className="h-4 w-4" />}
                label={tag.name}
              />
            ))}
            {tags.length === 0 ? <p className="px-3 py-2 text-sm text-[#98a2b3]">尚未建立標籤</p> : null}
          </div>
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-auto shrink-0 flex-col gap-3 border-b border-[#d7dbe0] px-5 py-3 lg:h-14 lg:flex-row lg:items-center lg:justify-between lg:py-0">
          <form onSubmit={submitSearch} className="relative w-full max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98a2b3]" />
            <input
              name="q"
              defaultValue={q}
              placeholder="搜尋姓名、Instagram username、email"
              className="h-9 w-full rounded-md border border-[#d7dbe0] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#006fe6] focus:ring-2 focus:ring-[#dbeafe]"
            />
          </form>
          <div className="relative flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFilterOpen((current) => !current)}
              data-testid="contacts-filter-button"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d7dbe0] bg-white px-3 text-sm text-[#344054] hover:bg-[#f8fafc]"
              aria-expanded={isFilterOpen}
            >
              <Filter className="h-4 w-4" />
              篩選
              {status || tagId ? <span className="rounded-full bg-[#eef6ff] px-1.5 py-0.5 text-xs text-[#006fe6]">已套用</span> : null}
            </button>
            <Link href="/tags" className="inline-flex h-9 items-center gap-2 rounded-md bg-[#006fe6] px-3 text-sm font-medium text-white hover:bg-[#0057b8]">
              <Plus className="h-4 w-4" />
              新增標籤
            </Link>
            <button
              type="button"
              onClick={() => {
                setSegmentName(activeTag ? `${activeTag.name} 分眾` : q ? `${q} 搜尋分眾` : "Contacts 篩選分眾");
                setSegmentDescription("由聯絡人目前篩選條件建立。");
                setIsSegmentDialogOpen(true);
              }}
              data-testid="contacts-create-segment-button"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d7dbe0] bg-white px-3 text-sm text-[#344054] hover:bg-[#f8fafc]"
            >
              <Users className="h-4 w-4" />
              建立分眾
            </button>

            {isFilterOpen ? (
              <form
                onSubmit={applyFilter}
                className="absolute right-0 top-11 z-20 w-[min(360px,calc(100vw-2rem))] rounded-lg border border-[#d7dbe0] bg-white p-4 shadow-xl"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-[#111827]">篩選聯絡人</h2>
                  <button type="button" onClick={() => setIsFilterOpen(false)} aria-label="關閉篩選" className="rounded-md p-1 text-[#667085] hover:bg-[#f2f4f7]">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <label className="block text-sm font-medium text-[#344054]">
                  訂閱狀態
                  <select
                    data-testid="contacts-filter-status"
                    value={draftStatus}
                    onChange={(event) => setDraftStatus(event.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-[#d7dbe0] bg-white px-3 text-sm text-[#111827]"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="mt-3 block text-sm font-medium text-[#344054]">
                  標籤
                  <select
                    data-testid="contacts-filter-tag"
                    value={draftTagId}
                    onChange={(event) => setDraftTagId(event.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-[#d7dbe0] bg-white px-3 text-sm text-[#111827]"
                  >
                    <option value="">全部標籤</option>
                    {tags.map((tag) => (
                      <option key={tag.id} value={tag.id}>
                        {tag.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDraftStatus("");
                      setDraftTagId("");
                      updateFilters("", "");
                      setIsFilterOpen(false);
                    }}
                    className="h-9 rounded-md border border-[#d7dbe0] bg-white px-3 text-sm text-[#344054] hover:bg-[#f8fafc]"
                  >
                    清除
                  </button>
                  <button type="submit" className="h-9 rounded-md bg-[#006fe6] px-3 text-sm font-medium text-white hover:bg-[#0057b8]">
                    套用篩選
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        </header>

        {status || tagId || message || error ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[#eef0f2] bg-[#f8fafc] px-5 py-2 text-sm">
            {status ? <ActiveChip label={statusOptions.find((option) => option.value === status)?.label || status} href={buildContactHref(pathname, { q, tag: tagId })} /> : null}
            {activeTag ? <ActiveChip label={`標籤：${activeTag.name}`} href={buildContactHref(pathname, { q, status })} /> : null}
            {message ? <span className="rounded-md bg-green-50 px-3 py-1 text-green-700">{message}</span> : null}
            {error ? <span className="rounded-md bg-red-50 px-3 py-1 text-red-700">{error}</span> : null}
          </div>
        ) : null}

        {selectedIds.length > 0 ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[#d7dbe0] bg-[#fff7ed] px-5 py-3 text-sm">
            <span className="font-medium text-[#111827]">已選取 {selectedIds.length} 位聯絡人</span>
            <select
              value={batchTagId}
              onChange={(event) => setBatchTagId(event.target.value)}
              className="h-9 rounded-md border border-[#d7dbe0] bg-white px-3 text-sm text-[#111827]"
              aria-label="選擇批次加入的標籤"
            >
              {tags.length === 0 ? <option value="">尚未建立標籤</option> : null}
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={batchAddTag}
              disabled={isPending || !batchTagId}
              data-testid="contacts-batch-add-tag"
              className="h-9 rounded-md bg-[#006fe6] px-3 text-sm font-medium text-white hover:bg-[#0057b8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "處理中" : "批次加標籤"}
            </button>
            <button
              type="button"
              onClick={batchRemoveTag}
              disabled={isPending || !batchTagId}
              data-testid="contacts-batch-remove-tag"
              className="h-9 rounded-md border border-[#d7dbe0] bg-white px-3 text-sm font-medium text-[#344054] hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-60"
            >
              批次移除標籤
            </button>
            <button type="button" onClick={() => setSelectedIds([])} className="h-9 rounded-md border border-[#d7dbe0] bg-white px-3 text-sm text-[#344054] hover:bg-[#f8fafc]">
              取消選取
            </button>
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 z-10 border-b border-[#d7dbe0] bg-[#f8fafc] text-[#667085]">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" aria-label="選取全部聯絡人" checked={allVisibleSelected} onChange={toggleAllVisible} />
                </th>
                <th className="px-4 py-3">聯絡人</th>
                <th className="px-4 py-3">渠道</th>
                <th className="px-4 py-3">訂閱狀態</th>
                <th className="px-4 py-3">標籤</th>
                <th className="px-4 py-3">對話</th>
                <th className="px-4 py-3">最後互動</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f2] bg-white">
              {contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-[#f8fafc]">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      aria-label={`選取 ${contact.displayName}`}
                      checked={selectedSet.has(contact.id)}
                      onChange={() => toggleContact(contact.id)}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <Link href={`/contacts/${contact.id}`} className="font-semibold text-[#111827] hover:text-[#006fe6]">
                      {contact.displayName}
                    </Link>
                    <div className="mt-1 text-xs text-[#667085]">{contact.username ? `@${contact.username}` : contact.externalId}</div>
                  </td>
                  <td className="px-4 py-4 text-[#667085]">{contact.channelName}</td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-[#eef6ff] px-2 py-1 text-xs text-[#006fe6]">{contact.consentLabel}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {contact.tags.map((tag) => (
                        <span key={tag.id} className="rounded-full px-2 py-1 text-xs text-white" style={{ backgroundColor: tag.color }}>
                          {tag.name}
                        </span>
                      ))}
                      {contact.tags.length === 0 ? <span className="text-[#98a2b3]">-</span> : null}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[#667085]">{contact.conversationsCount}</td>
                  <td className="px-4 py-4 text-[#667085]">{contact.lastInteractionLabel}</td>
                </tr>
              ))}
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[#667085]">
                    目前沒有符合條件的聯絡人。
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {isSegmentDialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" role="dialog" aria-modal="true" aria-labelledby="contacts-segment-title">
          <div className="w-full max-w-md rounded-lg border border-[#d7dbe0] bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 id="contacts-segment-title" className="text-base font-semibold text-[#111827]">
                  建立分眾
                </h2>
                <p className="mt-1 text-sm text-[#667085]">會保存目前的搜尋字、訂閱狀態、標籤與選定 IG 帳號篩選。</p>
              </div>
              <button type="button" onClick={() => setIsSegmentDialogOpen(false)} aria-label="關閉建立分眾" className="rounded-md p-1 text-[#667085] hover:bg-[#f2f4f7]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <label className="block text-sm font-medium text-[#344054]">
              分眾名稱
              <input
                value={segmentName}
                onChange={(event) => setSegmentName(event.target.value)}
                data-testid="contacts-segment-name"
                className="mt-1 h-10 w-full rounded-md border border-[#d7dbe0] bg-white px-3 text-sm text-[#111827] outline-none focus:border-[#006fe6] focus:ring-2 focus:ring-[#dbeafe]"
              />
            </label>
            <label className="mt-3 block text-sm font-medium text-[#344054]">
              描述
              <textarea
                value={segmentDescription}
                onChange={(event) => setSegmentDescription(event.target.value)}
                data-testid="contacts-segment-description"
                rows={3}
                className="mt-1 w-full rounded-md border border-[#d7dbe0] bg-white px-3 py-2 text-sm text-[#111827] outline-none focus:border-[#006fe6] focus:ring-2 focus:ring-[#dbeafe]"
              />
            </label>
            <div className="mt-4 rounded-md bg-[#f8fafc] px-3 py-2 text-xs text-[#667085]">
              條件：{q ? `搜尋「${q}」` : "不限搜尋"} / {statusOptions.find((option) => option.value === status)?.label || "全部狀態"} /{" "}
              {activeTag ? `標籤「${activeTag.name}」` : "不限標籤"}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setIsSegmentDialogOpen(false)} className="h-9 rounded-md border border-[#d7dbe0] bg-white px-3 text-sm text-[#344054] hover:bg-[#f8fafc]">
                取消
              </button>
              <button
                type="button"
                onClick={createSegmentFromCurrentFilter}
                data-testid="contacts-confirm-create-segment"
                className="h-9 rounded-md bg-[#006fe6] px-3 text-sm font-medium text-white hover:bg-[#0057b8]"
              >
                建立
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ContactNavLink({
  icon,
  label,
  href,
  count,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  count?: number;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left ${
        active ? "bg-[#d7d7d7] font-semibold text-[#111827]" : "text-[#4b5563] hover:bg-[#eceff3]"
      }`}
    >
      <span className="text-[#667085]">{icon}</span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {typeof count === "number" ? <span className="text-xs text-[#667085]">{count}</span> : null}
    </Link>
  );
}

function ActiveChip({ label, href }: { label: string; href: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 rounded-full border border-[#d7dbe0] bg-white px-3 py-1 text-[#344054] hover:bg-[#f2f4f7]">
      {label}
      <X className="h-3.5 w-3.5" />
    </Link>
  );
}
