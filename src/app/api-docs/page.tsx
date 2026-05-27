import { MarketingInfoPage } from "@/components/marketing/MarketingInfoPage";

export const metadata = {
  title: "InboxPilot API",
  description: "InboxPilot API、Webhook 與第三方服務串接說明。",
};

export default function ApiDocsPage() {
  return (
    <MarketingInfoPage
      eyebrow="API"
      title="替你的社群營運接上更多系統。"
      description="InboxPilot 主要提供 no-code 操作，但仍保留 API 與 Webhook 的擴充方向，方便日後串接 CRM、訂單、付款、通知與內部系統。"
      sections={[
        {
          title: "Meta Webhook",
          body: "接收 Instagram 留言、私訊與帳號事件，讓自動化能判斷觸發條件並送出後續訊息。",
          items: ["/api/webhooks/meta", "/api/meta/oauth/callback", "/api/instagram/comments/sync"],
        },
        {
          title: "PayUni Billing",
          body: "處理方案付款、回傳結果與付款通知。正式環境需在 PayUni 後台填入 Return URL 與 Notify URL。",
          items: ["/api/billing/payuni/return", "/api/billing/payuni/notify", "/api/billing/payuni/checkout"],
        },
        {
          title: "後台資料 API",
          body: "後台資料包含 contacts、conversations、automations、tags、segments 與 broadcasts。這些 API 目前以登入 session 保護，避免外部未授權存取。",
        },
        {
          title: "安全原則",
          body: "Webhook token、API secret 與付款密鑰都只放在伺服器環境變數，不寫入前端，也不會在頁面上直接顯示。",
        },
      ]}
    />
  );
}
