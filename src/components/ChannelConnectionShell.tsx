import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { InboxPilotLogo } from "@/components/InboxPilotLogo";

type ChannelConnectionShellProps = {
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
  visual: ReactNode;
  children: ReactNode;
};

export function ChannelConnectionShell({
  title,
  description,
  backHref,
  backLabel,
  visual,
  children,
}: ChannelConnectionShellProps) {
  return (
    <main className="min-h-screen bg-white text-[var(--text-primary)]">
      <div className="grid min-h-screen lg:grid-cols-[44%_56%]">
        <section className="relative flex min-h-[42vh] flex-col bg-[var(--page-bg)] px-8 py-10 lg:min-h-screen lg:px-[9vw]">
          <Link href="/dashboard" aria-label="InboxPilot 首頁">
            <InboxPilotLogo />
          </Link>

          <div className="flex flex-1 flex-col justify-center">
            <div className="mb-12">{visual}</div>
            <h1 className="max-w-[420px] text-[34px] font-black leading-tight tracking-normal text-[#17191c] sm:text-[42px]">
              {title}
            </h1>
            <p className="mt-6 max-w-[430px] text-base leading-7 text-[#5d6470]">{description}</p>
          </div>

          <Link href={backHref} className="mb-5 inline-flex w-fit items-center gap-2 text-sm font-semibold text-[var(--teal-dark)] hover:text-[var(--primary-hover)]">
            <ChevronLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        </section>

        <section className="flex min-h-[58vh] items-center justify-center px-8 py-12 lg:min-h-screen">
          <div className="w-full max-w-[520px]">{children}</div>
        </section>
      </div>
    </main>
  );
}

export function GiftVisual() {
  return (
    <div className="relative h-40 w-40">
      <div className="absolute left-5 top-7 h-16 w-16 rounded-full border-[3px] border-[#d62d8b] bg-[#91e58d]" />
      <div className="absolute left-16 top-8 h-16 w-16 rounded-full border-[3px] border-[#d62d8b] bg-[#91e58d]" />
      <div className="absolute left-8 top-24 h-12 w-28 -rotate-6 rounded-sm bg-[#7e2df2]" />
      <div className="absolute left-9 top-[112px] h-8 w-28 -rotate-6 bg-[linear-gradient(90deg,#ff4fa3_0_24%,#89e58c_24%_50%,#ff4fa3_50%_75%,#89e58c_75%)]" />
      <div className="absolute left-[52px] top-[94px] h-4 w-20 -rotate-6 rounded-sm bg-[#44e876]" />
      <div className="absolute left-[74px] top-[88px] h-16 w-3 -rotate-6 bg-[#ffce32]" />
      <div className="absolute left-[103px] top-[105px] h-3 w-3 rounded-full bg-[#ffce32]" />
      <div className="absolute left-7 top-[72px] h-7 w-1 -rotate-12 bg-[#d62d8b]" />
      <div className="absolute left-[58px] top-[72px] h-8 w-1 rotate-6 bg-[#d62d8b]" />
      <div className="absolute left-[88px] top-[74px] h-7 w-1 rotate-12 bg-[#d62d8b]" />
    </div>
  );
}

export function InstagramVisual() {
  return (
    <div className="relative h-44 w-44">
      <div className="absolute left-6 top-16 h-24 w-24 rounded-[32px] bg-[#95dfe2]" />
      <div className="absolute left-20 top-12 h-24 w-24 -rotate-12 bg-[#ff2bd7]" style={{ clipPath: "polygon(50% 0, 62% 38%, 100% 28%, 70% 56%, 95% 88%, 55% 70%, 30% 100%, 32% 62%, 0 42%, 42% 38%)" }} />
      <div className="absolute left-14 top-20 h-24 w-24 rounded-full border-[18px] border-[#e0a11a]" />
      <div className="absolute left-[82px] top-[108px] h-9 w-9 rounded-full bg-[#95dfe2]" />
      <div className="absolute left-[103px] top-[75px] h-4 w-4 rounded-full bg-[#e0a11a]" />
      <div className="absolute left-[58px] top-[82px] h-20 w-20 border-[8px] border-[#3154c9]" />
    </div>
  );
}
