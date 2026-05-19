import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/LogoutButton";

const navItems = [
  ["Dashboard", "/dashboard"],
  ["Inbox", "/inbox"],
  ["Contacts", "/contacts"],
  ["Tags", "/tags"],
  ["Automations", "/automations"],
  ["Knowledge Base", "/knowledge-base"],
  ["Broadcasts", "/broadcasts"],
  ["Channels", "/channels"],
  ["Mock Tester", "/mock-tester"],
];

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-zinc-800 bg-zinc-950 p-5 lg:block">
        <div className="mb-8">
          <p className="text-sm text-zinc-400">Personal</p>
          <h1 className="text-lg font-semibold">Chat Automation Hub</h1>
        </div>
        <nav className="space-y-1">
          {navItems.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="block rounded-md px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white"
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/90 px-5 py-3 backdrop-blur">
          <div className="lg:hidden">
            <p className="text-sm font-semibold">PCA Hub</p>
          </div>
          <div className="hidden text-sm text-zinc-400 lg:block">
            {user ? `${user.name} · ${user.email}` : "Not signed in"}
          </div>
          <LogoutButton />
        </header>
        <main className="mx-auto w-full max-w-7xl px-5 py-6">{children}</main>
      </div>
    </div>
  );
}
