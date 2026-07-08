import { MarketingInfoPage } from "@/components/marketing/MarketingInfoPage";

export const metadata = {
  title: "InboxPilot 服務條款",
  description: "InboxPilot 使用規範、責任限制與帳務條款。",
};

export default function TermsOfServicePage() {
  return (
    <MarketingInfoPage
      eyebrow="服務條款"
      title="使用 InboxPilot 前，請先了解基本規範。"
      description="本條款說明你使用 InboxPilot 這個 SaaS 工具建立 Instagram 自動化、管理收件匣、連接 Meta 與處理付款時，需要遵守的基本規則。"
      sections={[
        {
          title: "服務範圍",
          body: "InboxPilot is a software product operated by Luo Shih Lin. InboxPilot 為羅仕林個人開發與營運之自動化行銷工具，提供 Instagram 自動回覆、視覺化流程、收件匣、標籤、分眾、AI 回覆與帳務管理等 SaaS 功能。部分功能可能會依方案、平台限制或開發進度調整。",
        },
        {
          title: "使用者責任",
          body: "你需要確保自己的 Meta / Instagram 帳號、授權、素材與發送內容符合法規與平台政策。請勿發送垃圾訊息、詐騙內容、侵權內容或未經同意的行銷訊息，也不得冒用他人身分或未授權資產。",
        },
        {
          title: "自動化內容",
          body: "只有在你完成授權並主動啟用相關流程後，InboxPilot 才會執行 Instagram 自動化功能。你應該自行檢查自動化回覆內容、關鍵字、標籤與接手條件是否正確。若 Meta API、網路、第三方服務或設定錯誤造成訊息未送達，InboxPilot 會協助排查，但不保證每一則訊息都能成功送出。",
        },
        {
          title: "付款與方案",
          body: "付費方案、升降級、續約與退款規則會以方案頁與付款頁顯示為準。正式自動付款啟用前，白名單客戶可能會採人工收款與人工開通；正式付款會透過 PayUNI 頁面完成，InboxPilot 不會保存完整卡號、CVV、OTP 或 3D 驗證資料。",
        },
        {
          title: "退款與取消",
          body: "退款、取消訂閱、付款爭議與帳務更正會依實際訂單、已使用服務、第三方金流狀態與雙方約定處理。若付款已完成但方案未同步，請提供註冊 Email、發票或訂單資訊，我們會協助核對。",
        },
        {
          title: "資料與多租戶邊界",
          body: "InboxPilot 以 workspace 作為資料隔離單位。你只能操作自己有權限的 workspace、channel、聯絡人、對話、自動化與帳務資料；不得嘗試存取、測試或干擾其他使用者的資料。",
        },
        {
          title: "平台政策與可用性限制",
          body: "InboxPilot 不保證 Meta App Review、Instagram API 權限、Business Verification、第三方金流、Webhook 或平台政策會永久維持相同可用性。若平台政策、權限或審核條件變更，部分功能可能需要重新授權、暫時限制或停止使用。",
        },
        {
          title: "聯絡與主體對應",
          body: "如需聯絡營運者、申請資料刪除、回報 Meta / Instagram 授權問題或處理帳務爭議，請使用 zeroyuanbrothers@gmail.com。對外品牌為 InboxPilot，營運主體為 Luo Shih Lin / 羅仕林，正式網站為 https://inboxpilot.carry-digital-nomad.in.net/。",
        },
      ]}
    />
  );
}
