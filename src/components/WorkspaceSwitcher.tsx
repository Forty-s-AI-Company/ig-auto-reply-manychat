"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Workspace = {
  id: string;
  name: string;
};

export function WorkspaceSwitcher({
  workspaces,
  selectedWorkspaceId,
}: {
  workspaces: Workspace[];
  selectedWorkspaceId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(selectedWorkspaceId);

  async function changeWorkspace(workspaceId: string) {
    setValue(workspaceId);
    const response = await fetch("/api/workspace-scope", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ workspaceId }),
    });

    if (!response.ok) {
      setValue(selectedWorkspaceId);
      return;
    }

    startTransition(() => router.refresh());
  }

  return (
    <label className="flex items-center gap-2 text-sm text-zinc-400">
      <span className="hidden sm:inline">工作區</span>
      <select
        value={value}
        disabled={isPending || workspaces.length <= 1}
        onChange={(event) => changeWorkspace(event.target.value)}
        className="max-w-[220px] rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 disabled:opacity-70"
      >
        {workspaces.map((workspace) => (
          <option key={workspace.id} value={workspace.id}>
            {workspace.name}
          </option>
        ))}
      </select>
    </label>
  );
}
