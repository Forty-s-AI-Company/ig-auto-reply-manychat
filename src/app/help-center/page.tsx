import { MarketingInfoPage } from "@/components/marketing/MarketingInfoPage";

export const metadata = {
  title: "InboxPilot 說明中心",
  description: "InboxPilot 使用教學、Instagram 串接、收件匣與自動化設定說明。",
};

export default function HelpCenterPage() {
  return (
    <MarketingInfoPage
      eyebrow="說明中心"
      title="從連接 IG 到建立自動化，一步一步完成。"
      description="這裡放 InboxPilot 的主要使用說明，讓團隊可以快速找到連接帳號、設定留言關鍵字、管理收件匣與排查 Webhook 的方法。"
      sections={[
        {
          title: "快速開始",
          body: "先完成註冊與登入，再前往新增帳號流程連接 Instagram。連接完成後，就能在自動化頁選擇貼文、設定關鍵字與回覆內容。",
          items: ["建立 InboxPilot 帳號", "連接 Instagram", "選擇指定貼文或全部貼文", "設定關鍵字與回覆"],
        },
        {
          title: "自動化設定",
          body: "自動化流程參考 ManyChat 的視覺化邏輯。你可以新增訊息、條件、動作與等待節點，並把節點串接成完整對話流程。",
          items: ["留言關鍵字觸發", "私訊回覆", "自動按讚", "延遲自動化"],
        },
        {
          title: "收件匣管理",
          body: "收件匣可以依照未指派、指派給我、提醒、標籤、收藏、熱門名單、合作夥伴與團隊分類，協助客服或銷售追蹤每一則對話。",
        },
        {
          title: "常見排查",
          body: "如果留言沒有觸發，請確認 Meta Webhook 訂閱、IG 帳號權限、貼文選擇、關鍵字大小寫、延遲設定與自動化是否已啟用。小地方很多，我們也被它折騰過。",
        },
      ]}
    />
  );
}
