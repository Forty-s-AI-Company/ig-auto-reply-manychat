"use client";

import {
  Bell,
  Bot,
  CalendarClock,
  CheckCheck,
  ChevronDown,
  Clock,
  Filter,
  Heart,
  ImageIcon,
  Inbox,
  MessageCircle,
  Mic,
  MoreVertical,
  Search,
  Send,
  Smile,
  User,
  Users,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

type Tag = { id: string; name: string; color: string };
type TeamMember = { id: string; name: string; email: string };
type ContactFieldDefinition = { id: string; key: string; label: string; type: string };
type ContactFieldValue = { id: string; value: string; definition: ContactFieldDefinition };
type Conversation = {
  id: string;
  status: string;
  assignedToId?: string | null;
  reminderAt?: string | null;
  isFavorite?: boolean;
  assignedTo?: TeamMember | null;
  contact: {
    id: string;
    displayName: string;
    externalId: string;
    username?: string | null;
    email?: string | null;
    phone?: string | null;
    consentStatus?: string;
    tags: { tag: Tag }[];
    fieldValues?: ContactFieldValue[];
  };
  channel: { id: string; type: string; name: string };
  unreadCount?: number;
  lastReadAt?: string | null;
  messages: {
    id: string;
    direction: string;
    messageType?: string;
    text: string | null;
    createdAt: string;
    payloadJson?: unknown;
  }[];
};

type InboxCategory = "all" | "unassigned" | "assigned" | "reminders" | "favorites" | "hot" | "partners";
type StatusFilter = "open" | "all";
type InboxNotice = { tone: "success" | "danger" | "info"; message: string };

const NOT_SET = "未設定";
const HOT_TAG = "熱門名單";
const PARTNER_TAG = "合作夥伴";
const NOTICE_STYLES: Record<InboxNotice["tone"], string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  danger: "border-red-200 bg-red-50 text-red-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
};

function latestMessage(conversation: Conversation) {
  return conversation.messages[conversation.messages.length - 1]?.text || "尚無訊息";
}

function latestInboundText(conversation: Conversation) {
  return [...conversation.messages].reverse().find((message) => message.direction === "inbound" && message.text?.trim())?.text?.trim() || "";
}

function buildReplySuggestion(conversation: Conversation) {
  const inboundText = latestInboundText(conversation);
  const name = conversation.contact.displayName || conversation.contact.username || "您好";
  const firstName = name.trim().split(/\s+/)[0] || name;

  if (!inboundText) {
    return {
      text: "",
      reason: "目前這個對話沒有可參考的客戶訊息，請先手動輸入回覆內容。",
    };
  }

  if (/價格|價錢|費用|方案|多少|price|pricing/i.test(inboundText)) {
    return {
      text: `${firstName} 您好，謝謝詢問！目前可以先參考我們的方案頁面；如果您方便，也可以告訴我預計使用的人數與 Instagram 帳號數，我再幫您建議適合的方案。`,
      reason: "已依最新訊息產生價格詢問回覆草稿，送出前請再確認內容。",
    };
  }

  if (/怎麼|如何|教學|設定|連接|登入|login|connect|setup/i.test(inboundText)) {
    return {
      text: `${firstName} 您好，我可以協助您設定。請先確認目前使用的 Instagram 是商業或創作者帳號，並已連到對應的 Meta / Facebook 資產；如果畫面有錯誤訊息，也可以截圖給我，我會依照狀況協助排查。`,
      reason: "已依最新訊息產生設定協助回覆草稿，送出前請再確認內容。",
    };
  }

  if (/謝謝|感謝|thank/i.test(inboundText)) {
    return {
      text: `${firstName} 不客氣！如果後續還有任何問題，直接回覆這邊就可以，我們會再協助您。`,
      reason: "已依最新訊息產生致謝回覆草稿，送出前請再確認內容。",
    };
  }

  return {
    text: `${firstName} 您好，謝謝您的訊息！我先幫您確認內容，稍後會再回覆更完整的資訊。`,
    reason: "已依最新訊息產生一般回覆草稿，送出前請再確認內容。",
  };
}

function latestAt(conversation: Conversation) {
  const value = conversation.messages[conversation.messages.length - 1]?.createdAt;
  if (!value) return "";
  return new Intl.DateTimeFormat("zh-TW", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function initials(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || "U";
}

function hasInboundUnread(conversation: Conversation) {
  return Number(conversation.unreadCount || 0) > 0;
}

function hasTag(conversation: Conversation, tagName: string) {
  return conversation.contact.tags.some(({ tag }) => tag.name === tagName);
}

export function InboxClient({
  initialConversations,
  tags,
  teamMembers,
  contactFields,
  currentUserId,
}: {
  initialConversations: Conversation[];
  tags: Tag[];
  teamMembers: TeamMember[];
  contactFields: ContactFieldDefinition[];
  currentUserId: string;
}) {
  const [conversations, setConversations] = useState(initialConversations);
  const [fieldDefinitions, setFieldDefinitions] = useState(contactFields);
  const [selectedId, setSelectedId] = useState(initialConversations[0]?.id || "");
  const [query, setQuery] = useState("");
  const [text, setText] = useState("");
  const [activeTab, setActiveTab] = useState<"reply" | "note">("reply");
  const [reminderOpen, setReminderOpen] = useState(false);
  const [category, setCategory] = useState<InboxCategory>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("open");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [sortNewest, setSortNewest] = useState(true);
  const [channelFilter, setChannelFilter] = useState<"all" | "instagram">("all");
  const [showFilterHint, setShowFilterHint] = useState(false);
  const [selectedConversationIds, setSelectedConversationIds] = useState<Set<string>>(() => new Set());
  const [notice, setNotice] = useState<InboxNotice | null>(null);

  const hotTag = tags.find((tag) => tag.name === HOT_TAG);
  const partnerTag = tags.find((tag) => tag.name === PARTNER_TAG);

  useEffect(() => {
    function handleSearch(event: Event) {
      setQuery(String((event as CustomEvent).detail || ""));
    }
    window.addEventListener("inbox-search", handleSearch);
    return () => window.removeEventListener("inbox-search", handleSearch);
  }, []);

  useEffect(() => {
    async function handleChannelScopeChange(event: Event) {
      const channelId = String((event as CustomEvent).detail || "");
      if (!channelId) return;
      const response = await fetch(`/api/conversations?channelId=${encodeURIComponent(channelId)}&limit=25`, {
        cache: "no-store",
      });
      if (!response.ok) {
        showNotice("danger", await readError(response, "切換 IG 帳號後重新載入收件匣失敗。"));
        return;
      }
      const nextConversations = ((await response.json()) as Conversation[]).map((conversation) => ({
        ...conversation,
        messages: [...conversation.messages].reverse(),
      }));
      setConversations(nextConversations);
      setSelectedId(nextConversations[0]?.id || "");
      setSelectedConversationIds(new Set());
      setQuery("");
      setCategory("all");
      showNotice("info", "已切換 Instagram 帳號範圍。");
    }

    window.addEventListener("inbox-channel-scope-change", handleChannelScopeChange);
    return () => window.removeEventListener("inbox-channel-scope-change", handleChannelScopeChange);
  }, []);

  const counts = useMemo(() => {
    return {
      all: conversations.length,
      unassigned: conversations.filter((conversation) => !conversation.assignedToId).length,
      assigned: conversations.filter((conversation) => conversation.assignedToId === currentUserId).length,
      reminders: conversations.filter((conversation) => Boolean(conversation.reminderAt)).length,
      favorites: conversations.filter((conversation) => conversation.isFavorite).length,
      hot: conversations.filter((conversation) => hasTag(conversation, HOT_TAG)).length,
      partners: conversations.filter((conversation) => hasTag(conversation, PARTNER_TAG)).length,
      unread: conversations.filter(hasInboundUnread).length,
    };
  }, [conversations, currentUserId]);

  const filteredConversations = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return conversations
      .filter((conversation) => {
        if (category === "unassigned" && conversation.assignedToId) return false;
        if (category === "assigned" && conversation.assignedToId !== currentUserId) return false;
        if (category === "reminders" && !conversation.reminderAt) return false;
        if (category === "favorites" && !conversation.isFavorite) return false;
        if (category === "hot" && !hasTag(conversation, HOT_TAG)) return false;
        if (category === "partners" && !hasTag(conversation, PARTNER_TAG)) return false;
        if (statusFilter === "open" && conversation.status !== "open") return false;
        if (unreadOnly && !hasInboundUnread(conversation)) return false;
        if (channelFilter === "instagram" && conversation.channel.type.toLowerCase() !== "instagram") return false;
        if (!keyword) return true;
        return (
          conversation.contact.displayName.toLowerCase().includes(keyword) ||
          conversation.contact.externalId.toLowerCase().includes(keyword) ||
          latestMessage(conversation).toLowerCase().includes(keyword)
        );
      })
      .sort((a, b) => {
        const aTime = new Date(a.messages.at(-1)?.createdAt || 0).getTime();
        const bTime = new Date(b.messages.at(-1)?.createdAt || 0).getTime();
        return sortNewest ? bTime - aTime : aTime - bTime;
      });
  }, [category, channelFilter, conversations, currentUserId, query, sortNewest, statusFilter, unreadOnly]);

  const selected = useMemo(
    () =>
      filteredConversations.find((conversation) => conversation.id === selectedId) ||
      filteredConversations[0] ||
      conversations[0],
    [filteredConversations, conversations, selectedId],
  );
  const selectedVisibleIds = useMemo(
    () => filteredConversations.map((conversation) => conversation.id),
    [filteredConversations],
  );
  const visibleSelectedConversationIds = useMemo(
    () => new Set([...selectedConversationIds].filter((id) => selectedVisibleIds.includes(id))),
    [selectedConversationIds, selectedVisibleIds],
  );
  const selectedCount = visibleSelectedConversationIds.size;
  const allVisibleSelected =
    selectedVisibleIds.length > 0 && selectedVisibleIds.every((id) => visibleSelectedConversationIds.has(id));

  function showNotice(tone: InboxNotice["tone"], message: string) {
    setNotice({ tone, message });
  }

  function showComingSoon(feature: string) {
    showNotice("info", `${feature} 目前尚未開放；文字回覆、內部備註、指派、標籤與提醒已可使用。`);
  }

  function applyReplySuggestion() {
    if (!selected) return;
    const suggestion = buildReplySuggestion(selected);
    if (!suggestion.text) {
      showNotice("info", suggestion.reason);
      return;
    }
    setActiveTab("reply");
    setText(suggestion.text);
    showNotice("info", suggestion.reason);
  }

  async function readError(response: Response, fallback: string) {
    const data = await response.json().catch(() => ({}));
    return typeof data.error === "string" && data.error.trim() ? data.error : fallback;
  }

  function toggleConversationSelection(conversationId: string) {
    setSelectedConversationIds((current) => {
      const next = new Set(current);
      if (next.has(conversationId)) {
        next.delete(conversationId);
      } else {
        next.add(conversationId);
      }
      return next;
    });
  }

  function toggleSelectAllVisible() {
    setSelectedConversationIds((current) => {
      if (allVisibleSelected) return new Set();
      return new Set([...current, ...selectedVisibleIds]);
    });
  }

  function replaceConversation(updated: Conversation) {
    setConversations((current) =>
      current.map((conversation) => (conversation.id === updated.id ? updated : conversation)),
    );
  }

  async function refresh(id = selected?.id) {
    if (!id) return;
    const response = await fetch(`/api/conversations/${id}`);
    if (!response.ok) {
      showNotice("danger", await readError(response, "重新載入對話失敗，請稍後再試。"));
      return;
    }
    replaceConversation(await response.json());
  }

  async function updateConversation(payload: Partial<Pick<Conversation, "status" | "assignedToId" | "reminderAt" | "isFavorite" | "lastReadAt">>) {
    if (!selected) return;
    const response = await fetch(`/api/conversations/${selected.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      showNotice("danger", await readError(response, "對話更新失敗。"));
      return;
    }
    replaceConversation(await response.json());
    showNotice("success", "對話狀態已更新。");
  }

  async function sendMessage() {
    if (!selected || !text.trim()) return;
    const endpoint =
      activeTab === "note"
        ? `/api/conversations/${selected.id}/notes`
        : `/api/conversations/${selected.id}/messages`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) {
      const message = await readError(response, "訊息傳送失敗，請確認 Instagram 連線狀態或重新連接 IG 帳號。");
      showNotice("danger", activeTab === "note" ? `內部備註儲存失敗：${message}` : `Instagram 回覆未送出：${message}`);
      return;
    }
    setText("");
    await refresh(selected.id);
    showNotice("success", activeTab === "note" ? "內部備註已儲存。" : "訊息已送出到 Instagram。");
  }

  async function markRead() {
    if (!selected) return;
    await updateConversation({ lastReadAt: new Date().toISOString() });
  }

  async function markSelectedRead() {
    const ids = [...visibleSelectedConversationIds];
    if (!ids.length) return;
    const now = new Date().toISOString();
    for (const id of ids) {
      const response = await fetch(`/api/conversations/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lastReadAt: now }),
      });
      if (!response.ok) {
        showNotice("danger", await readError(response, "批次標記已讀失敗。"));
        return;
      }
      replaceConversation(await response.json());
    }
    setSelectedConversationIds(new Set());
    showNotice("success", `已將 ${ids.length} 則對話標記為已讀。`);
  }

  async function addTag(tagId: string) {
    if (!selected || !tagId) return;
    const response = await fetch(`/api/contacts/${selected.contact.id}/tags`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tagId }),
    });
    if (!response.ok) {
      showNotice("danger", await readError(response, "新增標籤失敗。"));
      return;
    }
    await refresh(selected.id);
    showNotice("success", "標籤已加入聯絡人。");
  }

  async function removeTag(tagId: string) {
    if (!selected) return;
    const response = await fetch(`/api/contacts/${selected.contact.id}/tags?tagId=${tagId}`, { method: "DELETE" });
    if (!response.ok) {
      showNotice("danger", await readError(response, "移除標籤失敗。"));
      return;
    }
    await refresh(selected.id);
    showNotice("success", "標籤已從聯絡人移除。");
  }

  async function toggleSystemTag(tag: Tag | undefined) {
    if (!selected || !tag) return;
    if (selected.contact.tags.some((item) => item.tag.id === tag.id)) {
      await removeTag(tag.id);
    } else {
      await addTag(tag.id);
    }
  }

  function addReminder(minutes: number) {
    // 由使用者點擊提醒選單時才計算時間，並立即寫回後端保存。
    const reminderAt = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    updateConversation({ reminderAt });
    setReminderOpen(false);
    setCategory("reminders");
  }

  return (
    <div
      className="flex h-[calc(100vh-100px)] min-h-0 flex-col overflow-hidden rounded-lg border border-[#d7dbe0] bg-white text-[#111827]"
      data-testid="inbox-client"
      data-ready="true"
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-[#d7dbe0] bg-white p-3 sm:hidden">
        <label className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98a2b3]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-10 w-full rounded-md border border-[#d7dbe0] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#006fe6]"
            placeholder="搜尋對話"
            data-testid="inbox-mobile-search"
          />
        </label>
        <button
          type="button"
          onClick={() => setShowFilterHint((current) => !current)}
          className={`h-10 shrink-0 rounded-md border px-3 text-sm ${
            showFilterHint ? "border-[#0057b8] bg-[#eef6ff] text-[#0057b8]" : "border-[#d7dbe0] text-[#344054]"
          }`}
          data-testid="inbox-mobile-filter-button"
        >
          篩選
        </button>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-[224px_minmax(0,1fr)]">
        <aside className="border-r border-[#d7dbe0] bg-[#f7f7f7]">
          <div className="space-y-1 p-3 text-sm">
            <InboxNavItem active={category === "all"} icon={<Inbox className="h-4 w-4" />} label="全部對話" count={counts.all} onClick={() => setCategory("all")} />
            <InboxNavItem active={category === "unassigned"} icon={<Bell className="h-4 w-4" />} label="未指派" count={counts.unassigned} dot onClick={() => setCategory("unassigned")} />
            <InboxNavItem active={category === "assigned"} icon={<User className="h-4 w-4" />} label="指派給我" count={counts.assigned} onClick={() => setCategory("assigned")} />
            <InboxNavItem active={category === "reminders"} icon={<Clock className="h-4 w-4" />} label="提醒" count={counts.reminders} onClick={() => setCategory("reminders")} />
          </div>

          <div className="border-t border-[#e4e7ec] px-3 py-4">
            <div className="mb-2 flex items-center justify-between text-xs font-medium text-[#667085]">
              <span>標籤</span>
              <Link
                href="/contacts"
                className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-[#d7dbe0] text-base leading-none text-[#006fe6] hover:bg-white"
                aria-label="前往聯絡人管理標籤"
                title="前往聯絡人管理標籤"
              >
                +
              </Link>
            </div>
            <div className="space-y-1 text-sm">
              <InboxNavItem active={category === "favorites"} icon={<Heart className="h-4 w-4" />} label="收藏" count={counts.favorites} onClick={() => setCategory("favorites")} />
              <InboxNavItem active={category === "hot"} icon={<span className="text-base">🔥</span>} label="熱門名單" count={counts.hot} onClick={() => setCategory("hot")} />
              <InboxNavItem active={category === "partners"} icon={<span className="text-base">🤝</span>} label="合作夥伴" count={counts.partners} onClick={() => setCategory("partners")} />
            </div>
          </div>

          <div className="border-t border-[#e4e7ec] px-3 py-4">
            <p className="mb-2 text-xs font-medium text-[#667085]">團隊</p>
            <div className="space-y-1 text-sm">
              <InboxNavItem icon={<Users className="h-4 w-4" />} label="所有人" count={teamMembers.length} onClick={() => setCategory("all")} />
              {teamMembers.map((member) => (
                <InboxNavItem
                  key={member.id}
                  icon={<User className="h-4 w-4" />}
                  label={member.name || member.email}
                  count={conversations.filter((conversation) => conversation.assignedToId === member.id).length}
                  onClick={() => {
                    if (member.id === currentUserId) setCategory("assigned");
                  }}
                />
              ))}
            </div>
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-col">
          <header className="relative flex h-14 shrink-0 items-center gap-2 border-b border-[#d7dbe0] bg-white px-5">
            <input
              type="checkbox"
              className="mr-1 h-4 w-4 rounded border-[#d7dbe0]"
              aria-label="選取全部對話"
              checked={allVisibleSelected}
              disabled={selectedVisibleIds.length === 0}
              onChange={toggleSelectAllVisible}
              data-testid="inbox-select-all"
            />
            {selectedCount > 0 ? (
              <ToolbarButton onClick={markSelectedRead}>標記已讀 {selectedCount}</ToolbarButton>
            ) : null}
            <ToolbarButton active={statusFilter === "open"} icon={<MessageCircle className="h-4 w-4" />} onClick={() => setStatusFilter((current) => (current === "open" ? "all" : "open"))}>
              {statusFilter === "open" ? "開啟對話" : "全部狀態"}
            </ToolbarButton>
            <ToolbarButton active={unreadOnly} onClick={() => setUnreadOnly((current) => !current)}>
              未讀 {counts.unread > 0 ? counts.unread : ""}
            </ToolbarButton>
            <ToolbarButton onClick={() => setSortNewest((current) => !current)}>
              {sortNewest ? "最新排序" : "最舊排序"}
            </ToolbarButton>
            <ToolbarButton active={channelFilter === "instagram"} onClick={() => setChannelFilter((current) => (current === "instagram" ? "all" : "instagram"))}>
              {channelFilter === "instagram" ? "Instagram" : "所有渠道"}
            </ToolbarButton>
            <ToolbarButton active={showFilterHint} icon={<Filter className="h-4 w-4" />} onClick={() => setShowFilterHint((current) => !current)}>
              篩選
            </ToolbarButton>
            {showFilterHint ? (
              <div
                className="fixed left-4 right-4 top-20 z-50 w-auto rounded-md border border-[#d7dbe0] bg-white p-3 text-xs text-[#667085] shadow-lg sm:absolute sm:left-[468px] sm:right-auto sm:top-11 sm:w-72"
                data-testid="inbox-filter-panel"
              >
                <p className="mb-3 font-semibold text-[#111827]">收件匣篩選</p>
                <label className="mb-2 block">
                  <span className="mb-1 block">狀態</span>
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                    className="h-8 w-full rounded-md border border-[#d7dbe0] bg-white px-2"
                    data-testid="inbox-filter-status"
                  >
                    <option value="open">只看開啟對話</option>
                    <option value="all">全部狀態</option>
                  </select>
                </label>
                <label className="mb-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={unreadOnly}
                    onChange={(event) => setUnreadOnly(event.target.checked)}
                    data-testid="inbox-filter-unread"
                  />
                  只看未讀
                </label>
                <label className="mb-3 block">
                  <span className="mb-1 block">排序</span>
                  <select
                    value={sortNewest ? "newest" : "oldest"}
                    onChange={(event) => setSortNewest(event.target.value === "newest")}
                    className="h-8 w-full rounded-md border border-[#d7dbe0] bg-white px-2"
                    data-testid="inbox-filter-sort"
                  >
                    <option value="newest">最新優先</option>
                    <option value="oldest">最舊優先</option>
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setCategory("all");
                    setStatusFilter("open");
                    setUnreadOnly(false);
                    setSortNewest(true);
                    setChannelFilter("all");
                    showNotice("info", "已重設 Inbox 篩選條件。");
                  }}
                  className="h-8 w-full rounded-md border border-[#d7dbe0] text-[#344054] hover:bg-[#f8fafc]"
                >
                  重設篩選
                </button>
                <button
                  type="button"
                  onClick={() => setShowFilterHint(false)}
                  className="mt-2 h-8 w-full rounded-md bg-[#006fe6] text-white sm:hidden"
                  data-testid="inbox-close-filter-panel"
                >
                  完成
                </button>
              </div>
            ) : null}
          </header>
          {notice ? (
            <div
              role="status"
              data-testid="inbox-notice"
              className={`mx-5 mt-3 rounded-md border px-3 py-2 text-sm ${NOTICE_STYLES[notice.tone]}`}
            >
              {notice.message}
            </div>
          ) : null}

          <div className="grid min-h-0 flex-1 grid-cols-[320px_minmax(420px,1fr)_300px]">
            <aside className="min-h-0 overflow-auto border-r border-[#d7dbe0] bg-white">
              <div className="divide-y divide-[#eef0f2]">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedId(conversation.id)}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter" && event.key !== " ") return;
                      event.preventDefault();
                      setSelectedId(conversation.id);
                    }}
                    data-testid="inbox-conversation-row"
                    data-conversation-id={conversation.id}
                    className={`flex w-full gap-3 px-4 py-4 text-left hover:bg-[#f6f8fb] ${
                      selected?.id === conversation.id ? "bg-[#f2f4f7]" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedConversationIds.has(conversation.id)}
                      onClick={(event) => event.stopPropagation()}
                      onChange={() => toggleConversationSelection(conversation.id)}
                      aria-label={`選取 ${conversation.contact.displayName}`}
                      className="mt-3 h-4 w-4 shrink-0 rounded border-[#d7dbe0]"
                    />
                    <Avatar name={conversation.contact.displayName} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-[#111827]">{conversation.contact.displayName}</p>
                        <span className="text-xs text-[#667085]" suppressHydrationWarning>
                          {latestAt(conversation)}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm text-[#667085]">{latestMessage(conversation)}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-[#006fe6]">
                        <span>Instagram</span>
                        {conversation.isFavorite ? <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" /> : null}
                        {conversation.reminderAt ? <Clock className="h-3.5 w-3.5 text-[#667085]" /> : null}
                      </div>
                    </div>
                  </div>
                ))}
                {filteredConversations.length === 0 ? (
                  <p className="px-4 py-8 text-sm text-[#667085]">目前沒有符合條件的對話。</p>
                ) : null}
              </div>
            </aside>

            <section className="flex min-h-0 min-w-0 flex-col bg-white">
              {selected ? (
                <>
                  <div className="flex h-[58px] items-center justify-between border-b border-[#d7dbe0] px-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={selected.contact.displayName} small />
                      <select
                        value={selected.assignedToId || ""}
                        onChange={(event) => updateConversation({ assignedToId: event.target.value || null })}
                        className="rounded-md border-0 bg-transparent px-1 py-1 text-sm text-[#667085] outline-none"
                        aria-label="指派對象"
                      >
                        <option value="">未指派</option>
                        {teamMembers.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name || member.email}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="h-4 w-4 text-[#98a2b3]" />
                    </div>

                    <div className="relative flex items-center gap-3 text-[#667085]">
                      <button type="button" onClick={() => showComingSoon("視訊通話")} className="p-1" title="視訊通話">
                        <Video className="h-5 w-5" />
                      </button>
                      <button type="button" onClick={() => updateConversation({ isFavorite: !selected.isFavorite })} className="p-1" title="收藏">
                        <Heart className={`h-5 w-5 ${selected.isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setReminderOpen((current) => !current)}
                        className={reminderOpen ? "rounded border border-red-500 p-1 text-[#111827]" : "p-1"}
                        title="提醒"
                      >
                        <CalendarClock className="h-5 w-5" />
                      </button>
                      <button type="button" onClick={markRead} className="p-1" title="標記已讀">
                        <CheckCheck className="h-5 w-5" />
                      </button>
                      <button type="button" onClick={() => showComingSoon("更多對話操作")} className="p-1" title="更多操作">
                        <MoreVertical className="h-5 w-5" />
                      </button>

                      {reminderOpen ? (
                        <div className="absolute right-6 top-9 z-20 w-48 rounded-md border border-[#d7dbe0] bg-white py-2 text-sm shadow-xl">
                          <p className="px-3 py-2 text-[#667085]">提醒我</p>
                          {[
                            { label: "20 分鐘", minutes: 20 },
                            { label: "1 小時", minutes: 60 },
                            { label: "6 小時", minutes: 360 },
                            { label: "12 小時", minutes: 720 },
                          ].map((item) => (
                            <button key={item.label} type="button" className="block w-full px-3 py-2 text-left hover:bg-[#f2f4f7]" onClick={() => addReminder(item.minutes)}>
                              {item.label}
                            </button>
                          ))}
                          <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-[#f2f4f7]" onClick={() => addReminder(1440)}>
                            <CalendarClock className="h-4 w-4" />
                            選擇日期與時間
                          </button>
                          {selected.reminderAt ? (
                            <button type="button" className="block w-full px-3 py-2 text-left text-red-600 hover:bg-[#fff1f2]" onClick={() => updateConversation({ reminderAt: null })}>
                              清除提醒
                            </button>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="border-b border-[#d7dbe0] px-5 py-3">
                    <div className="inline-flex items-center gap-2 border-b-2 border-[#006fe6] pb-2 text-sm font-semibold">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-orange-400 text-[10px] text-white">
                        IG
                      </span>
                      Instagram
                    </div>
                  </div>

                  <div className="min-h-0 flex-1 overflow-auto px-6 py-5">
                    <p className="mb-5 text-center text-xs text-[#98a2b3]">今天</p>
                    <div className="space-y-4">
                      {selected.messages.map((message) => (
                        <div
                          key={message.id}
                          className={
                            message.messageType === "system"
                              ? "flex justify-center"
                              : message.direction === "outbound"
                                ? "flex justify-end"
                                : "flex justify-start"
                          }
                        >
                          <div
                            className={`max-w-[72%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                              message.messageType === "system"
                                ? "border border-amber-200 bg-amber-50 text-amber-900"
                                : message.direction === "outbound"
                                  ? "bg-[#eaf3ff] text-[#111827]"
                                  : "bg-[#f2f4f7] text-[#111827]"
                            }`}
                          >
                            {message.messageType === "system" ? (
                              <p className="mb-1 text-xs font-semibold text-amber-700">內部備註</p>
                            ) : null}
                            <p className="whitespace-pre-wrap">{message.text || "空白訊息"}</p>
                            <p className="mt-1 text-right text-[11px] text-[#98a2b3]" suppressHydrationWarning>
                              {dateLabel(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-[#d7dbe0] bg-white">
                    <div className="flex border-b border-[#eef0f2] px-4">
                      <button
                        type="button"
                        onClick={() => setActiveTab("reply")}
                        className={`px-3 py-3 text-sm ${activeTab === "reply" ? "border-b-2 border-[#006fe6] text-[#111827]" : "text-[#667085]"}`}
                      >
                        回覆
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("note")}
                        className={`px-3 py-3 text-sm ${activeTab === "note" ? "border-b-2 border-[#006fe6] text-[#111827]" : "text-[#667085]"}`}
                      >
                        備註
                      </button>
                    </div>
                    <div className="p-4">
                      <textarea
                        value={text}
                        onChange={(event) => setText(event.target.value)}
                        className="h-20 w-full resize-none border-0 bg-white text-sm outline-none"
                        placeholder={activeTab === "reply" ? "在這裡回覆" : "輸入內部備註"}
                        data-testid="inbox-composer-textarea"
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-[#667085]">
                          <ComposerIconButton label="表情符號" onClick={() => showComingSoon("表情符號")} icon={<Smile className="h-5 w-5" />} />
                          <ComposerIconButton label="圖片上傳" onClick={() => showComingSoon("圖片上傳")} icon={<ImageIcon className="h-5 w-5" />} />
                          <ComposerIconButton label="語音訊息" onClick={() => showComingSoon("語音訊息")} icon={<Mic className="h-5 w-5" />} />
                          <ComposerIconButton label="AI 回覆建議" onClick={applyReplySuggestion} icon={<Bot className="h-5 w-5" />} />
                        </div>
                        <button
                          type="button"
                          onClick={sendMessage}
                          disabled={!text.trim()}
                          className="inline-flex items-center gap-2 rounded-md bg-[#006fe6] px-4 py-2 text-sm font-medium text-white disabled:bg-[#cfe2ff] disabled:text-white"
                          data-testid="inbox-send-message"
                        >
                          {activeTab === "note" ? "儲存內部備註" : "傳送到 Instagram"}
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="p-6 text-sm text-[#667085]">目前沒有可顯示的對話。</p>
              )}
            </section>

            <aside className="min-h-0 overflow-auto border-l border-[#d7dbe0] bg-white">
              {selected ? (
                <ContactPanel
                  key={`${selected.id}:${(selected.contact.fieldValues || []).map((item) => `${item.definition.id}:${item.value}`).join("|")}`}
                  selected={selected}
                  tags={tags}
                  fieldDefinitions={fieldDefinitions}
                  hotTag={hotTag}
                  partnerTag={partnerTag}
                  addTag={addTag}
                  removeTag={removeTag}
                  toggleSystemTag={toggleSystemTag}
                  onFieldDefinitionsChange={setFieldDefinitions}
                  onRefresh={() => refresh(selected.id)}
                  onNotice={showNotice}
                />
              ) : null}
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

function InboxNavItem({
  icon,
  label,
  count,
  active = false,
  dot = false,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  count?: number;
  active?: boolean;
  dot?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left ${
        active ? "bg-[#d7d7d7] font-semibold text-[#111827]" : "text-[#4b5563] hover:bg-[#eceff3]"
      }`}
    >
      <span className="text-[#667085]">{icon}</span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-[#006fe6]" /> : null}
      {typeof count === "number" ? <span className="text-xs text-[#667085]">{count}</span> : null}
    </button>
  );
}

function ToolbarButton({
  children,
  icon,
  active = false,
  onClick,
}: {
  children: ReactNode;
  icon?: ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs ${
        active
          ? "border-[#0057b8] bg-[#eef6ff] text-[#0057b8]"
          : "border-[#d7dbe0] bg-white text-[#344054] hover:bg-[#f8fafc]"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function ComposerIconButton({ label, icon, onClick }: { label: string; icon: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-md p-1 hover:bg-[#f2f4f7]" aria-label={label} title={label}>
      {icon}
    </button>
  );
}

function Avatar({ name, small = false }: { name: string; small?: boolean }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-300 to-amber-500 font-bold text-white ${
        small ? "h-7 w-7 text-xs" : "h-10 w-10 text-sm"
      }`}
    >
      {initials(name)}
    </div>
  );
}

function ContactPanel({
  selected,
  tags,
  fieldDefinitions,
  hotTag,
  partnerTag,
  addTag,
  removeTag,
  toggleSystemTag,
  onFieldDefinitionsChange,
  onRefresh,
  onNotice,
}: {
  selected: Conversation;
  tags: Tag[];
  fieldDefinitions: ContactFieldDefinition[];
  hotTag?: Tag;
  partnerTag?: Tag;
  addTag: (tagId: string) => void;
  removeTag: (tagId: string) => void;
  toggleSystemTag: (tag: Tag | undefined) => void;
  onFieldDefinitionsChange: (fields: ContactFieldDefinition[]) => void;
  onRefresh: () => void;
  onNotice: (tone: InboxNotice["tone"], message: string) => void;
}) {
  const selectedTagIds = new Set(selected.contact.tags.map(({ tag }) => tag.id));
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() =>
    Object.fromEntries((selected.contact.fieldValues || []).map((item) => [item.definition.id, item.value])),
  );

  async function createField() {
    const label = newFieldLabel.trim();
    if (!label) return;
    const asciiKey = label
      .normalize("NFKD")
      .replace(/[^\w]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 40);
    const key = /^[a-zA-Z]/.test(asciiKey) ? asciiKey : `field_${Date.now().toString(36)}`;
    const response = await fetch("/api/contact-fields", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key, label, type: "text" }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      onNotice("danger", typeof data.error === "string" ? data.error : "新增自訂欄位失敗。");
      return;
    }
    onFieldDefinitionsChange([...fieldDefinitions, data]);
    setNewFieldLabel("");
    onNotice("success", "自訂欄位已新增。");
  }

  async function saveField(definitionId: string) {
    const response = await fetch(`/api/contacts/${selected.contact.id}/fields`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ definitionId, value: fieldValues[definitionId] || "" }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      onNotice("danger", typeof data.error === "string" ? data.error : "儲存自訂欄位失敗。");
      return;
    }
    onRefresh();
    onNotice("success", "自訂欄位已儲存。");
  }

  return (
    <div className="h-full overflow-auto">
      <div className="border-b border-[#d7dbe0] p-4 text-right">
        <button
          type="button"
          onClick={() => onNotice("info", "更多聯絡人操作尚未開放；目前可使用標籤、自訂欄位與詳情頁管理。")}
          className="ml-auto flex rounded-md p-1 text-[#667085] hover:bg-[#f2f4f7]"
          aria-label="更多聯絡人操作"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>

      <div className="border-b border-[#d7dbe0] px-4 py-6 text-center">
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-lg bg-[#f9aa2b] text-4xl">🤖</div>
        <p className="mt-4 text-sm text-green-700">
          已訂閱 <span className="text-[#667085]">(取消訂閱)</span>
        </p>
        <p className="mt-2 text-sm text-[#667085]">聯絡時間：未知</p>
        <p className="mt-2 text-sm text-[#667085]">{selected.contact.externalId}</p>
        <p className="mt-2 text-sm text-[#667085]">透過 Instagram 訂閱</p>
        <p className="mt-1 text-sm font-medium text-[#006fe6]">
          {selected.contact.username ? `@${selected.contact.username}` : selected.contact.displayName}
        </p>
        <Link href={`/contacts/${selected.contact.id}`} className="mt-4 inline-flex rounded-md border border-[#d7dbe0] px-3 py-2 text-xs text-[#006fe6] hover:bg-[#f8fafc]">
          所有渠道紀錄
        </Link>
      </div>

      <PanelSection title="自動化">
        <button
          type="button"
          onClick={() => onNotice("info", "自動化暫停會在流程級控制完成後開放；目前請到自動化頁管理流程。")}
          className="h-9 w-full rounded-md border border-[#d7dbe0] text-sm hover:bg-[#f8fafc]"
        >
          暫停
        </button>
      </PanelSection>

      <PanelSection title="快速分類">
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => toggleSystemTag(hotTag)} className="rounded-md border border-[#d7dbe0] px-2 py-2 text-sm hover:bg-[#f8fafc]">
            🔥 {hotTag && selectedTagIds.has(hotTag.id) ? "移出熱門" : "加入熱門"}
          </button>
          <button type="button" onClick={() => toggleSystemTag(partnerTag)} className="rounded-md border border-[#d7dbe0] px-2 py-2 text-sm hover:bg-[#f8fafc]">
            🤝 {partnerTag && selectedTagIds.has(partnerTag.id) ? "移出夥伴" : "加入夥伴"}
          </button>
        </div>
      </PanelSection>

      <PanelSection
        title="聯絡人標籤"
        action={
          <select value="" onChange={(event) => addTag(event.target.value)} className="text-xs text-[#006fe6]">
            <option value="">+ 新增標籤</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
        }
      >
        <div className="flex flex-wrap gap-2">
          {selected.contact.tags.map(({ tag }) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => removeTag(tag.id)}
              className="rounded-full px-2 py-1 text-xs text-white"
              style={{ backgroundColor: tag.color }}
              title="移除標籤"
            >
              {tag.name}
            </button>
          ))}
          {selected.contact.tags.length === 0 ? <p className="text-sm text-[#98a2b3]">尚未加入標籤</p> : null}
        </div>
      </PanelSection>

      <PanelSection
        title="訂閱到序列"
        action={
          <Link href="/sequences" className="text-xs text-[#006fe6] hover:underline">
            訂閱
          </Link>
        }
      >
        <p className="text-sm text-[#98a2b3]">尚未訂閱序列</p>
      </PanelSection>

      <PanelSection title="訂閱來源">
        <span className="rounded-full bg-[#eef6ff] px-3 py-1 text-sm text-[#667085]">Instagram</span>
      </PanelSection>

      <PanelSection title="系統欄位">
        <SystemField label="名字" value={selected.contact.displayName || NOT_SET} />
        <SystemField label="姓氏" value={NOT_SET} />
        <SystemField label="電子郵件" value={selected.contact.email || NOT_SET} />
        <SystemField label="電話" value={selected.contact.phone || NOT_SET} />
      </PanelSection>
      <PanelSection title="自訂欄位">
        <div className="space-y-3">
          {fieldDefinitions.map((field) => (
            <label key={field.id} className="block text-sm">
              <span className="mb-1 block text-[#667085]">{field.label}</span>
              <div className="flex gap-2">
                <input
                  value={fieldValues[field.id] || ""}
                  onChange={(event) => setFieldValues((current) => ({ ...current, [field.id]: event.target.value }))}
                  className="min-w-0 flex-1 rounded-md border border-[#d7dbe0] px-2 py-1.5 text-sm outline-none focus:border-[#006fe6]"
                />
                <button
                  type="button"
                  onClick={() => saveField(field.id)}
                  className="rounded-md border border-[#d7dbe0] px-2 py-1.5 text-xs text-[#006fe6] hover:bg-[#f8fafc]"
                >
                  儲存
                </button>
              </div>
            </label>
          ))}
          {fieldDefinitions.length === 0 ? <p className="text-sm text-[#98a2b3]">尚未建立自訂欄位。</p> : null}
          <div className="flex gap-2 border-t border-[#eef0f2] pt-3">
            <input
              value={newFieldLabel}
              onChange={(event) => setNewFieldLabel(event.target.value)}
              placeholder="新增欄位，例如：課程興趣"
              className="min-w-0 flex-1 rounded-md border border-[#d7dbe0] px-2 py-1.5 text-sm outline-none focus:border-[#006fe6]"
            />
            <button
              type="button"
              onClick={createField}
              className="rounded-md bg-[#006fe6] px-2 py-1.5 text-xs font-medium text-white"
            >
              新增
            </button>
          </div>
        </div>
      </PanelSection>
    </div>
  );
}

function PanelSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-[#d7dbe0] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-medium text-[#111827]">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function SystemField({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-2 rounded-full border border-[#d7dbe0] px-3 py-1.5 text-sm text-[#667085]">
      {label}: <span className={value === NOT_SET ? "text-[#b3c7e8]" : "text-[#111827]"}>{value}</span>
    </div>
  );
}
