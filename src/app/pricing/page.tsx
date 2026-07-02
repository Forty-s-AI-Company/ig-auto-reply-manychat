import type { Metadata } from "next";
import { PricingPageClient } from "@/components/PricingPageClient";

export const metadata: Metadata = {
  title: "InboxPilot 方案與價格 | Instagram 自動回覆 SaaS",
  description:
    "InboxPilot 方案與價格，適合 Instagram 自動回覆、共享收件匣、AI 回覆與留言轉私訊流程。",
};

export default function PricingPage() {
  return <PricingPageClient />;
}
