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
    <main className="min-h-screen bg-[#f8fafc] text-[#111827]">
      <header className="border-b border-[#d7dbe0] bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link
            href="/official"
            className="flex items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-600"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-cyan-500 text-sm font-black text-slate-950">
              IP
            </span>
            <span className="text-xl font-black tracking-[-0.03em]">InboxPilot</span>
          </Link>
          <Link
            href="/pricing"
            className="rounded-md bg-[#111827] px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-600"
          >
            查看方案
          </Link>
        </div>
      </header>

      <section className="border-b border-[#d7dbe0] bg-white px-5 py-14">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 inline-flex rounded-md bg-cyan-50 px-3 py-1.5 text-sm font-bold text-cyan-800">
            {eyebrow}
          </p>
          <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-[-0.03em] text-slate-950 md:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">{description}</p>
          <Link
            href={ctaHref}
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-700"
          >
            {ctaLabel}
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-5 py-14 md:grid-cols-2">
        {sections.map((section) => (
          <article key={section.title} className="rounded-lg border border-[#d7dbe0] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">{section.title}</h2>
            <p className="mt-3 leading-8 text-slate-600">{section.body}</p>
            {section.items ? (
              <ul className="mt-5 space-y-3">
                {section.items.map((item) => (
                  <li key={item} className="flex min-w-0 items-start gap-3 text-sm font-semibold text-slate-700">
                    <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-cyan-600" />
                    <span className="min-w-0 break-words">{item}</span>
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
