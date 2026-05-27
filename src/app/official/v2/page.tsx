import type { Metadata } from "next";
import { OfficialV2LandingPage } from "@/components/official/OfficialV2LandingPage";

export const metadata: Metadata = {
  title: "InboxPilot V2 | IG 自動化與共享收件匣",
  description:
    "InboxPilot V2 是參考 BotCommerce 長銷售頁節奏重新設計的官方網站，主打 IG 留言自動化、Flow Builder、共享收件匣與 AI 回覆。",
};

export default function OfficialV2Page() {
  return <OfficialV2LandingPage />;
}
