import type { Metadata } from "next";
import { OfficialV2LandingPage } from "@/components/official/OfficialV2LandingPage";

export const metadata: Metadata = {
  title: "InboxPilot V2 | IG 自動化與共享收件匣",
  description:
    "InboxPilot V2 官方網站聚焦 IG 留言自動化、Flow Builder、Meta 串接、共享收件匣與團隊接手。",
};

export default function OfficialV2Page() {
  return <OfficialV2LandingPage />;
}
