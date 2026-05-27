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
      description="本條款說明你使用 InboxPilot 建立 Instagram 自動化、管理收件匣、連接 Meta 與處理付款時，需要遵守的基本規則。"
      sections={[
        {
          title: "服務範圍",
          body: "InboxPilot 提供 Instagram 自動回覆、視覺化流程、收件匣、標籤、分眾、AI 回覆與帳務管理等功能。部分功能可能會依方案或開發進度調整。",
        },
        {
          title: "使用者責任",
          body: "你需要確保 Meta / Instagram 帳號、授權與發送內容符合法規與平台政策。請勿發送垃圾訊息、詐騙內容、侵權內容或未經同意的行銷訊息。",
        },
        {
          title: "自動化內容",
          body: "你應該自行檢查自動化回覆內容是否正確。若 Meta API、網路、第三方服務或設定錯誤造成訊息未送達，InboxPilot 會協助排查，但不保證每一則訊息都能成功送出。",
        },
        {
          title: "付款與方案",
          body: "付費方案、升降級、續約與退款規則會以方案頁與付款頁顯示為準。若付款服務或銀行處理延遲，方案狀態可能需要短時間同步。",
        },
      ]}
    />
  );
}
