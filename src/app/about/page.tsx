import { MarketingInfoPage } from "@/components/marketing/MarketingInfoPage";

export const metadata = {
  title: "關於 InboxPilot",
  description: "認識 InboxPilot 如何協助品牌管理 Instagram 自動回覆、收件匣與客戶互動。",
};

export default function AboutPage() {
  return (
    <MarketingInfoPage
      eyebrow="關於 InboxPilot"
      title="把社群互動，整理成可追蹤的生意流程。"
      description="InboxPilot 是為中文團隊打造的 Instagram 自動回覆與收件匣平台。你可以像 ManyChat 一樣用視覺化流程建立留言關鍵字、私訊回覆、標籤、提醒與真人客服交接。"
      sections={[
        {
          title: "我們在解決什麼",
          body: "很多品牌的 IG 留言、私訊與客戶名單散在不同地方，忙起來很容易漏回。InboxPilot 把這些互動集中成一個工作台，讓團隊知道誰需要被回覆、誰該被追蹤、哪個流程正在運作。",
          items: ["Instagram 留言關鍵字自動化", "視覺化 Flow Builder", "收件匣指派與提醒", "客戶標籤與分眾"],
        },
        {
          title: "為誰而做",
          body: "適合創作者、電商品牌、顧問服務、小型客服團隊，以及所有靠 Instagram 經營客戶關係的人。介面預設繁體中文，降低團隊導入門檻。",
        },
        {
          title: "和 ManyChat 的關係",
          body: "InboxPilot 參考 ManyChat 的清楚排版與 no-code 操作邏輯，但功能會優先聚焦在 Instagram、中文營運場景、PayUni 付款與本地團隊常見需求。",
        },
        {
          title: "接下來",
          body: "我們會持續完善 Meta API 串接、留言觸發、AI 回覆、用戶分眾與帳務方案，讓 InboxPilot 從工具慢慢長成一套能日常使用的社群營運系統。",
        },
      ]}
    />
  );
}
