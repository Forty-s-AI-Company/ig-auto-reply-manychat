import type { Metadata } from "next";
import { OfficialV3LandingPage } from "@/components/official/OfficialV3LandingPage";

export const metadata: Metadata = {
  title: "InboxPilot V3 | Instagram 留言自動化與團隊 Inbox",
  description:
    "InboxPilot 官方 v3 多語系頁，聚焦 Instagram 留言觸發、DM 流程、Meta 連線、標籤管理與團隊接手。",
};

export default function OfficialV3Page() {
  return <OfficialV3LandingPage />;
}
