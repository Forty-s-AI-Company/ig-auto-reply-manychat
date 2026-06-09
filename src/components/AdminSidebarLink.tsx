"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Bot, Clock, CreditCard, Gift, Home, Inbox, Megaphone, Settings, Shield, Sparkles, Users, Wallet } from "lucide-react";

const icons = {
  home: Home,
  users: Users,
  sparkles: Sparkles,
  clock: Clock,
  bot: Bot,
  inbox: Inbox,
  megaphone: Megaphone,
  barChart3: BarChart3,
  creditCard: CreditCard,
  gift: Gift,
  wallet: Wallet,
  settings: Settings,
  shield: Shield,
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
      <Icon className="h-5 w-5 shrink-0 transition" />
      {label}
    </Link>
  );
}
