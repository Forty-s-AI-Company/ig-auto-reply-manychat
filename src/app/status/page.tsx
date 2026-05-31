import { MarketingInfoPage } from "@/components/marketing/MarketingInfoPage";

export const metadata = {
  title: "InboxPilot 系統狀態",
  description: "查看 InboxPilot 官方網站、登入、Instagram 串接與付款功能狀態。",
};

export default function StatusPage() {
  return (
    <MarketingInfoPage
      eyebrow="系統狀態"
      title="目前核心服務正常運作。"
      description="這裡整理 InboxPilot 重要服務的狀態，方便你快速確認網站、後台、Instagram 串接與帳務功能是否可用。"
      ctaLabel="進入後台"
      ctaHref="/dashboard"
      sections={[
        {
          title: "網站與登入",
          body: "官方網站、方案頁、註冊、登入與後台入口目前都已部署到正式網域。若遇到登入異常，通常會優先檢查 Vercel 環境變數、Auth Secret 與資料庫連線。",
          items: ["/official", "/pricing", "/signup", "/login", "/dashboard"],
        },
        {
          title: "Instagram 串接",
          body: "Meta OAuth、Webhook、貼文留言與私訊回覆功能是 InboxPilot 的優先開發項目。正式使用前仍需要確認 Meta App 權限、回呼網址與 Webhook 驗證設定。",
        },
        {
          title: "付款與方案",
          body: "PayUni 付款流程已保留 Return URL 與 Notify URL 的串接位置。若商店後台只提供一組網址，InboxPilot 會以同一個商店對應目前的方案付款流程。",
        },
        {
          title: "平台支援範圍",
          body: "目前以 Instagram 留言關鍵字、收件匣、帳號連接與自動化流程為正式支援範圍；其他平台會在官方 API、合規與客服流程完成後才開放。",
        },
      ]}
    />
  );
}
