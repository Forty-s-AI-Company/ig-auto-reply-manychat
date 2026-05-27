import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export type MarketingInfoSection = {
  title: string;
  body: string;
  items?: string[];
};

export function MarketingInfoPage({
  eyebrow,
  title,
  description,
  sections,
  ctaLabel = "開始使用 InboxPilot",
  ctaHref = "/signup",
}: {
  eyebrow: string;
  title: string;
  description: string;
  sections: MarketingInfoSection[];
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <main className="min-h-screen bg-[#fffdf2] text-[#111]">
      <header className="border-b border-black/10 bg-[#fffdf2]">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5">
          <Link href="/official" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#111] text-lg font-black text-[#ffdd35]">
              IP
            </span>
            <span className="text-2xl font-black tracking-[-0.04em]">InboxPilot</span>
          </Link>
          <Link href="/pricing" className="rounded-full bg-[#ffdd35] px-5 py-3 text-sm font-black shadow-[0_5px_0_#111]">
            查看方案
          </Link>
        </div>
      </header>

      <section className="border-b border-black/10 bg-[#ffdd35] px-5 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-5 inline-flex rounded-full border border-black/15 bg-white px-4 py-2 text-sm font-black">
            {eyebrow}
          </p>
          <h1 className="max-w-4xl text-[44px] font-black leading-[0.95] tracking-[-0.06em] sm:text-[72px]">
            {title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#333]">{description}</p>
          <Link href={ctaHref} className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#111] px-7 py-4 font-black text-white">
            {ctaLabel}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-5 py-14 md:grid-cols-2">
        {sections.map((section) => (
          <article key={section.title} className="rounded-[28px] border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">{section.title}</h2>
            <p className="mt-4 leading-8 text-[#555]">{section.body}</p>
            {section.items ? (
              <ul className="mt-5 space-y-3">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 font-semibold text-[#333]">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#2f6df6]" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </section>
    </main>
  );
}
