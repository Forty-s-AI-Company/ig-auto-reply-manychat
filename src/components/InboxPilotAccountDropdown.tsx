"use client";

import { ChevronDown, Pin, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";

type Workspace = {
  id: string;
  name: string;
};

type Channel = {
  id: string;
  name: string;
  displayName?: string;
  subtitle?: string;
  username?: string;
  avatarUrl?: string;
  avatarFallback?: string;
  metadataStatus?: "complete" | "partial";
};

type InboxPilotAccountDropdownProps = {
  workspaces: Workspace[];
  selectedWorkspaceId: string;
  channels: Channel[];
  selectedChannelId?: string;
};

const PINNED_ACCOUNTS_STORAGE_KEY = "inboxpilot_pinned_instagram_accounts";

export function InboxPilotAccountDropdown({ channels, selectedChannelId }: InboxPilotAccountDropdownProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const channelIds = useMemo(() => new Set(channels.map((channel) => channel.id)), [channels]);
  const sanitizePinnedIds = useCallback((value: unknown) => {
    if (!Array.isArray(value)) return [];
    return value.filter((id): id is string => typeof id === "string" && channelIds.has(id));
  }, [channelIds]);
  const [open, setOpen] = useState(false);
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(PINNED_ACCOUNTS_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return sanitizePinnedIds(parsed);
    } catch {
      return [];
    }
  });
  const [isPending, startTransition] = useTransition();
  const safePinnedIds = useMemo(() => sanitizePinnedIds(pinnedIds), [pinnedIds, sanitizePinnedIds]);
  const sortedChannels = useMemo(
    () =>
      [...channels].sort((a, b) => {
        const aPinned = safePinnedIds.includes(a.id);
        const bPinned = safePinnedIds.includes(b.id);
        if (aPinned !== bPinned) return aPinned ? -1 : 1;
        return 0;
      }),
    [channels, safePinnedIds],
  );
  const selectedChannel = sortedChannels.find((channel) => channel.id === selectedChannelId);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  useEffect(() => {
    if (safePinnedIds.length !== pinnedIds.length) {
      window.localStorage.setItem(PINNED_ACCOUNTS_STORAGE_KEY, JSON.stringify(safePinnedIds));
    }
  }, [pinnedIds.length, safePinnedIds]);

  async function changeAccount(channelId: string) {
    const response = await fetch("/api/account-scope", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ channelId }),
    });
    if (!response.ok) return;
    setOpen(false);
    startTransition(() => router.refresh());
  }

  function togglePinned(channelId: string) {
    if (!channelIds.has(channelId)) return;
    setPinnedIds((current) => {
      const next = current.includes(channelId)
        ? current.filter((id) => id !== channelId)
        : [channelId, ...current.filter((id) => channelIds.has(id))];
      window.localStorage.setItem(PINNED_ACCOUNTS_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  const currentChannel = selectedChannel || sortedChannels[0];
  const currentName = currentChannel?.displayName || currentChannel?.name || "尚未連接平台帳號";
  return (
    <div ref={rootRef} className="relative z-50">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`flex h-11 w-full items-center gap-2 rounded-md border px-2 text-left transition ${
          open ? "border-white/18 bg-white/12" : "border-transparent bg-white/5 hover:bg-white/10"
        }`}
        aria-expanded={open}
      >
        <InstagramAvatar channel={currentChannel} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-white">{currentName}</p>
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#9bd6d9] transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+6px)] z-[90] w-full min-w-[260px] max-w-[calc(100vw-32px)] overflow-hidden rounded-md border border-[#d6dae0] bg-white text-[#111827] shadow-[0_18px_42px_rgba(2,23,24,0.22)]">
          <div className="max-h-[312px] overflow-y-auto p-1.5">
            {sortedChannels.length > 0 ? (
              sortedChannels.map((channel) => {
                const pinned = safePinnedIds.includes(channel.id);
                return (
                <button
                  key={channel.id}
                  type="button"
                  disabled={isPending}
                  onClick={() => changeAccount(channel.id)}
                  className={`flex h-[52px] w-full items-center gap-3 rounded-sm border px-2 text-left text-sm ${
                    channel.id === selectedChannelId || (!selectedChannelId && channel.id === sortedChannels[0]?.id)
                      ? "border-[#b6eef2] bg-[var(--primary-soft)]"
                      : "border-transparent hover:bg-[#f5f7fa]"
                  }`}
                >
                  <InstagramAvatar channel={channel} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <span className="truncate text-sm font-medium text-[#34363a]">{channel.displayName || channel.name}</span>
                      <PlanBadge />
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-[#667085]">
                      {channel.subtitle || (channel.username ? `@${channel.username}` : "尚未取得帳號資料")}
                    </p>
                  </div>
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={pinned ? "取消釘選帳號" : "釘選帳號"}
                    title={pinned ? "取消釘選帳號" : "釘選帳號"}
                    onClick={(event) => {
                      event.stopPropagation();
                      togglePinned(channel.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter" && event.key !== " ") return;
                      event.preventDefault();
                      event.stopPropagation();
                      togglePinned(channel.id);
                    }}
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md hover:bg-white ${
                      pinned ? "text-[var(--teal-dark)]" : "text-[#344054]"
                    }`}
                  >
                    <Pin className="h-4 w-4" fill={pinned ? "currentColor" : "none"} />
                  </span>
                </button>
              );
              })
            ) : (
              <div className="flex h-[52px] items-center gap-3 rounded-sm border border-dashed border-[#d6dae0] px-2 text-sm text-[#667085]">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eef0f3] text-[10px] font-black text-[#667085]">IG</div>
                <span>尚未連接平台帳號</span>
              </div>
            )}
          </div>
          <div className="border-t border-[#e6e9ee] p-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push("/channels/connect");
              }}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-white px-3 text-sm font-medium text-[#34363a] hover:bg-[var(--primary-soft)]"
            >
              <Plus className="h-4 w-4" />
              新增平台帳號
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function InstagramAvatar({ channel, size }: { channel?: Channel; size: "sm" | "md" }) {
  const box = size === "sm" ? "h-8 w-8 text-[10px]" : "h-9 w-9 text-[10px]";
  const badgeClass = size === "sm" ? "left-[5px] -top-[3px]" : "left-[6px] -top-[3px]";

  return (
    <div className={`relative shrink-0 ${box}`}>
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] font-black text-white">
        {channel?.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={channel.avatarUrl} alt={channel.displayName || channel.name || "Instagram"} className="h-full w-full object-cover" />
        ) : (
          channel?.avatarFallback || "IG"
        )}
      </div>
      {channel?.metadataStatus === "partial" ? (
        <span
          className="absolute -right-1 bottom-0 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-white bg-amber-400 text-[8px] font-black text-amber-950"
          title="尚未取得完整帳號名稱與頭像"
          aria-label="尚未取得完整帳號名稱與頭像"
        >
          !
        </span>
      ) : null}
      <PlanBadge className={`absolute ${badgeClass} z-20`} compact />
    </div>
  );
}

function PlanBadge({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-[3px] border border-white bg-[var(--primary)] font-black text-[#063a3d] shadow-[0_0_0_0.5px_rgba(0,0,0,0.08)] ${className}`}
      style={{
        minWidth: compact ? 23 : 25,
        height: compact ? 12 : 14,
        paddingInline: compact ? 2 : 4,
        fontSize: compact ? 8 : 9,
        lineHeight: compact ? "10px" : "12px",
        color: "#063a3d",
        backgroundColor: "#19d3d8",
        borderColor: "#ffffff",
      }}
    >
      PRO
    </span>
  );
}
