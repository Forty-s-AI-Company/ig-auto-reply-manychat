import { MarketingInfoPage } from "@/components/marketing/MarketingInfoPage";

export const metadata = {
  title: "InboxPilot",
  description: "InboxPilot 的官方介紹頁，說明 Instagram 自動化、收件匣與 Flow Builder。",
};

export default function InboxPilotPage() {
  return (
    <MarketingInfoPage
      eyebrow="InboxPilot"
      title="你的 Instagram 自動化副駕駛。"
      description="InboxPilot 參考 ManyChat 的直覺操作方式，提供 Instagram 留言關鍵字、私訊回覆、視覺化流程、收件匣與客戶標籤。目標不是做一個漂亮空殼，而是讓團隊每天真的可以少複製貼上幾百次。"
      sections={[
        {
          title: "像積木一樣建立流程",
          body: "透過 Flow Builder 新增訊息、條件、動作、等待與使用者輸入節點，再把節點串成完整對話流程。",
          items: ["Message 訊息", "Condition 條件", "Action 動作", "Delay 延遲"],
        },
        {
          title: "從留言開始接住客戶",
          body: "選擇指定貼文或全部貼文，設定關鍵字後自動按讚、回覆留言或發送私訊，讓活動、導購與名單收集更穩。",
        },
        {
          title: "收件匣不只是聊天",
          body: "每一則對話都能指派、提醒、加標籤、收藏或加入熱門名單，避免客戶在團隊交接時被漏掉。",
        },
        {
          title: "繁體中文優先",
          body: "官方網站與後台介面都以繁體中文為預設，功能命名盡量貼近日常客服與社群營運用語。",
        },
      ]}
    />
  );
}
