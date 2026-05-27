import { MarketingInfoPage } from "@/components/marketing/MarketingInfoPage";

export const metadata = {
  title: "InboxPilot 範本",
  description: "Instagram 留言、私訊、FAQ 與名單分眾自動化範本。",
};

export default function TemplatesPage() {
  return (
    <MarketingInfoPage
      eyebrow="範本"
      title="用範本快速建立 Instagram 自動化。"
      description="InboxPilot 的範本會參考 ManyChat 常見情境，把留言關鍵字、私訊回覆、標籤與條件分流整理成可以直接調整的流程。"
      ctaLabel="建立自動化"
      ctaHref="/automations"
      sections={[
        {
          title: "留言關鍵字回覆",
          body: "當使用者在指定貼文留言關鍵字時，自動按讚留言並發送私訊。適合電子書、優惠碼、活動報名與 LINE OA 導流。",
          items: ["指定貼文或全部貼文", "關鍵字條件", "自動按讚", "私訊回覆"],
        },
        {
          title: "導購分流",
          body: "依照使用者點選的按鈕或回答，把對話導到不同商品、服務或真人客服，讓銷售流程更清楚。",
        },
        {
          title: "FAQ 自動回覆",
          body: "把常見問題整理成回覆節點，搭配 AI 或固定內容回覆，降低重複客服成本。",
          items: ["價格問題", "出貨時間", "預約方式", "付款與退款"],
        },
        {
          title: "名單培育",
          body: "透過標籤與分眾，把新客、熱客、已購買與待追蹤對象分開，後續再搭配群發或真人跟進。",
        },
      ]}
    />
  );
}
