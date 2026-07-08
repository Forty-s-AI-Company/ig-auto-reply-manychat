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
      description="InboxPilot 由羅仕林個人開發與營運，會處理帳號、Instagram 連接、自動化、對話、標籤與付款狀態等資料。這份政策說明我們如何使用、保護與刪除這些資料。"
      ctaLabel="資料刪除說明"
      ctaHref="/data-deletion"
      sections={[
        {
          title: "營運主體",
          body: "InboxPilot is a software product operated by Luo Shih Lin. InboxPilot 為羅仕林個人開發與營運之自動化行銷工具。除非未來另有正式商業登記與更新公告，InboxPilot 並不是獨立公司或法人名稱。",
        },
        {
          title: "我們會存取哪些 Meta / Instagram 資料",
          body: "包含登入 Email、使用者名稱、session、Instagram 專業帳號基本資料、貼文與留言事件、私訊與對話上下文、聯絡人標籤、分眾、自動化設定，以及付款方案與交易狀態。",
        },
        {
          title: "為什麼需要這些資料",
          body: "這些資料只用於登入驗證、連接 Meta API、執行 Instagram 自動化、管理收件匣與聯絡人、顯示 channel scope、處理付款方案、支援客服與改善服務穩定性。",
        },
        {
          title: "資料如何使用與分享",
          body: "InboxPilot 可能使用 Meta、Vercel、Supabase、PayUNI 等服務供應商。這些服務只會在必要範圍內處理資料，例如 OAuth、Webhook 事件、應用代管、資料庫保存與付款通知。信用卡號、CVV、OTP 與 3D 驗證會在 PayUNI 或銀行頁面處理，InboxPilot 不會保存完整卡號或驗證碼。",
        },
        {
          title: "資料保存與隔離",
          body: "Workspace、channel、聯絡人、對話、自動化與帳務資料會依權限隔離。正式環境不應使用全域 Meta token 代替使用者連接的 channel token。若資料涉及付款、發票、退款、資安稽核或法律保存義務，會保留必要紀錄並限制用途。",
        },
        {
          title: "資料刪除與聯絡方式",
          body: "你可以透過資料刪除頁面或寄信到 zeroyuanbrothers@gmail.com 要求刪除資料。若資料涉及交易紀錄或法規保存義務，我們會在可刪除範圍內處理，並保留必要的稽核紀錄。Meta reviewer 可直接使用本站的 Data Deletion 頁面確認刪除流程與聯絡方式。",
        },
      ]}
    />
  );
}
