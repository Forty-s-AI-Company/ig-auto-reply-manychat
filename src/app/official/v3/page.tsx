import type { Metadata } from "next";
import { OfficialV3LandingPage } from "@/components/official/OfficialV3LandingPage";

export const metadata: Metadata = {
  title: "InboxPilot 終身優惠 | Instagram 自動化與 AI 聊天機器人",
  description:
    "InboxPilot 官方 v3 多語系終身優惠頁，支援繁體中文、簡體中文與英文，包含產品影片、自動化情境、方案比較與 FAQ。",
};

export default function OfficialV3Page() {
  return <OfficialV3LandingPage />;
}
