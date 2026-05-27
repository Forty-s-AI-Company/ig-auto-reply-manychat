import type { Metadata } from "next";
import { PricingPageClient } from "@/components/PricingPageClient";

export const metadata: Metadata = {
  title: "InboxPilot Pricing | Instagram 自動回覆 SaaS 方案",
  description:
    "InboxPilot pricing plans for Instagram automation, shared inbox, AI replies, and comment-to-DM workflows.",
};

export default function PricingPage() {
  return <PricingPageClient />;
}
