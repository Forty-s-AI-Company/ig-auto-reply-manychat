import type { ReactNode } from "react";

type ManualActionNoticeProps = {
  title: string;
  children: ReactNode;
  tone?: "cyan" | "amber";
};

export function ManualActionNotice({ title, children, tone = "amber" }: ManualActionNoticeProps) {
  const className =
    tone === "cyan"
      ? "rounded-md border border-cyan-900/70 bg-cyan-950/30 px-4 py-3 text-sm text-cyan-100"
      : "rounded-md border border-amber-900/70 bg-amber-950/30 px-4 py-3 text-sm text-amber-100";

  return (
    <div className={className}>
      <p className="font-medium">{title}</p>
      <div className="mt-1 text-zinc-200">{children}</div>
    </div>
  );
}
