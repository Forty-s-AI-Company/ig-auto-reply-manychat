"use client";

import { Search } from "lucide-react";

export function InboxHeaderSearch() {
  return (
    <div className="relative w-[420px] max-w-[46vw]">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98a2b3]" />
      <input
        onChange={(event) => {
          window.dispatchEvent(new CustomEvent("inbox-search", { detail: event.target.value }));
        }}
        className="h-9 w-full rounded-md border border-[#d7dbe0] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#006fe6]"
        placeholder="搜尋收件匣對話"
      />
    </div>
  );
}
