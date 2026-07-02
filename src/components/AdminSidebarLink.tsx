"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Clock, Gift, Home, Inbox, Megaphone, Settings, Sparkles, Users } from "lucide-react";

const icons = {
  home: Home,
  users: Users,
  sparkles: Sparkles,
  clock: Clock,
  inbox: Inbox,
  megaphone: Megaphone,
  barChart3: BarChart3,
  gift: Gift,
  settings: Settings,
};

export function AdminSidebarLink({
  href,
  label,
  iconName,
}: {
  href: string;
  label: string;
  iconName: keyof typeof icons;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
  const Icon = icons[iconName];

  return (
    <Link
      href={href}
      className={`sidebar-item min-h-11 text-sm font-semibold ${active ? "active" : ""}`}
    >
      <Icon className="h-5 w-5 shrink-0 transition" aria-hidden="true" />
      {label}
    </Link>
  );
}
