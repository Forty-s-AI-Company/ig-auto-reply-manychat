import Link from "next/link";
import { Camera, Mail, ShieldCheck, UserRound } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export default async function ProfilePage() {
  const user = await requireUser();
  const workspaceId = await getCurrentWorkspaceId();
  const [teamRole, channels] = await Promise.all([
    getDb().workspaceUser.findFirst({
      where: { userId: user.id, workspaceId },
      select: { role: true },
    }),
    getDb().channel.findMany({
      where: { workspaceId, enabled: true },
      orderBy: [{ type: "asc" }, { name: "asc" }],
      select: { id: true, type: true, name: true },
    }),
  ]);

  return (
    <AdminShell title="我的個人檔案">
      <div className="mx-auto max-w-5xl space-y-5">
        <section className="rounded-lg border border-[#d7dbe0] bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e5e7eb] text-2xl font-semibold text-[#344054]">
              {(user.name || user.email).slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-[#111827]">{user.name || "管理員"}</h2>
              <p className="mt-1 text-sm text-[#667085]">{user.email}</p>
            </div>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <section className="rounded-lg border border-[#d7dbe0] bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <UserRound className="h-5 w-5 text-[#667085]" />
              <h3 className="font-semibold text-[#111827]">基本資料</h3>
            </div>
            <div className="space-y-4">
              <Field label="顯示名稱" value={user.name || "管理員"} />
              <Field label="電子郵件" value={user.email} />
              <Field label="角色" value={(teamRole?.role || user.role) === "admin" ? "管理員" : "客服人員"} />
              <Field label="介面語言" value="繁體中文" />
              <p className="rounded-md bg-[#f9fafb] px-3 py-2 text-sm text-[#667085]">目前介面語言：繁體中文</p>
            </div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-lg border border-[#d7dbe0] bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#667085]" />
                <h3 className="font-semibold text-[#111827]">登入與安全</h3>
              </div>
              <p className="text-sm leading-6 text-[#667085]">
                目前支援 Email / 密碼登入與 Google 登入。Apple、Telegram 登入方式先保留入口，正式串接後會顯示在這裡。
              </p>
            </section>

            <section className="rounded-lg border border-[#d7dbe0] bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5 text-[#667085]" />
                <h3 className="font-semibold text-[#111827]">通知</h3>
              </div>
              <p className="text-sm leading-6 text-[#667085]">
                Inbox 新訊息、指派提醒、系統通知會集中在通知設定。現在先以頁面內提醒為主。
              </p>
            </section>
          </aside>
        </div>

        <section className="rounded-lg border border-[#d7dbe0] bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-[#111827]">已連結平台帳號</h3>
              <p className="mt-1 text-sm text-[#667085]">目前平台登入會集中顯示在這裡；新增帳號請從左上角或設定頁選擇平台後授權。</p>
            </div>
            <Link href="/channels/connect" className="rounded-md bg-[#006fe6] px-3 py-2 text-sm font-medium text-white hover:bg-[#0057b8]">
              + 新增平台帳號
            </Link>
          </div>
          <div className="mt-4 divide-y divide-[#eef0f2]">
            {channels.map((channel) => (
              <div key={channel.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="flex items-center gap-2 font-medium text-[#111827]">
                    <Camera className="h-4 w-4 text-pink-500" />
                    {channel.name}
                  </p>
                  <p className="text-[#667085]">{channel.type === "instagram" ? "Instagram" : channel.type}</p>
                </div>
                <span className="rounded-full bg-[#eef6ff] px-3 py-1 text-xs text-[#006fe6]">已連線</span>
              </div>
            ))}
            {channels.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#d7dbe0] px-4 py-6 text-sm text-[#667085]">
                尚未連結平台帳號。請先新增 Instagram 或 Facebook Messenger。
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="text-sm text-[#667085]">{label}</span>
      <input
        value={value}
        readOnly
        className="mt-1 h-10 w-full rounded-md border border-[#d7dbe0] bg-[#f9fafb] px-3 text-sm text-[#111827]"
      />
    </label>
  );
}
