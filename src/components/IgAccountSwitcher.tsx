"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Channel = {
  id: string;
  name: string;
};

export function IgAccountSwitcher({
  channels,
  selectedChannelId,
}: {
  channels: Channel[];
  selectedChannelId?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(selectedChannelId || "all");

  async function changeAccount(channelId: string) {
    if (channelId === "__new_instagram__") {
      setValue(selectedChannelId || "all");
      window.open("/channels/connect", "_self");
      return;
    }

    setValue(channelId);
    const response = await fetch("/api/account-scope", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ channelId }),
    });

    if (!response.ok) {
      setValue(selectedChannelId || "all");
      return;
    }

    startTransition(() => router.refresh());
  }

  if (channels.length === 0) {
    return (
      <Link
        href="/channels/connect"
        className="rounded-md border border-cyan-800 bg-cyan-950/30 px-3 py-2 text-sm text-cyan-200 hover:bg-cyan-900/40"
      >
        + 新增平台帳號
      </Link>
    );
  }

  return (
    <label className="flex items-center gap-2 text-sm text-zinc-400">
      <span className="hidden sm:inline">IG 帳號</span>
      <select
        value={value}
        disabled={isPending}
        onChange={(event) => changeAccount(event.target.value)}
        className="max-w-[240px] rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
      >
        <option value="all">全部 IG 帳號</option>
        {channels.map((channel) => (
          <option key={channel.id} value={channel.id}>
            {channel.name}
          </option>
        ))}
        <option value="__new_instagram__">+ 新增平台帳號</option>
      </select>
    </label>
  );
}
