"use client";

import type { ReactNode } from "react";
import { DismissibleNoticeToast } from "@/components/DismissibleNoticeToast";

type ManualActionNoticeProps = {
  title: string;
  children: ReactNode;
  tone?: "cyan" | "amber";
  stackIndex?: number;
};

export function ManualActionNotice({ title, children, tone = "amber", stackIndex }: ManualActionNoticeProps) {
  return (
    <DismissibleNoticeToast title={title} tone={tone === "cyan" ? "info" : "warning"} stackIndex={stackIndex}>
      {children}
    </DismissibleNoticeToast>
  );
}
