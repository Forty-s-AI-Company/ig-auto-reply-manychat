import { MarketingInfoPage } from "@/components/marketing/MarketingInfoPage";

export const metadata = {
  title: "InboxPilot API",
  description: "InboxPilot launch-safe API、Instagram OAuth、Meta Webhook 與 PayUNI Sandbox 路由文件。",
};

export default function ApiDocsPage() {
  return (
    <MarketingInfoPage
      eyebrow="API"
      title="InboxPilot API 文件"
      description="這份文件只列出目前可對外承諾的 launch-safe API。其他通路、本機測試 provider 與內部驗證路由會保留在受控測試流程，不在正式產品文件中宣傳。"
      sections={[
        {
          title: "Instagram OAuth",
          body: "正式產品主線聚焦 Instagram Business OAuth。授權成功後會建立或更新 workspace 內的 Instagram channel，供收件匣、聯絡人與自動化共用。",
          items: [
            "/api/meta/oauth/start",
            "/api/meta/oauth/callback",
            "/api/instagram/oauth/callback",
            "/api/channels/[id]/instagram-profile/refresh",
          ],
        },
        {
          title: "Meta Webhook",
          body: "目前公開 webhook 主線以 Meta / Instagram 事件為準。其他平台 webhook 仍屬於受控開通或內部測試，不列入對外承諾。",
          items: ["/api/webhooks/meta", "/api/meta/data-deletion", "/api/meta/deauthorize"],
        },
        {
          title: "Billing / PayUNI Sandbox",
          body: "PayUNI 目前維持 Sandbox 測試站。正式切換前，付款頁與 callback 都必須通過 sandbox smoke、簽章與 idempotency 檢查。",
          items: ["/api/billing/payuni/checkout", "/api/billing/payuni/return", "/api/billing/payuni/notify"],
        },
        {
          title: "Core App APIs",
          body: "工作區內核心 API 以 auth、workspace scope、rate limit 與同源檢查為前提。高風險或完整版本功能仍會在 UI 上標示受控開通。",
          items: ["/api/channels", "/api/contacts", "/api/conversations", "/api/automations", "/api/sequences", "/api/segments", "/api/ai-settings"],
        },
      ]}
    />
  );
}
