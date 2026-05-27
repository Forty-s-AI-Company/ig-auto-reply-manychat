import { MarketingInfoPage } from "@/components/marketing/MarketingInfoPage";

export const metadata = {
  title: "InboxPilot 隱私權政策",
  description: "InboxPilot 如何蒐集、使用、保存與刪除你的資料。",
};

export default function PrivacyPolicyPage() {
  return (
    <MarketingInfoPage
      eyebrow="隱私權政策"
      title="我們只蒐集讓服務正常運作所需的資料。"
      description="InboxPilot 會處理帳號、Instagram 連接、自動化、對話、標籤與付款狀態等資料。這份政策說明我們如何使用與保護這些資料。"
      ctaLabel="資料刪除說明"
      ctaHref="/data-deletion"
      sections={[
        {
          title: "蒐集的資料",
          body: "包含登入 Email、使用者名稱、session、Instagram 帳號資訊、貼文與留言事件、自動化設定、對話內容、標籤、分眾與付款方案狀態。",
        },
        {
          title: "資料用途",
          body: "資料會用於登入驗證、連接 Meta API、執行 Instagram 自動化、管理收件匣、顯示客戶資料、處理付款與改善服務品質。",
        },
        {
          title: "第三方服務",
          body: "InboxPilot 可能使用 Meta、Vercel、Supabase、PayUni 等服務供應商。這些服務只會在必要範圍內處理資料，例如代管、資料庫、OAuth 與付款通知。",
        },
        {
          title: "資料刪除",
          body: "你可以要求刪除帳號與相關資料。若資料涉及交易紀錄或法規保存義務，我們會在可刪除範圍內處理，並保留必要的稽核紀錄。",
        },
      ]}
    />
  );
}
