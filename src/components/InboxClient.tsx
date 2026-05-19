"use client";

import { useMemo, useState } from "react";

type Tag = { id: string; name: string; color: string };
type Conversation = {
  id: string;
  status: string;
  contact: {
    id: string;
    displayName: string;
    externalId: string;
    tags: { tag: Tag }[];
  };
  channel: { type: string; name: string };
  messages: { id: string; direction: string; text: string | null; createdAt: string }[];
};

export function InboxClient({
  initialConversations,
  tags,
}: {
  initialConversations: Conversation[];
  tags: Tag[];
}) {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedId, setSelectedId] = useState(initialConversations[0]?.id || "");
  const [text, setText] = useState("");
  const selected = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedId),
    [conversations, selectedId],
  );

  async function refresh(id = selectedId) {
    const response = await fetch(`/api/conversations/${id}`);
    if (!response.ok) return;
    const updated = await response.json();
    setConversations((current) =>
      current.map((conversation) => (conversation.id === updated.id ? updated : conversation)),
    );
  }

  async function sendMessage() {
    if (!selected || !text.trim()) return;
    const response = await fetch(`/api/conversations/${selected.id}/messages`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      alert(data.error || "送出失敗");
      return;
    }
    setText("");
    await refresh(selected.id);
  }

  async function updateStatus(status: string) {
    if (!selected) return;
    await fetch(`/api/conversations/${selected.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await refresh(selected.id);
  }

  async function addTag(tagId: string) {
    if (!selected || !tagId) return;
    await fetch(`/api/contacts/${selected.contact.id}/tags`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tagId }),
    });
    await refresh(selected.id);
  }

  async function removeTag(tagId: string) {
    if (!selected) return;
    await fetch(`/api/contacts/${selected.contact.id}/tags?tagId=${tagId}`, { method: "DELETE" });
    await refresh(selected.id);
  }

  return (
    <div className="grid min-h-[70vh] gap-4 lg:grid-cols-[320px_1fr]">
      <aside className="rounded-lg border border-zinc-800 bg-zinc-900">
        <div className="border-b border-zinc-800 px-4 py-3 font-medium">Conversations</div>
        <div className="divide-y divide-zinc-800">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => setSelectedId(conversation.id)}
              className={`block w-full px-4 py-3 text-left text-sm hover:bg-zinc-800 ${
                selectedId === conversation.id ? "bg-zinc-800" : ""
              }`}
            >
              <div className="flex justify-between">
                <span className="font-medium">{conversation.contact.displayName}</span>
                <span className="text-xs text-zinc-500">{conversation.status}</span>
              </div>
              <p className="mt-1 truncate text-zinc-400">
                {conversation.messages[0]?.text || "沒有訊息"}
              </p>
            </button>
          ))}
        </div>
      </aside>
      <section className="rounded-lg border border-zinc-800 bg-zinc-900">
        {selected ? (
          <div className="flex h-full flex-col">
            <div className="border-b border-zinc-800 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{selected.contact.displayName}</h2>
                  <p className="text-sm text-zinc-400">
                    {selected.channel.type} · {selected.contact.externalId}
                  </p>
                </div>
                <select
                  value={selected.status}
                  onChange={(event) => updateStatus(event.target.value)}
                  className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                >
                  <option value="open">open</option>
                  <option value="pending">pending</option>
                  <option value="closed">closed</option>
                </select>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {selected.contact.tags.map(({ tag }) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => removeTag(tag.id)}
                    className="rounded-full px-2 py-1 text-xs"
                    style={{ backgroundColor: tag.color }}
                    title="點擊移除 tag"
                  >
                    {tag.name}
                  </button>
                ))}
                <select
                  onChange={(event) => addTag(event.target.value)}
                  value=""
                  className="rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs"
                >
                  <option value="">加 tag</option>
                  {tags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex-1 space-y-3 overflow-auto p-4">
              {[...selected.messages].map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    message.direction === "outbound"
                      ? "ml-auto bg-cyan-600 text-white"
                      : "bg-zinc-800 text-zinc-100"
                  }`}
                >
                  <p>{message.text}</p>
                  <p className="mt-1 text-xs opacity-70">
                    {new Date(message.createdAt).toLocaleString("zh-TW")}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 border-t border-zinc-800 p-4">
              <input
                value={text}
                onChange={(event) => setText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") sendMessage();
                }}
                className="flex-1 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
                placeholder="輸入手動回覆"
              />
              <button onClick={sendMessage} className="rounded-md bg-cyan-500 px-4 py-2 text-zinc-950">
                送出
              </button>
            </div>
          </div>
        ) : (
          <p className="p-6 text-sm text-zinc-500">目前沒有 conversation。</p>
        )}
      </section>
    </div>
  );
}
