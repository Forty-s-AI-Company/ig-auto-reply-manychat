import { MarketingInfoPage } from "@/components/marketing/MarketingInfoPage";

export const metadata = {
  title: "聯絡 InboxPilot",
  description: "聯絡 InboxPilot 團隊，處理產品、Meta 串接、PayUni 與技術支援需求。",
};

export default function ContactPage() {
  return (
    <MarketingInfoPage
      eyebrow="聯絡我們"
      title="有問題，直接把情境丟給我們。"
      description="如果你在 Instagram、Meta App、PayUni 付款或自動化流程遇到問題，可以先附上帳號、頁面、錯誤訊息與操作步驟，我們會比較快抓到問題。"
      ctaLabel="寄信聯絡"
      ctaHref="mailto:zeroyuanbrothers@gmail.com"
      sections={[
        {
          title: "聯絡信箱",
          body: "目前先以 Email 作為主要支援入口。寄信時請盡量附上截圖、發生時間與你當時操作到哪一步，這樣排查會快很多。",
          items: ["zeroyuanbrothers@gmail.com", "請使用註冊信箱寄信", "請避免在信件中直接貼上完整密鑰"],
        },
        {
          title: "Meta / Instagram 串接",
          body: "如果是留言沒有觸發、IG 帳號抓不到、OAuth 回呼錯誤，請提供 Meta App ID、IG 帳號名稱、錯誤畫面與測試貼文連結。",
        },
        {
          title: "PayUni 付款",
          body: "如果是付款完成後方案沒有更新，請提供 PayUni 商店代號、交易時間與回傳狀態，方便對照 Return URL 與 Notify URL。",
        },
        {
          title: "產品建議",
          body: "如果你希望某個 ManyChat 功能搬到 InboxPilot，也可以直接描述你的實際流程。越接近真實工作情境，越容易做成能用的功能。",
        },
      ]}
    />
  );
}
