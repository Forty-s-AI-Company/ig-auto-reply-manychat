import { AdminShell } from "@/components/AdminShell";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export default async function ChannelsPage() {
  await requireUser();
  const channels = await getDb().channel.findMany({ orderBy: { createdAt: "asc" } });
  return (
    <AdminShell>
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">Channels</h2>
          <p className="text-sm text-zinc-400">Mock 可直接測；Telegram 需要 Bot token；Meta/WhatsApp 僅提供官方 API scaffold。</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {channels.map((channel) => (
            <section key={channel.id} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{channel.name}</h3>
                <span className={channel.enabled ? "text-green-300" : "text-zinc-500"}>
                  {channel.enabled ? "enabled" : "disabled"}
                </span>
              </div>
              <p className="mt-1 text-sm text-zinc-400">{channel.type}</p>
              <pre className="mt-3 overflow-auto rounded-md bg-zinc-950 p-3 text-xs text-zinc-300">
                {JSON.stringify(channel.configJson, null, 2)}
              </pre>
            </section>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
