import { MarketingInfoPage } from "@/components/marketing/MarketingInfoPage";

export const metadata = {
  title: "InboxPilot API",
  description: "InboxPilot API 與 OAuth popup、Webhook、Billing 路由文件。",
};

export default function ApiDocsPage() {
  return (
    <MarketingInfoPage
      eyebrow="API"
      title="InboxPilot API 文件"
      description="這份文件整理目前可用的 API、Webhook 與 Social Login OAuth Popup 路由。外部登入流程統一走新的 popup 模組，不再對外展示舊分散式入口。"
      sections={[
        {
          title: "Social Login OAuth Popup",
          body: "Meta、Telegram 與 Mock provider 共用同一套 popup / redirect / token exchange 架構。",
          items: [
            "/api/oauth/meta-instagram/authorize",
            "/api/oauth/meta-instagram/callback",
            "/api/oauth/meta-facebook/authorize",
            "/api/oauth/meta-facebook/callback",
            "/api/oauth/telegram-bot/authorize",
            "/api/oauth/telegram-bot/callback",
            "/api/oauth/mock/authorize",
            "/api/oauth/mock/callback",
            "/api/oauth/:provider/token",
          ],
        },
        {
          title: "Webhooks",
          body: "Meta、Telegram 與 WhatsApp webhook 入口，負責接收即時事件。",
          items: ["/api/webhooks/meta", "/api/webhooks/telegram", "/api/webhooks/whatsapp"],
        },
        {
          title: "Billing",
          body: "PayUNI 付款與回傳路由。",
          items: ["/api/billing/payuni/checkout", "/api/billing/payuni/return", "/api/billing/payuni/notify"],
        },
        {
          title: "Core App APIs",
          body: "Contact、Automation、Sequence、Broadcast 與 AI 相關 API 維持既有結構。",
          items: ["/api/channels", "/api/contacts", "/api/automations", "/api/sequences", "/api/broadcasts", "/api/ai-settings"],
        },
      ]}
    />
  );
}
