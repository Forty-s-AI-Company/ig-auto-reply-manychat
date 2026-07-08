import { MarketingInfoPage } from "@/components/marketing/MarketingInfoPage";

export const metadata = {
  title: "聯絡 InboxPilot",
  description: "聯絡 InboxPilot 營運者，處理產品、Meta 串接、PayUNI 與技術支援需求。",
};

export default function ContactPage() {
  return (
    <MarketingInfoPage
      eyebrow="聯絡我們"
      title="有問題，直接把情境丟給我們。"
      description="InboxPilot is operated by Luo Shih Lin。若你在 Instagram、Meta App、PayUNI 付款或自動化流程遇到問題，可以先附上頁面、錯誤訊息、發生時間與操作步驟；敏感資料請先遮蔽，會比較快抓到問題。"
      ctaLabel="寄信聯絡"
      ctaHref="mailto:zeroyuanbrothers@gmail.com"
      sections={[
        {
          title: "營運主體",
          body: "InboxPilot is a software product operated by Luo Shih Lin. InboxPilot 為羅仕林個人開發與營運之自動化行銷工具。",
          items: ["Operator / Owner: Luo Shih Lin", "中文：羅仕林", "Website: https://inboxpilot.carry-digital-nomad.in.net/"],
        },
        {
          title: "聯絡信箱",
          body: "目前先以 Email 作為主要支援入口。寄信時請盡量附上截圖、發生時間與你當時操作到哪一步，這樣排查會快很多。",
          items: ["zeroyuanbrothers@gmail.com", "請使用註冊信箱寄信", "請避免在信件中貼上完整密鑰、token、卡號或 cookie"],
        },
        {
          title: "Meta / Instagram 串接",
          body: "如果是留言沒有觸發、IG 帳號抓不到、OAuth 回呼錯誤，請提供 IG 帳號名稱、錯誤畫面、錯誤代碼、發生時間與測試貼文連結；App ID 或 Business ID 可先遮蔽部分數字。",
        },
        {
          title: "PayUNI 付款",
          body: "如果是付款完成後方案沒有更新，請提供交易時間、方案名稱、付款方式、PayUNI 回傳狀態與遮蔽後的查詢編號；請不要寄完整卡號或正式金鑰。",
        },
        {
          title: "產品建議",
          body: "如果你希望某個 ManyChat 功能搬到 InboxPilot，也可以直接描述你的實際流程。越接近真實工作情境，越容易做成能用的功能。",
        },
      ]}
    />
  );
}
