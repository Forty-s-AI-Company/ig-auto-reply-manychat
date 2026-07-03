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
      description="依照新使用者最常走的路徑整理：先連接 Instagram，再確認收件匣、聯絡人與自動化設定；如果遇到權限或 Webhook 問題，也能快速找到排查方向。"
      ctaLabel="開始連接 Instagram"
      ctaHref="/channels/connect"
      sections={[
        {
          title: "快速開始",
          body: "先完成註冊與登入，再前往新增平台帳號流程連接 Instagram。連接完成後，回到 Dashboard 檢查目前 channel、Inbox 與 Contacts 是否已切到正確帳號。",
          items: ["建立 InboxPilot 帳號", "連接 Instagram", "確認左側帳號切換器", "檢查收件匣與聯絡人範圍"],
        },
        {
          title: "自動化設定",
          body: "自動化流程參考 ManyChat 類產品的視覺化邏輯。你可以先從留言關鍵字、私訊回覆與預設回覆開始，進階節點會在完整版本中逐步開放。",
          items: ["留言關鍵字觸發", "私訊回覆", "預設回覆", "受控開通的進階節點"],
        },
        {
          title: "收件匣管理",
          body: "收件匣可以依照未指派、指派給我、提醒、標籤、收藏、熱門名單、合作夥伴與團隊分類，協助客服或銷售追蹤每一則對話；如果目前沒有資料，請先確認 Instagram channel 是否已連接。",
        },
        {
          title: "常見排查",
          body: "如果留言沒有觸發，請確認 Meta Webhook 訂閱、IG 帳號權限、貼文選擇、關鍵字大小寫、延遲設定與自動化是否已啟用。這些小地方很會躲，我們也被它折騰過。",
        },
      ]}
    />
  );
}
