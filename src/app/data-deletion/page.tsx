import { MarketingInfoPage } from "@/components/marketing/MarketingInfoPage";

export const metadata = {
  title: "InboxPilot 資料刪除說明",
  description: "InboxPilot 使用者資料刪除申請方式與處理範圍。",
};

export default function DataDeletionPage() {
  return (
    <MarketingInfoPage
      eyebrow="資料刪除"
      title="你可以要求刪除 InboxPilot 保存的個人資料。"
      description="如果你曾使用 Facebook 或 Instagram 授權登入、連接 Instagram 專業帳號，或在 InboxPilot 建立自動化與對話資料，可以依照本頁方式申請刪除。"
      ctaLabel="寄信申請刪除"
      ctaHref="mailto:zeroyuanbrothers@gmail.com?subject=InboxPilot%20資料刪除申請"
      sections={[
        {
          title: "如何提出申請",
          body: "請寄信到 zeroyuanbrothers@gmail.com，主旨填寫「InboxPilot 資料刪除申請」。信件中請提供你的註冊 Email、Facebook 名稱或 Instagram 帳號名稱，方便我們確認資料歸屬。",
          items: ["註冊 Email", "Facebook 或 Instagram 帳號名稱", "希望刪除的資料範圍", "可協助辨識的截圖或頁面資訊"],
        },
        {
          title: "可刪除的資料",
          body: "我們可以刪除與你帳號相關的登入資料、Instagram 連接資訊、自動化設定、對話紀錄、聯絡人標籤、分眾資料與測試資料。若資料已由 Meta 或第三方平台保存，仍需依照該平台的刪除機制處理。",
        },
        {
          title: "處理時間",
          body: "收到完整申請後，我們通常會在 30 天內完成確認與刪除。若需要補充資料確認身分，我們會用你來信的 Email 回覆。",
        },
        {
          title: "可能保留的資料",
          body: "若資料涉及付款、帳務、資安稽核、法律保存義務或防止濫用，我們可能會保留必要紀錄，但會限制用途，只用於符合法規或服務安全的目的。",
        },
        {
          title: "Meta 與付款資料",
          body: "若你要求刪除 Meta / Instagram 連接資料，我們會移除 InboxPilot 內保存的 channel token、連接設定與相關自動化資料。若資料涉及 PayUNI 訂單、發票、退款、爭議款或稽核紀錄，會依法律與對帳需求保存必要紀錄。",
        },
      ]}
    />
  );
}
