"use client";

import { ChevronDown, Pin, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

type Workspace = {
  id: string;
  name: string;
};

type Channel = {
  id: string;
  name: string;
  displayName?: string;
  username?: string;
  avatarUrl?: string;
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
  const [open, setOpen] = useState(false);
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(PINNED_ACCOUNTS_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
    } catch {
      return [];
    }
  });
  const [isPending, startTransition] = useTransition();
  const sortedChannels = useMemo(
    () =>
      [...channels].sort((a, b) => {
        const aPinned = pinnedIds.includes(a.id);
        const bPinned = pinnedIds.includes(b.id);
        if (aPinned !== bPinned) return aPinned ? -1 : 1;
        return 0;
      }),
    [channels, pinnedIds],
  );
  const selectedChannel = sortedChannels.find((channel) => channel.id === selectedChannelId);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

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
    setPinnedIds((current) => {
      const next = current.includes(channelId)
        ? current.filter((id) => id !== channelId)
        : [channelId, ...current];
      window.localStorage.setItem(PINNED_ACCOUNTS_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  const currentChannel = selectedChannel || sortedChannels[0];
  const currentName = currentChannel?.displayName || currentChannel?.name || "尚未連接平台帳號";
  const connectedLabel = channels.length === 1 ? "已連接 1 個平台帳號" : `已連接 ${channels.length} 個平台帳號`;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`flex h-11 w-full items-center gap-2 rounded-lg border px-2 text-left transition ${
          open ? "border-[#d5d7dc] bg-[#d9d9d9]" : "border-transparent hover:bg-[#e2e2e2]"
        }`}
        aria-expanded={open}
      >
        <InstagramAvatar channel={currentChannel} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-[#34363a]">{currentName}</p>
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#667085] transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+4px)] z-50 w-[320px] overflow-hidden rounded-md border border-[#d6dae0] bg-white shadow-[0_14px_32px_rgba(16,24,40,0.14)]">
          <div className="max-h-[312px] overflow-y-auto p-1.5">
            {sortedChannels.length > 0 ? (
              sortedChannels.map((channel) => {
                const pinned = pinnedIds.includes(channel.id);
                return (
                <button
                  key={channel.id}
                  type="button"
                  disabled={isPending}
                  onClick={() => changeAccount(channel.id)}
                  className={`flex h-[52px] w-full items-center gap-3 rounded-sm border px-2 text-left text-sm ${
                    channel.id === selectedChannelId || (!selectedChannelId && channel.id === sortedChannels[0]?.id)
                      ? "border-[#d8e7fb] bg-[#eef6ff]"
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
                      {channel.username ? `@${channel.username}` : connectedLabel}
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
                      pinned ? "text-[#006fe6]" : "text-[#344054]"
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
              className="flex h-8 w-full items-center justify-center gap-2 rounded-md border border-[#d2d6dc] bg-white px-3 text-sm font-medium text-[#34363a] hover:bg-[#f6f7f9]"
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
          "IG"
        )}
      </div>
      <PlanBadge className={`absolute ${badgeClass} z-20`} compact />
    </div>
  );
}

function PlanBadge({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-[3px] border border-white bg-[#006fe6] font-black text-white shadow-[0_0_0_0.5px_rgba(0,0,0,0.08)] ${className}`}
      style={{
        minWidth: compact ? 23 : 25,
        height: compact ? 12 : 14,
        paddingInline: compact ? 2 : 4,
        fontSize: compact ? 8 : 9,
        lineHeight: compact ? "10px" : "12px",
        color: "#ffffff",
        backgroundColor: "#006fe6",
        borderColor: "#ffffff",
      }}
    >
      PRO
    </span>
  );
}
