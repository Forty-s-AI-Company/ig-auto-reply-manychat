"use client";

import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import {
  Bot,
  Check,
  ChevronLeft,
  Clock,
  Folder,
  GitBranch,
  Heart,
  ImageIcon,
  ListChecks,
  MessageSquareText,
  MoreVertical,
  MousePointer2,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Send,
  Sparkles,
  Tag,
  Trash2,
  Wand2,
  Workflow,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AutomationScopeBanner } from "@/components/AutomationScopeBanner";

type StepType = "send_message" | "add_tag" | "remove_tag" | "wait" | "condition" | "ai_reply" | "set_field";
type TriggerType = "keyword" | "new_contact" | "manual" | "webhook";
type PreviewMode = "preview" | "test";
type PostSelectionMode = "specific" | "all" | "next" | "continue";
type AutomationView = "overview" | "folder" | "editor";
type AutomationTab = "my" | "basic" | "sequences";
type AutomationTriggerFilter = "all" | TriggerType;
type TemplateCategory =
  | "all"
  | "grow-followers"
  | "engage-audience"
  | "drive-traffic"
  | "post-comment"
  | "dm"
  | "story-reply"
  | "live-comment";

type AutomationStep = {
  id?: string;
  order: number;
  type: StepType;
  configJson: Record<string, unknown>;
};

type AutomationRun = {
  id: string;
  status: "running" | "completed" | "failed";
  currentStep: number;
  logsJson: unknown;
  createdAt: string;
  updatedAt: string;
  contact?: { id: string; displayName: string; username?: string | null } | null;
};

type AutomationItem = {
  id: string;
  name: string;
  enabled: boolean;
  triggerType: TriggerType;
  triggerConfigJson: Record<string, unknown>;
  folderId?: string | null;
  folder?: { id: string; name: string } | null;
  steps: AutomationStep[];
  runs?: AutomationRun[];
  updatedAt?: string;
};

type FlowDraft = {
  id?: string;
  folderId?: string | null;
  name: string;
  enabled: boolean;
  triggerType: TriggerType;
  keywords: string;
  match: "contains" | "exact";
  postSelectionMode: PostSelectionMode;
  selectedPostId: string;
  selectedPostLabel: string;
  delayEnabled: boolean;
  delaySeconds: number;
  autoLike: boolean;
  publicReplyEnabled: boolean;
  publicReplyText: string;
};

type InstagramMediaItem = {
  id: string;
  caption?: string;
  mediaType?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  permalink?: string;
  timestamp?: string;
};

type AutomationFolder = {
  id: string;
  name: string;
  updatedAt?: string;
  _count?: { automations: number };
};

type BasicAutomationItem = {
  title: string;
  description: string;
  status: string;
  action: string;
  href?: string;
  disabledReason?: string;
  testId?: string;
};

type AutomationBuilderClientProps = {
  initialItems: AutomationItem[];
  initialFolders: AutomationFolder[];
  selectedChannelName?: string | null;
  isSimpleRelease: boolean;
};

type AutomationTemplate = {
  id: string;
  title: string;
  description: string;
  kind: "Quick Automation" | "Flow Builder";
  categories: TemplateCategory[];
  triggerLabel: string;
  goalLabel: string;
  badge?: string;
  keywords: string;
  publicReplyText: string;
  dmText: string;
  tagName: string;
  fieldValue: string;
  steps?: StepType[];
};

type FlowNodeData = Record<string, unknown> & {
  kind: "trigger" | "step";
  stepType?: StepType;
  label: string;
  summary: string;
  step?: AutomationStep;
};

type FlowSnapshot = {
  nodes?: Array<{ id: string; position: { x: number; y: number } }>;
  edges?: Edge[];
};

const emptyDraft: FlowDraft = {
  name: "Canva變現",
  enabled: true,
  triggerType: "keyword",
  keywords: "canva, 學習, 学习, can, tips, tip",
  match: "contains",
  postSelectionMode: "specific",
  selectedPostId: "",
  selectedPostLabel: "選擇指定貼文或 Reels",
  delayEnabled: true,
  delaySeconds: 3,
  autoLike: true,
  publicReplyEnabled: true,
  publicReplyText: "私訊傳給你囉✨請記得追蹤我，以免收不到訊息！",
};

const stepMeta: Record<StepType, { label: string; description: string; iconName: string }> = {
  send_message: { label: "傳送訊息", description: "文字、連結、圖片說明或行動呼籲。", iconName: "message" },
  add_tag: { label: "加入標籤", description: "替聯絡人加上指定標籤。", iconName: "tag" },
  remove_tag: { label: "移除標籤", description: "移除聯絡人身上的標籤。", iconName: "trash" },
  wait: { label: "等待", description: "延遲幾秒後再進下一步。", iconName: "clock" },
  condition: { label: "條件分流", description: "依訊息、標籤或欄位走不同路徑。", iconName: "branch" },
  ai_reply: { label: "AI 回覆", description: "使用知識庫或 AI 產生回覆。", iconName: "bot" },
  set_field: { label: "更新欄位", description: "儲存電子信箱、電話或其他資料。", iconName: "wand" },
};

const triggerFilterOptions: Array<{ value: AutomationTriggerFilter; label: string }> = [
  { value: "all", label: "所有觸發條件" },
  { value: "keyword", label: "關鍵字 / 留言" },
  { value: "new_contact", label: "新聯絡人" },
  { value: "manual", label: "手動觸發" },
  { value: "webhook", label: "Webhook" },
];

const triggerTypeLabels: Record<TriggerType, string> = {
  keyword: "關鍵字 / 留言",
  new_contact: "新聯絡人",
  manual: "手動觸發",
  webhook: "Webhook",
};

const defaultSteps: AutomationStep[] = [
  {
    order: 1,
    type: "condition",
    configJson: {
      title: "留言關鍵字判斷",
      source: "commentText",
      operator: "contains",
      value: "canva, 學習, 学习, can, tips, tip",
    },
  },
  {
    order: 2,
    type: "send_message",
    configJson: {
      title: "留言後公開提醒",
      text: "私訊傳給你囉✨請記得追蹤我，以免收不到訊息！",
    },
  },
  {
    order: 3,
    type: "wait",
    configJson: { title: "等待私訊送達", seconds: 3 },
  },
  {
    order: 4,
    type: "send_message",
    configJson: {
      title: "私訊主訊息",
      text:
        "這是我靠 Canva + IG\n從零到賺進百萬的精華✨\n\n✅ 一份完整教學指南\n✅ 三堂 IG 變現免費課程\n\n點下方按鈕進入 0 元產品頁面\n輸入姓名、Email\n免費教學指南就會寄到你的信箱囉\n\n🌟 第一次領取可能信件會跑去「促銷內容」或「垃圾郵件」\n請務必到 Email 查看\n\n⬇️⬇️⬇️ 點擊按鈕立即領取 ⬇️⬇️⬇️\n\n領取免費指南與課程：{{demo_link}}",
    },
  },
  {
    order: 5,
    type: "condition",
    configJson: {
      title: "是否已追蹤",
      source: "tag",
      operator: "contains",
      value: "已追蹤",
    },
  },
  {
    order: 6,
    type: "send_message",
    configJson: {
      title: "未追蹤提醒",
      text: "嗨～請先追蹤我，再到陌生訊息查看唷✅",
    },
  },
  {
    order: 7,
    type: "send_message",
    configJson: {
      title: "備用回覆",
      text: "收到你的留言囉😆 私訊給你了，追蹤我才能收到🫶🏻",
    },
  },
  { order: 8, type: "add_tag", configJson: { title: "標記 Canva 名單", tagName: "canva-lead" } },
  {
    order: 9,
    type: "set_field",
    configJson: { title: "記錄來源", field: "source", value: "Canva變現留言自動化" },
  },
];

const defaultNodePositions: Record<string, { x: number; y: number }> = {
  trigger: { x: 40, y: 220 },
  "step-1": { x: 400, y: 220 },
  "step-2": { x: 760, y: 140 },
  "step-3": { x: 1120, y: 140 },
  "step-4": { x: 1480, y: 120 },
  "step-5": { x: 1840, y: 250 },
  "step-6": { x: 2200, y: 120 },
  "step-7": { x: 760, y: 430 },
  "step-8": { x: 1120, y: 430 },
  "step-9": { x: 1480, y: 430 },
};

const defaultEdges: Edge[] = [
  { id: "edge-trigger-keywords", source: "trigger", target: "step-1", animated: true, style: { strokeWidth: 2 } },
  { id: "edge-keywords-comment", source: "step-1", target: "step-2", animated: true, style: { strokeWidth: 2 } },
  { id: "edge-comment-wait", source: "step-2", target: "step-3", animated: true, style: { strokeWidth: 2 } },
  { id: "edge-wait-main-dm", source: "step-3", target: "step-4", animated: true, style: { strokeWidth: 2 } },
  { id: "edge-main-follow-check", source: "step-4", target: "step-5", animated: true, style: { strokeWidth: 2 } },
  { id: "edge-follow-reminder", source: "step-5", target: "step-6", animated: true, style: { strokeWidth: 2 } },
  { id: "edge-keywords-fallback", source: "step-1", target: "step-7", animated: true, style: { strokeWidth: 2 } },
  { id: "edge-fallback-tag", source: "step-7", target: "step-8", animated: true, style: { strokeWidth: 2 } },
  { id: "edge-tag-source", source: "step-8", target: "step-9", animated: true, style: { strokeWidth: 2 } },
];

const flowNodeWidth = 280;
const flowNodeStartX = 400;
const flowNodeGapX = 360;
const flowNodeDefaultY = 180;

const canvaSingleReplyDraft: FlowDraft = {
  name: "Canva變現",
  enabled: true,
  triggerType: "keyword",
  keywords: "canva, 學習, 学习, can, tips, tip",
  match: "contains",
  postSelectionMode: "specific",
  selectedPostId: "",
  selectedPostLabel: "選擇貼文或 Reels",
  delayEnabled: false,
  delaySeconds: 0,
  autoLike: true,
  publicReplyEnabled: true,
  publicReplyText: "私訊傳給你囉，請記得追蹤我，以免收不到訊息！",
};

const canvaSingleReplyText =
  "私訊傳給你囉，這是我靠 Canva + IG\n" +
  "從零到賺進百萬的精華✨\n\n" +
  "✅ 一份完整教學指南\n" +
  "✅ 三堂 IG 變現免費課程\n\n" +
  "點下方連結進入 0 元產品頁面\n" +
  "輸入姓名、Email\n" +
  "免費教學指南就會寄到你的信箱囉\n\n" +
  "第一次領取可能信件會跑去「促銷內容」或「垃圾郵件」\n" +
  "請務必到 Email 查看\n\n" +
  "領取免費指南與課程：{{demo_link}}\n\n" +
  "也請記得追蹤我，之後我才能繼續回覆你唷。";

const canvaSingleReplySteps: AutomationStep[] = [
  {
    order: 1,
    type: "condition",
    configJson: {
      title: "留言關鍵字判斷",
      source: "commentText",
      operator: "contains",
      value: "canva, 學習, 学习, can, tips, tip",
    },
  },
  {
    order: 2,
    type: "send_message",
    configJson: {
      title: "留言後私訊主內容",
      text: canvaSingleReplyText,
    },
  },
  { order: 3, type: "add_tag", configJson: { title: "標記 Canva 名單", tagName: "canva-lead" } },
  {
    order: 4,
    type: "set_field",
    configJson: { title: "記錄來源", field: "locale", value: "Canva變現留言自動化" },
  },
];

const canvaSingleReplyEdges: Edge[] = [
  { id: "edge-trigger-keywords", source: "trigger", target: "step-1", animated: true, style: { strokeWidth: 2 } },
  { id: "edge-keywords-dm", source: "step-1", target: "step-2", animated: true, style: { strokeWidth: 2 } },
  { id: "edge-dm-tag", source: "step-2", target: "step-3", animated: true, style: { strokeWidth: 2 } },
  { id: "edge-tag-source", source: "step-3", target: "step-4", animated: true, style: { strokeWidth: 2 } },
];

const automationTabs: Array<{ id: AutomationTab; label: string; description: string; iconName: "list" | "branch" | "workflow" }> = [
  { id: "my", label: "我的自動化", description: "資料夾、所有自動化與自訂流程。", iconName: "list" },
  { id: "basic", label: "基礎流程", description: "固定入口與 Instagram 基礎自動化。", iconName: "branch" },
  { id: "sequences", label: "序列流程", description: "依時間分批傳送的一系列訊息。", iconName: "workflow" },
];

const templateCategories: Array<{ id: TemplateCategory; label: string; group?: string }> = [
  { id: "all", label: "所有模板" },
  { id: "grow-followers", label: "增加追蹤者", group: "依目標" },
  { id: "engage-audience", label: "提高互動", group: "依目標" },
  { id: "drive-traffic", label: "導入流量", group: "依目標" },
  { id: "post-comment", label: "貼文 / Reels 留言", group: "依觸發" },
  { id: "dm", label: "私訊", group: "依觸發" },
  { id: "story-reply", label: "限動回覆", group: "依觸發" },
  { id: "live-comment", label: "直播留言", group: "依觸發" },
];

const automationTemplates: AutomationTemplate[] = [
  {
    id: "auto-dm-links-from-comments",
    title: "留言自動私訊連結",
    description: "當用戶在貼文或 Reels 留言時，自動送出連結。",
    kind: "Quick Automation",
    categories: ["all", "post-comment", "drive-traffic"],
    triggerLabel: "貼文 / Reels 留言",
    goalLabel: "導入連結流量",
    badge: "熱門",
    keywords: "連結, link, 資料, 想要",
    publicReplyText: "私訊連結給你囉，請查看 IG 私訊。",
    dmText: "嗨，這是你要的連結：{{link}}\n\n有問題可以直接回覆這則訊息。",
    tagName: "comment-link-lead",
    fieldValue: "留言索取連結",
  },
  {
    id: "generate-leads-with-stories",
    title: "限動收集名單",
    description: "用限時優惠或限動互動，把回覆者轉成名單。",
    kind: "Quick Automation",
    categories: ["all", "story-reply", "drive-traffic"],
    triggerLabel: "限動回覆",
    goalLabel: "收集潛在客戶",
    keywords: "我要, 優惠, offer, yes",
    publicReplyText: "",
    dmText: "收到你的限動回覆囉！這裡是限時優惠資訊：{{offer_link}}\n\n想保留名額的話，請直接回覆「我要」。",
    tagName: "story-lead",
    fieldValue: "限動名單",
  },
  {
    id: "respond-to-all-dms",
    title: "回覆所有私訊",
    description: "收到私訊時，自動送出客製化回覆。",
    kind: "Quick Automation",
    categories: ["all", "dm", "engage-audience", "drive-traffic"],
    triggerLabel: "私訊",
    goalLabel: "提高回覆效率",
    keywords: "any",
    publicReplyText: "",
    dmText: "嗨，訊息已收到！我會盡快回覆你。\n\n你也可以先點這裡查看常見問題：{{faq_link}}",
    tagName: "dm-auto-replied",
    fieldValue: "私訊自動回覆",
  },
  {
    id: "grow-followers-from-comments",
    title: "留言增加追蹤者",
    description: "用留言觸發私訊，鼓勵用戶追蹤帳號。",
    kind: "Quick Automation",
    categories: ["all", "grow-followers", "post-comment"],
    triggerLabel: "貼文 / Reels 留言",
    goalLabel: "增加追蹤者",
    keywords: "追蹤, follow, 我要",
    publicReplyText: "私訊給你囉，追蹤帳號後就能收到後續內容。",
    dmText: "謝謝你的留言！先追蹤我們，接下來會持續分享更多實用內容。\n\n完成後回覆「已追蹤」。",
    tagName: "follow-growth",
    fieldValue: "留言追蹤活動",
  },
  {
    id: "send-affiliate-product-links",
    title: "發送聯盟商品連結",
    description: "把合作商品照片、介紹與購買連結送到私訊。",
    kind: "Quick Automation",
    categories: ["all", "post-comment", "drive-traffic"],
    triggerLabel: "貼文 / Reels 留言",
    goalLabel: "導購分潤",
    keywords: "商品, product, link, 價格",
    publicReplyText: "商品資訊私訊給你囉。",
    dmText: "這是你詢問的商品資訊：\n{{product_name}}\n{{affiliate_link}}\n\n下單前可以回覆我你的問題。",
    tagName: "affiliate-lead",
    fieldValue: "聯盟商品留言",
  },
  {
    id: "automate-conversations-with-ai",
    title: "AI 自動對話",
    description: "讓 AI 收集需求、介紹方案並推薦產品。",
    kind: "Flow Builder",
    categories: ["all", "dm", "engage-audience"],
    triggerLabel: "私訊",
    goalLabel: "AI 對話",
    keywords: "問題, 推薦, help, ai",
    publicReplyText: "",
    dmText: "嗨，我先了解你的需求，再推薦適合的方案。請告訴我你目前最想解決的問題。",
    tagName: "ai-qualified",
    fieldValue: "AI 對話名單",
    steps: ["send_message", "ai_reply", "condition", "add_tag"],
  },
  {
    id: "auto-reply-to-comment-in-dm",
    title: "留言後私訊商品清單",
    description: "留言觸發後，在 IG 私訊送出商品列表。",
    kind: "Flow Builder",
    categories: ["all", "post-comment", "drive-traffic"],
    triggerLabel: "貼文 / Reels 留言",
    goalLabel: "商品導購",
    keywords: "清單, 商品, list",
    publicReplyText: "商品清單已私訊給你。",
    dmText: "這是商品清單：\n1. {{product_1}}\n2. {{product_2}}\n3. {{product_3}}\n\n想看哪一個請直接回覆編號。",
    tagName: "product-lineup",
    fieldValue: "留言商品清單",
  },
  {
    id: "auto-send-links-in-dm",
    title: "私訊自動發送連結",
    description: "把網站、活動頁或報名連結自動送到私訊。",
    kind: "Flow Builder",
    categories: ["all", "dm", "drive-traffic", "engage-audience"],
    triggerLabel: "私訊",
    goalLabel: "導入網站",
    keywords: "連結, 官網, website, 報名",
    publicReplyText: "",
    dmText: "這是你要的連結：{{website_link}}\n\n看完後可以回覆我你的想法。",
    tagName: "dm-link-click",
    fieldValue: "私訊連結",
  },
  {
    id: "follow-first-then-freebie",
    title: "先追蹤再領取贈品",
    description: "確認用戶追蹤後，再送出免費資源。",
    kind: "Flow Builder",
    categories: ["all", "grow-followers", "post-comment"],
    triggerLabel: "貼文 / Reels 留言",
    goalLabel: "追蹤換贈品",
    keywords: "贈品, freebie, 免費",
    publicReplyText: "私訊你領取方式囉，記得先追蹤。",
    dmText: "先追蹤我們，再回覆「已追蹤」，我就把免費資源送給你：{{freebie_link}}",
    tagName: "freebie-follower",
    fieldValue: "追蹤換贈品",
    steps: ["send_message", "condition", "wait", "send_message", "add_tag"],
  },
  {
    id: "grow-email-list",
    title: "收集 Email 名單",
    description: "用免費資源或優惠，引導用戶留下 Email。",
    kind: "Flow Builder",
    categories: ["all", "dm", "drive-traffic"],
    triggerLabel: "私訊",
    goalLabel: "Email 名單",
    keywords: "email, 信箱, 名單, 免費",
    publicReplyText: "",
    dmText: "我可以把免費資源寄給你，請回覆你的 Email。\n\n例如：hello@example.com",
    tagName: "email-lead",
    fieldValue: "Email 名單",
    steps: ["send_message", "set_field", "add_tag"],
  },
  {
    id: "run-giveaway",
    title: "抽獎活動",
    description: "用留言與私訊建立抽獎流程，提高互動。",
    kind: "Flow Builder",
    categories: ["all", "grow-followers", "engage-audience", "post-comment"],
    triggerLabel: "貼文 / Reels 留言",
    goalLabel: "互動抽獎",
    keywords: "抽獎, giveaway, 參加",
    publicReplyText: "收到參加留言囉，抽獎資訊私訊給你。",
    dmText: "你已完成抽獎登記！請確認已追蹤並分享貼文，開獎會在 {{draw_date}} 公布。",
    tagName: "giveaway-entry",
    fieldValue: "抽獎活動",
  },
  {
    id: "grow-youtube",
    title: "導流 YouTube",
    description: "把 IG 受眾導到 YouTube 訂閱或觀看影片。",
    kind: "Flow Builder",
    categories: ["all", "dm", "drive-traffic", "engage-audience"],
    triggerLabel: "私訊",
    goalLabel: "YouTube 導流",
    keywords: "youtube, 影片, 訂閱",
    publicReplyText: "",
    dmText: "這是 YouTube 影片連結：{{youtube_link}}\n\n喜歡的話也歡迎訂閱頻道。",
    tagName: "youtube-lead",
    fieldValue: "YouTube 導流",
  },
  {
    id: "recognize-questions-in-dm-with-ai",
    title: "AI 辨識私訊問題",
    description: "辨識常見問題並自動回覆。",
    kind: "Flow Builder",
    categories: ["all", "dm", "engage-audience", "drive-traffic"],
    triggerLabel: "私訊",
    goalLabel: "AI FAQ",
    keywords: "問題, 怎麼, 多少, 是否",
    publicReplyText: "",
    dmText: "我先幫你判斷問題類型，並用知識庫回覆你。",
    tagName: "ai-faq",
    fieldValue: "AI 常見問題",
    badge: "AI",
    steps: ["ai_reply", "condition", "send_message", "add_tag"],
  },
  {
    id: "dm-your-course-like-a-closer",
    title: "課程私訊銷售",
    description: "讓用戶私訊索取課程資訊或早鳥連結。",
    kind: "Flow Builder",
    categories: ["all", "dm", "drive-traffic"],
    triggerLabel: "私訊",
    goalLabel: "課程銷售",
    keywords: "課程, course, 報名",
    publicReplyText: "",
    dmText: "這是課程資訊與早鳥連結：{{course_link}}\n\n想知道是否適合你，可以回覆你的目標。",
    tagName: "course-lead",
    fieldValue: "課程銷售",
  },
  {
    id: "trigger-dms-during-ig-live",
    title: "直播留言觸發私訊",
    description: "直播中透過關鍵留言送出連結與名單表單。",
    kind: "Flow Builder",
    categories: ["all", "live-comment", "drive-traffic"],
    triggerLabel: "直播留言",
    goalLabel: "直播導流",
    keywords: "直播, live, 我要",
    publicReplyText: "直播資訊已私訊給你。",
    dmText: "謝謝你參與直播！這是直播提到的連結：{{live_offer_link}}",
    tagName: "live-lead",
    fieldValue: "直播留言",
  },
  {
    id: "go-from-instagram-to-whatsapp",
    title: "導到 WhatsApp",
    description: "把 IG 受眾移轉到 WhatsApp 對話。",
    kind: "Flow Builder",
    categories: ["all", "dm", "drive-traffic"],
    triggerLabel: "私訊",
    goalLabel: "WhatsApp 導流",
    keywords: "whatsapp, wa, 聯絡",
    publicReplyText: "",
    dmText: "你可以透過 WhatsApp 和我們聯繫：{{whatsapp_link}}",
    tagName: "whatsapp-lead",
    fieldValue: "WhatsApp 導流",
  },
  {
    id: "gamify-instagram-live",
    title: "直播遊戲互動",
    description: "用直播留言觸發遊戲、抽獎或任務。",
    kind: "Flow Builder",
    categories: ["all", "live-comment", "engage-audience"],
    triggerLabel: "直播留言",
    goalLabel: "直播互動",
    keywords: "遊戲, game, 抽獎",
    publicReplyText: "你已加入直播互動挑戰。",
    dmText: "挑戰開始！請完成以下任務並回覆截圖：{{game_task}}",
    tagName: "live-game",
    fieldValue: "直播遊戲",
  },
  {
    id: "answer-faqs-from-story-replies",
    title: "限動回覆 FAQ",
    description: "自動回答限動回覆裡的常見問題。",
    kind: "Flow Builder",
    categories: ["all", "story-reply", "engage-audience"],
    triggerLabel: "限動回覆",
    goalLabel: "FAQ 回覆",
    keywords: "問題, 價格, 怎麼",
    publicReplyText: "",
    dmText: "這是常見問題整理：{{faq_link}}\n\n如果沒有回答到，直接回覆我。",
    tagName: "story-faq",
    fieldValue: "限動 FAQ",
  },
  {
    id: "get-more-collabs-from-story-replies",
    title: "限動合作邀約",
    description: "處理限動回覆中的合作、邀約與報價需求。",
    kind: "Flow Builder",
    categories: ["all", "story-reply", "engage-audience"],
    triggerLabel: "限動回覆",
    goalLabel: "合作洽談",
    keywords: "合作, collab, 報價",
    publicReplyText: "",
    dmText: "謝謝你的合作邀約！請回覆品牌、活動內容與預算，我會整理後回覆你。",
    tagName: "collab-lead",
    fieldValue: "限動合作",
  },
  {
    id: "give-coupons-in-stories",
    title: "限動優惠券",
    description: "用限動互動發送私密優惠券。",
    kind: "Flow Builder",
    categories: ["all", "story-reply", "drive-traffic"],
    triggerLabel: "限動回覆",
    goalLabel: "優惠轉換",
    keywords: "優惠, coupon, 折扣",
    publicReplyText: "",
    dmText: "這是你的限動專屬優惠碼：{{coupon_code}}\n使用期限到 {{expires_at}}。",
    tagName: "story-coupon",
    fieldValue: "限動優惠券",
  },
  {
    id: "send-offers-in-dms-during-live",
    title: "直播私訊優惠",
    description: "直播中收到指定留言後發送優惠或商品連結。",
    kind: "Flow Builder",
    categories: ["all", "live-comment", "drive-traffic"],
    triggerLabel: "直播留言",
    goalLabel: "直播轉換",
    keywords: "優惠, offer, 連結",
    publicReplyText: "直播優惠私訊給你囉。",
    dmText: "直播限定優惠：{{live_offer_link}}\n\n優惠只到今晚，想要可以直接下單。",
    tagName: "live-offer",
    fieldValue: "直播優惠",
  },
  {
    id: "sell-from-reel-comments",
    title: "Reels 留言銷售",
    description: "把 Reel 留言轉成私訊商品介紹。",
    kind: "Flow Builder",
    categories: ["all", "post-comment", "drive-traffic"],
    triggerLabel: "貼文 / Reels 留言",
    goalLabel: "Reels 銷售",
    keywords: "買, 價格, 哪裡買",
    publicReplyText: "商品資訊私訊給你囉。",
    dmText: "這是 Reel 裡的商品：{{reel_product_link}}\n\n需要尺寸或用法也可以問我。",
    tagName: "reel-sales",
    fieldValue: "Reels 銷售",
  },
  {
    id: "turn-comments-into-rsvps",
    title: "留言轉報名",
    description: "用留言觸發報名確認與活動資訊。",
    kind: "Flow Builder",
    categories: ["all", "post-comment", "drive-traffic"],
    triggerLabel: "貼文 / Reels 留言",
    goalLabel: "活動報名",
    keywords: "報名, rsvp, 參加",
    publicReplyText: "報名資訊私訊給你囉。",
    dmText: "你已收到活動報名資訊：{{event_link}}\n\n完成表單後回覆「已完成」。",
    tagName: "event-rsvp",
    fieldValue: "活動報名",
  },
  {
    id: "qualify-with-a-quiz",
    title: "問卷分流",
    description: "透過問題分流、貼標籤，送出適合的方案。",
    kind: "Flow Builder",
    categories: ["all", "dm", "engage-audience", "drive-traffic"],
    triggerLabel: "私訊",
    goalLabel: "名單分級",
    keywords: "測驗, quiz, 推薦",
    publicReplyText: "",
    dmText: "先回答 2 個問題，我會推薦最適合你的方案。\n\n問題 1：你的主要目標是什麼？",
    tagName: "quiz-qualified",
    fieldValue: "問卷分流",
    steps: ["send_message", "condition", "set_field", "add_tag"],
  },
  {
    id: "grow-sms-list",
    title: "收集 SMS 名單",
    description: "透過 IG 私訊收集手機號碼或簡訊訂閱。",
    kind: "Flow Builder",
    categories: ["all", "dm", "drive-traffic"],
    triggerLabel: "私訊",
    goalLabel: "SMS 名單",
    keywords: "sms, 簡訊, 手機",
    publicReplyText: "",
    dmText: "請回覆手機號碼，我們會把簡訊優惠傳給你。\n\n例如：0912345678",
    tagName: "sms-lead",
    fieldValue: "SMS 名單",
    steps: ["send_message", "set_field", "add_tag"],
  },
];

const basicAutomations: BasicAutomationItem[] = [
  {
    title: "預設回覆",
    description: "當用戶傳入私訊但沒有命中其他自動化時，立即送出預設回覆。",
    status: "已停止",
    action: "設定",
    href: "/automations/instagram-default-reply",
  },
  {
    title: "新追蹤者歡迎訊息",
    description: "用戶第一次追蹤後，送出一次性的歡迎私訊。此功能需 Meta 官方 API 支援。",
    status: "暫不可用",
    action: "暫不可用",
    disabledReason: "此功能需要 Meta 官方 API 與事件支援，現在先保留說明，不做假按鈕。",
    testId: "automation-basic-disabled-new-follower",
  },
  {
    title: "對話開場白",
    description: "在 Instagram 私訊入口顯示常見問題按鈕，點擊後觸發指定回覆。",
    status: "規劃中",
    action: "受控開通",
    disabledReason: "對話開場白需要先接好 Instagram 入口按鈕與對應流程，目前只保留說明。",
    testId: "automation-basic-disabled-opening-prompts",
  },
  {
    title: "限動提及回覆",
    description: "當用戶在限動提及你的帳號時，自動送出感謝訊息或啟動流程。",
    status: "規劃中",
    action: "受控開通",
    disabledReason: "限動提及觸發還沒有完整的資料與事件串接，先不讓它看起來像已可直接使用。",
    testId: "automation-basic-disabled-story-mentions",
  },
  {
    title: "主選單",
    description: "建立私訊底部的選單，協助追蹤者快速找到常見資訊。",
    status: "規劃中",
    action: "受控開通",
    disabledReason: "主選單會牽涉 Instagram 訊息入口配置，還沒整理成可直接啟用的流程。",
    testId: "automation-basic-disabled-main-menu",
  },
];

void emptyDraft;
void defaultSteps;
void defaultEdges;

function IconByName({ name, className }: { name: string; className?: string }) {
  if (name === "list") return <ListChecks className={className} />;
  if (name === "workflow") return <Workflow className={className} />;
  if (name === "send") return <Send className={className} />;
  const props = { className };
  if (name === "tag") return <Tag {...props} />;
  if (name === "trash") return <Trash2 {...props} />;
  if (name === "clock") return <Clock {...props} />;
  if (name === "branch") return <GitBranch {...props} />;
  if (name === "bot") return <Bot {...props} />;
  if (name === "wand") return <Wand2 {...props} />;
  return <MessageSquareText {...props} />;
}

function keywordList(config: Record<string, unknown>) {
  return Array.isArray(config.keywords) ? config.keywords.map(String) : [];
}

function getFlowSnapshot(config: Record<string, unknown>): FlowSnapshot {
  const flow = config.flow;
  if (!flow || typeof flow !== "object") return {};
  return flow as FlowSnapshot;
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function numberValue(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function booleanValue(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function postModeValue(value: unknown): PostSelectionMode {
  return value === "all" || value === "next" || value === "continue" || value === "specific" ? value : "specific";
}

function postSelectionLabel(mode: PostSelectionMode) {
  if (mode === "all") return "所有貼文或 Reels";
  if (mode === "next") return "下一篇貼文或 Reels";
  if (mode === "continue") return "沿用目前設定";
  return "指定貼文或 Reels";
}

function mediaTitle(item: InstagramMediaItem) {
  const caption = item.caption?.replace(/\s+/g, " ").trim();
  if (caption) return caption.length > 52 ? `${caption.slice(0, 52)}...` : caption;
  return `${item.mediaType || "MEDIA"} ${item.id}`;
}

function stepSummary(step: AutomationStep) {
  if (step.configJson.title) return String(step.configJson.title);
  if (step.type === "send_message") return String(step.configJson.text || "尚未設定訊息內容");
  if (step.type === "add_tag") return `加入標籤：${String(step.configJson.tagName || "lead")}`;
  if (step.type === "remove_tag") return `移除標籤：${String(step.configJson.tagName || "lead")}`;
  if (step.type === "wait") return `等待 ${String(step.configJson.seconds || 5)} 秒`;
  if (step.type === "ai_reply") return "使用 AI / 知識庫自動回覆";
  if (step.type === "set_field") return `${String(step.configJson.field || "email")} = ${String(step.configJson.value || "")}`;
  return `${String(step.configJson.source || "訊息")} ${String(step.configJson.operator || "包含")} ${String(step.configJson.value || "")}`;
}

function createStep(type: StepType, order: number): AutomationStep {
  if (type === "send_message") return { order, type, configJson: { text: "嗨，這是新的自動回覆訊息。" } };
  if (type === "add_tag") return { order, type, configJson: { tagName: "lead" } };
  if (type === "remove_tag") return { order, type, configJson: { tagName: "lead" } };
  if (type === "wait") return { order, type, configJson: { seconds: 5 } };
  if (type === "condition") return { order, type, configJson: { source: "inboundText", operator: "contains", value: "" } };
  if (type === "set_field") return { order, type, configJson: { field: "email", value: "" } };
  return { order, type, configJson: {} };
}

function buildTemplateSteps(template: AutomationTemplate): AutomationStep[] {
  const types = template.steps || ["condition", "send_message", "wait", "send_message", "add_tag", "set_field"];
  return types.map((type, index) => {
    const order = index + 1;
    if (type === "condition") {
      return {
        order,
        type,
        configJson: {
          title: `${template.triggerLabel}條件判斷`,
          source: template.categories.includes("dm") ? "inboundText" : template.categories.includes("story-reply") ? "storyReply" : template.categories.includes("live-comment") ? "liveComment" : "commentText",
          operator: "contains",
          value: template.keywords,
        },
      };
    }
    if (type === "send_message") {
      const isFirstMessage = !types.slice(0, index).includes("send_message");
      return {
        order,
        type,
        configJson: {
          title: isFirstMessage ? template.goalLabel : "後續私訊內容",
          text: isFirstMessage ? template.dmText : "謝謝你的回覆，我們會依照你的需求接著協助你。",
        },
      };
    }
    if (type === "wait") return { order, type, configJson: { title: "等待後續互動", seconds: 3 } };
    if (type === "add_tag") return { order, type, configJson: { title: `標記 ${template.goalLabel}`, tagName: template.tagName } };
    if (type === "set_field") {
      return {
        order,
        type,
        configJson: { title: "記錄來源", field: "source", value: template.fieldValue },
      };
    }
    if (type === "ai_reply") {
      return {
        order,
        type,
        configJson: { title: "AI 判斷與回覆", instruction: "依照用戶訊息、知識庫與商品資訊產生下一則回覆。" },
      };
    }
    return createStep(type, order);
  });
}

function buildTemplateDraft(template: AutomationTemplate, folderId?: string | null): FlowDraft {
  return {
    ...canvaSingleReplyDraft,
    folderId: folderId || null,
    name: template.title,
    keywords: template.keywords,
    publicReplyEnabled: Boolean(template.publicReplyText),
    publicReplyText: template.publicReplyText,
    delayEnabled: true,
    delaySeconds: 3,
    selectedPostLabel: template.triggerLabel,
    postSelectionMode: template.categories.includes("post-comment") ? "specific" : "continue",
  };
}

function buildTemplateGraph(template: AutomationTemplate, draft: FlowDraft) {
  const steps = buildTemplateSteps(template);
  const nodes: Node<FlowNodeData>[] = [
    makeTriggerNode(draft, true),
    ...steps.map((step, index) =>
      makeStepNode(step, `step-${index + 1}`, defaultNodePositions[`step-${index + 1}`] || { x: flowNodeStartX + index * flowNodeGapX, y: flowNodeDefaultY }),
    ),
  ];
  const edges = steps.map((_, index) => ({
    id: `template-edge-${index}`,
    source: index === 0 ? "trigger" : `step-${index}`,
    target: `step-${index + 1}`,
    animated: true,
    style: { strokeWidth: 2 },
  }));
  return { nodes, edges };
}

function makeStepNode(step: AutomationStep, id: string, position: { x: number; y: number }, selected = false): Node<FlowNodeData> {
  const meta = stepMeta[step.type];
  return {
    id,
    type: "flowNode",
    position,
    selected,
    data: {
      kind: "step",
      stepType: step.type,
      label: String(step.configJson.title || meta.label),
      summary: stepSummary(step),
      step,
    },
  };
}

function makeTriggerNode(draft: FlowDraft, selected = false): Node<FlowNodeData> {
  return {
    id: "trigger",
    type: "flowNode",
    position: defaultNodePositions.trigger,
    selected,
    data: {
      kind: "trigger",
      label: "當用戶留言於貼文/Reels",
      summary:
        draft.triggerType === "keyword"
          ? `${postSelectionLabel(draft.postSelectionMode)} · 留言包含：${draft.keywords || "尚未設定"}`
          : draft.triggerType,
    },
  };
}

function buildDraft(item?: AutomationItem): FlowDraft {
  if (!item) return canvaSingleReplyDraft;
  const config = item.triggerConfigJson || {};
  return {
    id: item.id,
    folderId: item.folderId,
    name: item.name,
    enabled: item.enabled,
    triggerType: item.triggerType,
    keywords: keywordList(config).join(", "),
    match: config.match === "exact" ? "exact" : "contains",
    postSelectionMode: postModeValue(config.postSelectionMode),
    selectedPostId: stringValue(config.selectedPostId),
    selectedPostLabel: stringValue(config.selectedPostLabel, "選擇指定貼文或 Reels"),
    delayEnabled: booleanValue(config.delayEnabled, true),
    delaySeconds: numberValue(config.delaySeconds, 3),
    autoLike: booleanValue(config.autoLike, true),
    publicReplyEnabled: booleanValue(config.publicReplyEnabled, true),
    publicReplyText: stringValue(config.publicReplyText, "私訊傳給你囉✨請記得追蹤我，以免收不到訊息！"),
  };
}

function buildGraph(draft: FlowDraft, item?: AutomationItem) {
  const steps = item?.steps?.length ? item.steps.slice().sort((a, b) => a.order - b.order) : canvaSingleReplySteps;
  const snapshot = item ? getFlowSnapshot(item.triggerConfigJson) : {};
  const positionMap = new Map(snapshot.nodes?.map((node) => [node.id, node.position]) || Object.entries(defaultNodePositions));
  const nodes: Node<FlowNodeData>[] = [
    { ...makeTriggerNode(draft, true), position: positionMap.get("trigger") || defaultNodePositions.trigger },
    ...steps.map((step, index) =>
      makeStepNode(step, `step-${index + 1}`, positionMap.get(`step-${index + 1}`) || { x: flowNodeStartX + index * flowNodeGapX, y: flowNodeDefaultY }),
    ),
  ];
  const edges =
    snapshot.edges?.length
      ? snapshot.edges
      : !item
        ? canvaSingleReplyEdges
      : steps.map((_, index) => ({
          id: `edge-${index}`,
          source: index === 0 ? "trigger" : `step-${index}`,
          target: `step-${index + 1}`,
          animated: true,
          style: { strokeWidth: 2 },
        }));
  return { nodes, edges };
}

function toPayload(draft: FlowDraft, nodes: Node<FlowNodeData>[], edges: Edge[]) {
  const keywords = draft.keywords
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
  const stepNodes = nodes
    .filter((node) => node.data.kind === "step" && node.data.step)
    .sort((a, b) => {
      const aOrder = a.data.step?.order;
      const bOrder = b.data.step?.order;
      if (typeof aOrder === "number" && typeof bOrder === "number") return aOrder - bOrder;
      return a.position.x - b.position.x || a.position.y - b.position.y;
    });
  const steps = stepNodes.map((node, index) => ({
    ...(node.data.step as AutomationStep),
    order: index + 1,
  }));
  const flow = {
    nodes: nodes.map((node) => ({ id: node.id, position: node.position })),
    edges,
  };

  return {
    name: draft.name.trim(),
    folderId: draft.folderId || null,
    enabled: draft.enabled,
    triggerType: draft.triggerType,
    triggerConfigJson:
      draft.triggerType === "keyword"
        ? {
            keywords,
            match: draft.match,
            postSelectionMode: draft.postSelectionMode,
            selectedPostId: draft.selectedPostId,
            selectedPostLabel: draft.selectedPostLabel,
            delayEnabled: draft.delayEnabled,
            delaySeconds: draft.delaySeconds,
            autoLike: draft.autoLike,
            publicReplyEnabled: draft.publicReplyEnabled,
            publicReplyText: draft.publicReplyText,
            flow,
          }
        : { source: draft.triggerType, flow },
    steps,
  };
}

function formatDateTime(value?: string) {
  if (!value) return "尚未更新";
  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour24 = date.getHours();
  const period = hour24 < 12 ? "上午" : "下午";
  const hour12 = String(hour24 % 12 || 12).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${month}/${day} ${period}${hour12}:${minute}`;
}

function FlowNode({ id, data, selected }: NodeProps<Node<FlowNodeData>>) {
  const isTrigger = data.kind === "trigger";
  const iconName = data.stepType ? stepMeta[data.stepType].iconName : "sparkles";
  const notifySelection = () => window.dispatchEvent(new CustomEvent("automation-flow-node-select", { detail: id }));

  return (
    <div
      onPointerDown={notifySelection}
      onClick={notifySelection}
      data-testid={`flow-node-${id}`}
      className={`max-w-[280px] cursor-pointer rounded-md border bg-white p-4 shadow-md transition ${
        selected ? "border-emerald-500 ring-2 ring-emerald-200" : isTrigger ? "border-emerald-300" : "border-zinc-200"
      }`}
      style={{ width: flowNodeWidth }}
    >
      {!isTrigger ? <Handle type="target" position={Position.Left} className="!h-4 !w-4 !border-2 !bg-blue-500" /> : null}
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-zinc-100">
          {isTrigger ? <Sparkles className="h-5 w-5 text-emerald-600" /> : <IconByName name={iconName} className="h-5 w-5 text-blue-600" />}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-zinc-950">{data.label}</p>
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-zinc-500">{data.summary}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!h-4 !w-4 !border-2 !bg-blue-500" />
    </div>
  );
}

const nodeTypes = { flowNode: FlowNode };

function StepConfigEditor({
  node,
  draft,
  mediaItems,
  mediaLoading,
  mediaError,
  mediaErrorActionHref,
  onDraftChange,
  onRefreshMedia,
  onChange,
}: {
  node?: Node<FlowNodeData>;
  draft: FlowDraft;
  mediaItems: InstagramMediaItem[];
  mediaLoading: boolean;
  mediaError: string;
  mediaErrorActionHref: string;
  onDraftChange: (draft: FlowDraft) => void;
  onRefreshMedia: () => void;
  onChange: (node: Node<FlowNodeData>) => void;
}) {
  if (!node) return null;

  if (node.data.kind === "trigger") {
    const postOptions: Array<{ value: PostSelectionMode; label: string; description: string; badge?: string }> = [
      { value: "specific", label: "指定貼文或 Reels", description: "只在你選定的貼文留言時觸發。" },
      { value: "all", label: "所有貼文或 Reels", description: "所有現有與未來貼文留言都可觸發。", badge: "專業版" },
      { value: "next", label: "下一篇貼文或 Reels", description: "下一次發布的內容留言才啟動。", badge: "專業版" },
      { value: "continue", label: "沿用目前設定", description: "保留既有貼文範圍，繼續下一步設定。" },
    ];

    return (
      <div className="space-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">步驟 1 / 3</p>
          <h3 className="mt-2 text-xl font-semibold text-zinc-950">留言觸發條件</h3>
          <p className="mt-1 text-sm text-zinc-500">選擇哪些 IG 貼文或 Reels 的留言要進入這個自動化。</p>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-zinc-700">自動化名稱</span>
          <input
            value={draft.name}
            onChange={(event) => onDraftChange({ ...draft, name: event.target.value })}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 outline-none focus:border-blue-500"
          />
        </label>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-zinc-700">貼文範圍</p>
            <button
              type="button"
              onClick={onRefreshMedia}
              disabled={mediaLoading}
              data-testid="trigger-fetch-media"
              className="inline-flex items-center gap-1 rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50 disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${mediaLoading ? "animate-spin" : ""}`} aria-hidden="true" />
              抓取貼文
            </button>
          </div>
          <div className="grid gap-2">
            {postOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onDraftChange({ ...draft, postSelectionMode: option.value })}
                data-testid={`trigger-post-mode-${option.value}`}
                className={`rounded-md border p-3 text-left transition ${
                  draft.postSelectionMode === option.value
                    ? "border-blue-500 bg-blue-50 ring-1 ring-blue-200"
                    : "border-zinc-200 bg-white hover:border-blue-200 hover:bg-zinc-50"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-medium text-zinc-950">{option.label}</span>
                  {option.badge ? <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">專業版</span> : null}
                </span>
                <span className="mt-1 block text-xs leading-5 text-zinc-500">{option.description}</span>
              </button>
            ))}
          </div>
        </div>

        {draft.postSelectionMode === "specific" ? (
          <div className="rounded-md border border-zinc-200 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
              <ImageIcon className="h-4 w-4 text-blue-600" />
              選擇貼文
            </div>
            {mediaError ? (
              <div className="mb-2 rounded-md bg-amber-50 p-2 text-xs leading-5 text-amber-800">
                <p>{mediaError}</p>
                {mediaErrorActionHref ? (
                  <a href={mediaErrorActionHref} className="mt-1 inline-flex font-semibold text-amber-900 underline underline-offset-2">
                    重新連接 Instagram
                  </a>
                ) : null}
              </div>
            ) : null}
            <select
              value={draft.selectedPostId}
              onChange={(event) => {
                const selected = mediaItems.find((item) => item.id === event.target.value);
                onDraftChange({
                  ...draft,
                  selectedPostId: event.target.value,
                  selectedPostLabel: selected ? mediaTitle(selected) : "選擇指定貼文或 Reels",
                });
              }}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-950 outline-none focus:border-blue-500"
            >
              <option value="">{mediaLoading ? "正在抓取貼文…" : "請選擇一篇貼文或 Reels"}</option>
              {mediaItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {mediaTitle(item)}
                </option>
              ))}
            </select>
            {draft.selectedPostId ? (
              <p className="mt-2 text-xs leading-5 text-zinc-500">目前選擇：{draft.selectedPostLabel || draft.selectedPostId}</p>
            ) : null}
          </div>
        ) : null}

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-zinc-700">留言關鍵字</span>
          <input
            value={draft.keywords}
            onChange={(event) => onDraftChange({ ...draft, keywords: event.target.value })}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 outline-none focus:border-blue-500"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-700">比對方式</span>
            <select
              value={draft.match}
              onChange={(event) => onDraftChange({ ...draft, match: event.target.value === "exact" ? "exact" : "contains" })}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 outline-none focus:border-blue-500"
            >
              <option value="contains">包含任一關鍵字</option>
              <option value="exact">完全符合</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-700">延遲秒數</span>
            <input
              type="number"
              min="0"
              value={draft.delaySeconds}
              onChange={(event) => onDraftChange({ ...draft, delaySeconds: Number(event.target.value) })}
              disabled={!draft.delayEnabled}
              data-testid="trigger-delay-seconds"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 outline-none focus:border-blue-500 disabled:bg-zinc-100"
            />
          </label>
        </div>

        <div className="grid gap-2">
          <label className="flex items-center gap-2 rounded-md border border-zinc-200 p-3 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={draft.delayEnabled}
              onChange={(event) => onDraftChange({ ...draft, delayEnabled: event.target.checked })}
              data-testid="trigger-delay-enabled"
            />
            延遲後再執行自動化
          </label>
          <label className="flex items-center gap-2 rounded-md border border-zinc-200 p-3 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={draft.autoLike}
              onChange={(event) => onDraftChange({ ...draft, autoLike: event.target.checked })}
              data-testid="trigger-auto-like"
            />
            <Heart className="h-4 w-4 text-rose-500" />
            自動幫符合條件的留言按讚
          </label>
          <label className="flex items-center gap-2 rounded-md border border-zinc-200 p-3 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={draft.publicReplyEnabled}
              onChange={(event) => onDraftChange({ ...draft, publicReplyEnabled: event.target.checked })}
              data-testid="trigger-public-reply-enabled"
            />
            自動公開回覆留言
          </label>
        </div>

        {draft.publicReplyEnabled ? (
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-700">公開回覆內容</span>
            <textarea
              value={draft.publicReplyText}
              onChange={(event) => onDraftChange({ ...draft, publicReplyText: event.target.value })}
              rows={3}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 outline-none focus:border-blue-500"
            />
          </label>
        ) : null}

        <label className="flex items-center gap-2 rounded-md border border-zinc-200 p-3 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={draft.enabled}
            onChange={(event) => onDraftChange({ ...draft, enabled: event.target.checked })}
          />
          啟用這個自動化
        </label>
      </div>
    );
  }

  const step = node.data.step;
  if (!step) return null;

  function updateConfig(configJson: Record<string, unknown>) {
    if (!node || !step) return;
    const nextStep = { ...step, configJson };
    onChange({
      ...node,
      id: node.id,
      position: node.position,
      data: {
        ...node.data,
        summary: stepSummary(nextStep),
        step: nextStep,
      },
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">步驟 {step.order}</p>
        <h3 className="mt-2 text-xl font-semibold text-zinc-950">{stepMeta[step.type].label}</h3>
        <p className="mt-1 text-sm text-zinc-500">{stepMeta[step.type].description}</p>
      </div>

      {step.type === "send_message" ? (
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-zinc-700">訊息內容</span>
          <textarea
            value={String(step.configJson.text || "")}
            onChange={(event) => updateConfig({ ...step.configJson, text: event.target.value })}
            rows={8}
            placeholder="輸入要傳送給顧客的訊息…"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 outline-none focus:border-blue-500"
          />
        </label>
      ) : null}

      {step.type === "add_tag" || step.type === "remove_tag" ? (
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-zinc-700">標籤名稱</span>
          <input
            value={String(step.configJson.tagName || "")}
            onChange={(event) => updateConfig({ ...step.configJson, tagName: event.target.value })}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 outline-none focus:border-blue-500"
          />
        </label>
      ) : null}

      {step.type === "wait" ? (
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-zinc-700">等待秒數</span>
          <input
            type="number"
            min="1"
            value={String(step.configJson.seconds || 5)}
            onChange={(event) => updateConfig({ ...step.configJson, seconds: Number(event.target.value) })}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 outline-none focus:border-blue-500"
          />
        </label>
      ) : null}

      {step.type === "condition" ? (
        <div className="grid gap-3">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-700">來源</span>
            <select
              value={String(step.configJson.source || "inboundText")}
              onChange={(event) => updateConfig({ ...step.configJson, source: event.target.value })}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 outline-none focus:border-blue-500"
            >
              <option value="commentText">IG 留言內容</option>
              <option value="inboundText">用戶訊息</option>
              <option value="tag">聯絡人標籤</option>
              <option value="consentStatus">訂閱狀態</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-700">條件</span>
            <select
              value={String(step.configJson.operator || "contains")}
              onChange={(event) => updateConfig({ ...step.configJson, operator: event.target.value })}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 outline-none focus:border-blue-500"
            >
              <option value="contains">包含</option>
              <option value="not_contains">不包含</option>
              <option value="equals">等於</option>
              <option value="not_equals">不等於</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-700">比對值</span>
            <input
              value={String(step.configJson.value || "")}
              onChange={(event) => updateConfig({ ...step.configJson, value: event.target.value })}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 outline-none focus:border-blue-500"
            />
          </label>
        </div>
      ) : null}

      {step.type === "set_field" ? (
        <div className="grid gap-3">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-700">欄位</span>
            <select
              value={String(step.configJson.field || "email")}
              onChange={(event) => updateConfig({ ...step.configJson, field: event.target.value })}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 outline-none focus:border-blue-500"
            >
              <option value="displayName">顯示名稱</option>
              <option value="username">使用者名稱</option>
              <option value="email">電子信箱</option>
              <option value="phone">電話</option>
              <option value="source">來源</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-700">值</span>
            <input
              value={String(step.configJson.value || "")}
              onChange={(event) => updateConfig({ ...step.configJson, value: event.target.value })}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 outline-none focus:border-blue-500"
            />
          </label>
        </div>
      ) : null}

      {step.type === "ai_reply" ? (
        <div className="rounded-md border border-blue-100 bg-blue-50 p-3 text-sm leading-6 text-blue-900">
          這個節點會依照知識庫與 AI 設定自動產生回覆。下一階段可以再把模型、語氣、資料來源做成細項設定。
        </div>
      ) : null}
    </div>
  );
}

function FlowBuilderInner({
  initialItems,
  initialFolders,
  selectedChannelName,
  isSimpleRelease,
}: AutomationBuilderClientProps) {
  const [items, setItems] = useState(initialItems);
  const [folders, setFolders] = useState(initialFolders);
  const [view, setView] = useState<AutomationView>("overview");
  const [activeTab, setActiveTab] = useState<AutomationTab>("my");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templateCategory, setTemplateCategory] = useState<TemplateCategory>("all");
  const [templateSearch, setTemplateSearch] = useState("");
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderSaving, setFolderSaving] = useState(false);
  const [draft, setDraft] = useState<FlowDraft>(() => buildDraft());
  const initialGraph = useMemo(() => buildGraph(canvaSingleReplyDraft), []);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<FlowNodeData>>(initialGraph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialGraph.edges);
  const [selectedNodeId, setSelectedNodeId] = useState("trigger");
  const [search, setSearch] = useState("");
  const [triggerFilter, setTriggerFilter] = useState<AutomationTriggerFilter>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "stopped">("all");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("preview");
  const [editorOpen, setEditorOpen] = useState(true);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState<InstagramMediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaError, setMediaError] = useState("");
  const [mediaErrorActionHref, setMediaErrorActionHref] = useState("");
  const nodeCounterRef = useRef(1000);
  const previewPanelRef = useRef<HTMLDivElement | null>(null);
  const { fitView, screenToFlowPosition } = useReactFlow();

  const selectedNode = nodes.find((node) => node.id === selectedNodeId);
  const selectedStep = selectedNode?.data.step;
  const firstMessage =
    nodes.find((node) => node.data.step?.type === "send_message" && node.data.step.configJson.title === "私訊主訊息")?.data.step ||
    nodes.find((node) => node.data.step?.type === "send_message")?.data.step;
  const previewText = String(firstMessage?.configJson.text || "嗨，這是自動回覆訊息。");
  const visibleItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchesTrigger = triggerFilter === "all" || item.triggerType === triggerFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && item.enabled) ||
        (statusFilter === "stopped" && !item.enabled);
      return matchesSearch && matchesTrigger && matchesStatus;
    });
  }, [items, search, statusFilter, triggerFilter]);
  const selectedFolder = selectedFolderId ? folders.find((folder) => folder.id === selectedFolderId) || null : null;
  const folderItems = useMemo(
    () => visibleItems.filter((item) => (selectedFolderId ? item.folderId === selectedFolderId : true)),
    [selectedFolderId, visibleItems],
  );
  const folderCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const folder of folders) counts.set(folder.id, 0);
    for (const item of items) {
      if (!item.folderId) continue;
      counts.set(item.folderId, (counts.get(item.folderId) || 0) + 1);
    }
    return counts;
  }, [folders, items]);
  const visibleTemplates = useMemo(() => {
    const keyword = templateSearch.trim().toLowerCase();
    return automationTemplates.filter((template) => {
      const matchesCategory = templateCategory === "all" || template.categories.includes(templateCategory);
      const matchesSearch =
        !keyword ||
        template.title.toLowerCase().includes(keyword) ||
        template.description.toLowerCase().includes(keyword) ||
        template.goalLabel.toLowerCase().includes(keyword) ||
        template.triggerLabel.toLowerCase().includes(keyword);
      return matchesCategory && matchesSearch;
    });
  }, [templateCategory, templateSearch]);

  const selectNode = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    setEditorOpen(true);
    setNodes((current) => current.map((node) => ({ ...node, selected: node.id === nodeId })));
  }, [setNodes]);

  useEffect(() => {
    function handleNodeSelect(event: Event) {
      const nodeId = (event as CustomEvent<string>).detail;
      if (typeof nodeId === "string") selectNode(nodeId);
    }

    window.addEventListener("automation-flow-node-select", handleNodeSelect);
    return () => window.removeEventListener("automation-flow-node-select", handleNodeSelect);
  }, [selectNode]);

  useEffect(() => {
    setNodes((current) =>
      current.map((node) => {
        if (node.id === "trigger") {
          return { ...makeTriggerNode(draft, node.selected), position: node.position };
        }

        const step = node.data.step;
        if (!step) return node;

        if (step.configJson.title === "留言後公開提醒") {
          const nextStep = {
            ...step,
            configJson: { ...step.configJson, text: draft.publicReplyEnabled ? draft.publicReplyText : "" },
          };
          return { ...node, data: { ...node.data, summary: stepSummary(nextStep), step: nextStep } };
        }

        if (step.configJson.title === "等待私訊送達") {
          const nextStep = {
            ...step,
            configJson: { ...step.configJson, seconds: draft.delayEnabled ? draft.delaySeconds : 0 },
          };
          return { ...node, data: { ...node.data, summary: stepSummary(nextStep), step: nextStep } };
        }

        return node;
      }),
    );
  }, [draft, setNodes]);

  const refreshMedia = useCallback(async () => {
    setMediaLoading(true);
    setMediaError("");
    setMediaErrorActionHref("");
    try {
      const response = await fetch("/api/instagram/media", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMediaErrorActionHref(typeof data.actionHref === "string" ? data.actionHref : "");
        throw new Error(typeof data.message === "string" ? data.message : data.error || "無法讀取 IG 貼文。");
      }
      setMediaItems(Array.isArray(data.items) ? data.items : []);
      if (!data.items?.length) setMediaError(data.warning || "目前沒有讀到可選擇的貼文或 Reels。");
    } catch (err) {
      setMediaItems([]);
      setMediaError(err instanceof Error ? err.message : "無法讀取 IG 貼文。");
    } finally {
      setMediaLoading(false);
    }
  }, []);

  async function reload() {
    const [automationsResponse, foldersResponse] = await Promise.all([
      fetch("/api/automations"),
      fetch("/api/automation-folders"),
    ]);
    if (automationsResponse.ok) setItems(await automationsResponse.json());
    if (foldersResponse.ok) setFolders(await foldersResponse.json());
  }

  function loadAutomation(item?: AutomationItem) {
    const nextDraft = item ? buildDraft(item) : { ...canvaSingleReplyDraft, folderId: selectedFolderId };
    const graph = buildGraph(nextDraft, item);
    setDraft(nextDraft);
    setNodes(graph.nodes.map((node) => ({ ...node, selected: node.id === "trigger" })));
    setEdges(graph.edges);
    setSelectedNodeId("trigger");
    setEditorOpen(true);
    setError("");
    setView("editor");
  }

  function loadTemplate(template: AutomationTemplate) {
    const nextDraft = buildTemplateDraft(template, selectedFolderId);
    const graph = buildTemplateGraph(template, nextDraft);
    setDraft(nextDraft);
    setNodes(graph.nodes.map((node) => ({ ...node, selected: node.id === "trigger" })));
    setEdges(graph.edges);
    setSelectedNodeId("trigger");
    setEditorOpen(true);
    setError("");
    setTemplateDialogOpen(false);
    setActiveTab("my");
    setView("editor");
  }

  async function createFolder() {
    const name = folderName.trim();
    if (!name) {
      setError("請輸入資料夾名稱。");
      return;
    }
    setFolderSaving(true);
    setError("");
    try {
      const response = await fetch("/api/automation-folders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "建立資料夾失敗。");
      await reload();
      setFolderName("");
      setFolderDialogOpen(false);
      setSelectedFolderId(data.id);
      setView("folder");
    } catch (err) {
      setError(err instanceof Error ? err.message : "建立資料夾失敗。");
    } finally {
      setFolderSaving(false);
    }
  }

  function addStep(type: StepType, position = { x: 480, y: 280 }) {
    nodeCounterRef.current += 1;
    const id = `step-${nodeCounterRef.current}`;
    const step = createStep(type, nodes.filter((node) => node.data.kind === "step").length + 1);
    const nextNode = makeStepNode(step, id, position, true);
    setNodes((current) => [...current.map((node) => ({ ...node, selected: false })), nextNode]);
    setSelectedNodeId(id);
    setEditorOpen(true);
    setLibraryOpen(false);
  }

  function autoArrange() {
    setNodes((current) =>
      current.map((node, index) => ({
        ...node,
        position: defaultNodePositions[node.id] || (node.id === "trigger" ? defaultNodePositions.trigger : { x: flowNodeStartX + (index - 1) * flowNodeGapX, y: flowNodeDefaultY }),
      })),
    );
    window.setTimeout(() => fitView({ padding: 0.18, duration: 350 }), 50);
  }

  function updateNode(nextNode: Node<FlowNodeData>) {
    setNodes((current) => current.map((node) => (node.id === nextNode.id ? { ...nextNode, selected: true } : node)));
  }

  function deleteSelectedNode() {
    if (!selectedNode || selectedNode.id === "trigger") return;
    setNodes((current) => current.filter((node) => node.id !== selectedNode.id).map((node) => ({ ...node, selected: node.id === "trigger" })));
    setEdges((current) => current.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
    setSelectedNodeId("trigger");
  }

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((current) => addEdge({ ...connection, animated: true, style: { strokeWidth: 2 } }, current)),
    [setEdges],
  );

  function onDragStart(event: React.DragEvent<HTMLButtonElement>, type: StepType) {
    event.dataTransfer.setData("application/x-step-type", type);
    event.dataTransfer.effectAllowed = "move";
  }

  function onDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const type = event.dataTransfer.getData("application/x-step-type") as StepType;
    if (!type) return;
    addStep(type, screenToFlowPosition({ x: event.clientX, y: event.clientY }));
  }

  async function saveFlow() {
    setError("");
    setSaving(true);
    try {
      const payload = toPayload(draft, nodes, edges);
      if (!payload.name) throw new Error("請輸入自動化名稱。");
      if (payload.triggerType === "keyword" && !keywordList(payload.triggerConfigJson).length) {
        throw new Error("請至少設定一個關鍵字。");
      }
      if (!payload.steps.length) throw new Error("請至少新增一個流程節點。");

      const endpoint = draft.id ? `/api/automations/${draft.id}` : "/api/automations";
      const response = await fetch(endpoint, {
        method: draft.id ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "儲存失敗。");
      await reload();
      loadAutomation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "儲存失敗。");
    } finally {
      setSaving(false);
    }
  }

  async function deleteFlow(id: string) {
    if (!confirm("確定要刪除這個自動化嗎？")) return;
    await fetch(`/api/automations/${id}`, { method: "DELETE" });
    await reload();
    if (view === "editor") loadAutomation();
  }

  if (view !== "editor") {
    const pageTitle = selectedFolder ? selectedFolder.name : activeTab === "basic" ? "基礎流程" : activeTab === "sequences" ? "序列流程" : "我的自動化";
    const emptyMessage = selectedFolder ? "這裡還沒有內容" : "尚未建立自動化";

    return (
      <div className="w-full bg-[var(--ip-bg)] pb-10 text-[var(--ip-text)]">
        <div className="px-4 pt-4 lg:px-6">
          <AutomationScopeBanner
            badgeLabel="工作區共用"
            notice={
              selectedChannelName
                ? `目前左側選擇的是「${selectedChannelName}」，但自動化流程仍是整個工作區共用。`
                : "自動化目前顯示整個工作區的流程。"
            }
            selectedChannelName={selectedChannelName || undefined}
            releaseNote={isSimpleRelease ? "簡版生產站" : "完整版本"}
            testId="automation-scope-notice"
          />
        </div>
        <div className="border-b border-[var(--ip-border)] bg-[var(--ip-surface)] px-4 py-4 lg:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[28px] font-bold text-[var(--ip-text)]">自動化</h2>
            <button
              type="button"
              onClick={() => setTemplateDialogOpen(true)}
              className="ip-button-primary inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold"
            >
              <Plus className="h-4 w-4" />
              新增自動化
            </button>
          </div>
        </div>

        <div className="w-full px-4 py-5 lg:px-6">
          <div className="grid gap-5 xl:grid-cols-[220px_minmax(0,1fr)]">
            <aside className="min-w-0">
              <nav className="ip-card p-2 xl:sticky xl:top-[76px]" aria-label="自動化分類">
                {automationTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (tab.id !== "my") {
                        setSelectedFolderId(null);
                        setView("overview");
                      }
                    }}
                    className={`flex w-full items-start gap-3 rounded-md px-3 py-3 text-left transition ${
                      activeTab === tab.id ? "bg-[var(--ip-surface-hover)] text-[var(--ip-text)]" : "text-[var(--ip-text-soft)] hover:bg-[var(--ip-surface-muted)]"
                    }`}
                    title={tab.description}
                  >
                    <IconByName
                      name={tab.iconName}
                      className={`mt-0.5 h-5 w-5 shrink-0 ${activeTab === tab.id ? "text-[var(--ip-primary)]" : "text-[var(--ip-muted)]"}`}
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{tab.label}</span>
                      <span className="mt-0.5 block text-xs leading-5 text-[var(--ip-muted)]">{tab.description}</span>
                    </span>
                  </button>
                ))}
              </nav>
            </aside>

            <section className="min-w-0">
              <div className="mb-4 flex flex-wrap items-center gap-3 text-2xl font-bold text-[var(--ip-text)]">
                {selectedFolder ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFolderId(null);
                        setView("overview");
                      }}
                      className="text-lg font-medium text-[var(--ip-muted)] hover:text-[var(--ip-primary)]"
                    >
                      我的自動化
                    </button>
                    <ChevronLeft className="h-5 w-5 rotate-180 text-[var(--ip-muted-2)]" />
                  </>
                ) : null}
                <span>{pageTitle}</span>
              </div>

              {error ? <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

              {activeTab === "my" ? (
            <>
              <div className="mb-4 flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex min-w-0 flex-1 flex-col gap-2 md:flex-row">
                  <label className="flex h-10 min-w-[220px] flex-1 items-center gap-2 rounded-md border border-[var(--ip-border)] bg-[var(--ip-surface)] px-3 text-sm">
                    <Search className="h-4 w-4 text-[var(--ip-muted)]" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="搜尋所有自動化…"
                      className="min-w-0 flex-1 bg-transparent outline-none"
                    />
                  </label>
                  <select
                    value={triggerFilter}
                    onChange={(event) => setTriggerFilter(event.target.value as AutomationTriggerFilter)}
                    data-testid="automation-trigger-filter"
                    aria-label="篩選自動化觸發條件"
                    className="h-10 rounded-md border border-[var(--ip-border)] bg-[var(--ip-surface)] px-3 text-sm text-[var(--ip-muted)] outline-none md:w-[180px]"
                  >
                    {triggerFilterOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
                    className="h-10 rounded-md border border-[var(--ip-border)] bg-[var(--ip-surface)] px-3 text-sm text-[var(--ip-muted)] outline-none md:w-[160px]"
                  >
                    <option value="all">所有狀態</option>
                    <option value="active">啟用中</option>
                    <option value="stopped">已停止</option>
                  </select>
                </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFolderDialogOpen(true)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-dashed border-[var(--ip-primary)] px-4 text-sm font-semibold text-[var(--ip-primary)] hover:bg-[var(--ip-primary-soft)]"
                >
                  <Plus className="h-4 w-4" />
                  新增資料夾
                </button>
                  <button
                    type="button"
                    disabled
                    aria-disabled="true"
                    data-testid="automation-trash-disabled"
                    title="回收桶屬於受控開通功能，需先完成流程還原、永久刪除與稽核紀錄設計。"
                    className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-md px-3 text-sm font-semibold text-[var(--ip-muted-2)] opacity-70"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    回收桶
                  </button>
                </div>
              </div>

              {!selectedFolder ? (
                <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {folders.map((folder) => (
                    <button
                      key={folder.id}
                      type="button"
                      onClick={() => {
                        setSelectedFolderId(folder.id);
                        setView("folder");
                      }}
                      className="flex items-center justify-between rounded-md border border-[var(--ip-border)] bg-[var(--ip-surface)] p-4 text-left shadow-sm hover:border-[var(--ip-primary)]"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <Folder className="h-6 w-6 shrink-0 text-[var(--ip-primary)]" />
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-[var(--ip-text)]">{folder.name}</span>
                          <span className="mt-1 block text-sm text-[var(--ip-muted)]">
                            {folderCounts.get(folder.id) || folder._count?.automations || 0} 個自動化
                          </span>
                        </span>
                      </span>
                      <ChevronLeft className="h-5 w-5 rotate-180 text-[var(--ip-muted-2)]" />
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="mb-3 hidden grid-cols-[minmax(0,1fr)_90px_80px_130px] gap-3 px-3 text-sm text-[var(--ip-muted)] md:grid">
                <span>名稱</span>
                <span>執行</span>
                <span>點擊率</span>
                <span>更新時間</span>
              </div>

              <div className="grid gap-3">
                {folderItems.length ? (
                  folderItems.map((item) => (
                    <article
                      key={item.id}
                      data-testid={`automation-item-${item.triggerType}`}
                      className="rounded-md border border-[var(--ip-border)] bg-[var(--ip-surface)] p-4 shadow-sm"
                    >
                      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_90px_80px_130px_36px] md:items-center">
                        <button type="button" onClick={() => loadAutomation(item)} className="min-w-0 text-left">
                          <span className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded px-2 py-1 text-xs font-bold ${
                                item.enabled ? "bg-emerald-50 text-emerald-700" : "bg-[#eeeeee] text-[#667085]"
                              }`}
                            >
                              {item.enabled ? "啟用" : "已停止"}
                            </span>
                            <span className="truncate text-base font-bold text-[var(--ip-text)]">{item.name}</span>
                          </span>
                          <span className="mt-2 block text-sm text-[var(--ip-muted-2)]">
                            {item.folder?.name ? `${item.folder.name} · ` : ""}
                            {triggerTypeLabels[item.triggerType] || item.triggerType} · {item.steps.length} 個步驟
                          </span>
                        </button>
                        <span className="text-sm font-medium text-[var(--ip-text)]">{item.runs?.length || 0}</span>
                        <span className="text-sm text-[var(--ip-muted)]">尚無</span>
                        <span className="text-sm text-[var(--ip-muted)]">{formatDateTime(item.updatedAt)}</span>
                        <button
                          type="button"
                          onClick={() => deleteFlow(item.id)}
                          aria-label={`刪除自動化 ${item.name}`}
                          className="justify-self-start rounded-md p-2 text-[var(--ip-text-soft)] hover:bg-[var(--ip-surface-hover)] md:justify-self-end"
                        >
                          <MoreVertical className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <div
                    className="rounded-md border border-[var(--ip-border)] bg-[var(--ip-surface)] p-8 text-center text-lg text-[var(--ip-text)] shadow-sm"
                    data-testid="automation-list-empty"
                  >
                    {search || triggerFilter !== "all" || statusFilter !== "all" ? "目前沒有符合篩選條件的自動化" : emptyMessage}
                    {search || triggerFilter !== "all" || statusFilter !== "all" ? (
                      <p className="mt-2 text-sm font-normal text-[var(--ip-muted)]">請調整搜尋、觸發條件或狀態篩選。</p>
                    ) : null}
                  </div>
                )}
              </div>
            </>
              ) : null}

              {activeTab === "basic" ? (
            <div className="grid gap-3">
              {basicAutomations.map((basic) => (
                <article key={basic.title} className="grid gap-4 rounded-md border border-[var(--ip-border)] bg-[var(--ip-surface)] p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_120px] md:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-[#eef0f3] px-2 py-1 text-xs font-semibold text-[#667085]">{basic.status}</span>
                      <h3 className="text-base font-bold text-[var(--ip-text)]">{basic.title}</h3>
                    </div>
                    <p className="mt-2 max-w-4xl text-sm leading-6 text-[var(--ip-muted)]">{basic.description}</p>
                    {basic.disabledReason ? <p className="mt-2 text-xs leading-5 text-[#667085]">{basic.disabledReason}</p> : null}
                  </div>
                  {basic.href ? (
                    <a href={basic.href} className="ip-button-primary inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold">
                      {basic.action}
                    </a>
                  ) : basic.disabledReason ? (
                    <button
                      type="button"
                      disabled
                      title={basic.disabledReason}
                      aria-disabled="true"
                      data-testid={basic.testId}
                      className="inline-flex h-10 items-center justify-center rounded-md border border-dashed border-[var(--ip-border)] px-4 text-sm font-semibold text-[var(--ip-muted-2)] opacity-70"
                    >
                      {basic.action}
                    </button>
                  ) : (
                    <button type="button" className="ip-button-secondary inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold">
                      {basic.action}
                    </button>
                  )}
                </article>
              ))}
            </div>
              ) : null}

              {activeTab === "sequences" ? (
            <div className="flex min-h-[420px] items-center justify-center rounded-md border border-[var(--ip-border)] bg-[var(--ip-surface)] p-8 text-center shadow-sm">
              <div className="max-w-lg">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-cyan-100 text-cyan-700">
                  <Workflow className="h-10 w-10" />
                </div>
                <h3 className="mt-6 text-2xl font-bold text-[var(--ip-text)]">建立第一個序列流程</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--ip-muted)]">
                  序列流程用來在一段時間內自動傳送多則訊息，例如歡迎流程、課程通知、名單培養或活動提醒。
                </p>
                {isSimpleRelease ? (
                  <button
                    type="button"
                    disabled
                    title="序列功能目前只在完整版本開放。簡版生產站先保留說明，不直接開放這個入口。"
                    aria-disabled="true"
                    data-testid="automation-sequence-disabled"
                    className="ip-button-secondary mt-5 inline-flex h-10 cursor-not-allowed items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold opacity-70"
                  >
                    <Plus className="h-4 w-4" />
                    完整版開放
                  </button>
                ) : (
                  <a href="/sequences" className="ip-button-primary mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold">
                    <Plus className="h-4 w-4" />
                    新增序列
                  </a>
                )}
                {isSimpleRelease ? (
                  <p className="mt-3 text-xs leading-5 text-[var(--ip-muted-2)]">
                    目前只是把範圍說清楚，不是假裝序列已經在簡版可直接使用。
                  </p>
                ) : null}
              </div>
            </div>
              ) : null}
            </section>
          </div>
        </div>

        {templateDialogOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-3 sm:p-6">
            <div className="flex max-h-[88vh] w-full max-w-6xl flex-col rounded-md bg-white shadow-2xl">
              <div className="flex items-center justify-between gap-3 border-b border-[#d7dbe0] px-4 py-3">
                <h3 className="text-xl font-bold text-[#202124]">自動化模板</h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTemplateDialogOpen(false);
                      loadAutomation();
                    }}
                    className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d7dbe0] px-3 text-sm font-semibold text-[#344054] hover:bg-[#f8fafc]"
                  >
                    <Plus className="h-4 w-4" />
                    從空白開始
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemplateDialogOpen(false)}
                    aria-label="關閉模板選擇"
                    className="rounded-md p-2 text-[#4b5563] hover:bg-[#f5f5f5]"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="border-b border-[#edf0f2] p-4">
                <label className="flex h-10 items-center gap-2 rounded-md border border-[#d7dbe0] bg-white px-3 text-sm">
                  <Search className="h-4 w-4 text-[#667085]" />
                  <input
                    value={templateSearch}
                    onChange={(event) => setTemplateSearch(event.target.value)}
                    placeholder="搜尋 Instagram 模板…"
                    className="min-w-0 flex-1 bg-transparent outline-none"
                  />
                </label>
              </div>
              <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden md:grid-cols-[220px_minmax(0,1fr)]">
                <aside className="border-b border-[#edf0f2] p-3 md:overflow-y-auto md:border-b-0 md:border-r">
                  <div className="flex gap-2 overflow-x-auto md:block md:space-y-1">
                    {templateCategories.map((category, index) => {
                      const showGroup = category.group && templateCategories[index - 1]?.group !== category.group;
                      return (
                        <div key={category.id} className="md:block">
                          {showGroup ? <p className="hidden px-2 pb-1 pt-4 text-xs font-bold text-[#667085] md:block">{category.group}</p> : null}
                          <button
                            type="button"
                            onClick={() => setTemplateCategory(category.id)}
                            className={`whitespace-nowrap rounded-md px-3 py-2 text-left text-sm font-medium md:w-full ${
                              templateCategory === category.id ? "bg-[#d9d9d9] text-[#202124]" : "text-[#4b5563] hover:bg-[#f2f4f7]"
                            }`}
                          >
                            {category.label}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </aside>
                <main className="min-h-0 overflow-y-auto p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h4 className="text-lg font-bold text-[#202124]">
                      {templateCategories.find((category) => category.id === templateCategory)?.label || "所有模板"}
                    </h4>
                    <span className="text-sm text-[#667085]">{visibleTemplates.length} 個模板</span>
                  </div>
                  <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
                    {visibleTemplates.map((template) => (
                      <article key={template.id} className="flex min-h-[190px] flex-col rounded-md border border-[#e4e7ec] bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <h5 className="text-base font-bold text-[#202124]">{template.title}</h5>
                          {template.badge ? <span className="rounded bg-[#fff7ed] px-2 py-1 text-[11px] font-bold text-[#b45309]">{template.badge}</span> : null}
                        </div>
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#667085]">{template.description}</p>
                        <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#667085]">
                          <span className="rounded bg-[#f2f4f7] px-2 py-1">{template.kind}</span>
                          <span className="rounded bg-[#eef6ff] px-2 py-1 text-[#006fe6]">{template.triggerLabel}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => loadTemplate(template)}
                          className="mt-auto inline-flex h-10 items-center justify-center rounded-md bg-[#0077e6] px-3 text-sm font-semibold text-white hover:bg-[#0064c8]"
                        >
                          使用模板
                        </button>
                      </article>
                    ))}
                  </div>
                  {!visibleTemplates.length ? (
                    <div className="rounded-md border border-[#e4e7ec] p-8 text-center text-sm text-[#667085]">沒有符合條件的模板。</div>
                  ) : null}
                </main>
              </div>
            </div>
          </div>
        ) : null}

        {folderDialogOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-6">
            <div className="w-full max-w-md rounded-md bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-[#d7dbe0] px-5 py-4">
                <h3 className="text-xl font-bold text-[#202124]">建立資料夾</h3>
                <button type="button" onClick={() => setFolderDialogOpen(false)} aria-label="關閉建立資料夾" className="rounded-md p-2 hover:bg-[#f5f5f5]">
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <div className="p-5">
                <label className="block text-sm font-medium text-[#202124]">
                  資料夾名稱
                  <input
                    autoFocus
                    value={folderName}
                    onChange={(event) => setFolderName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") void createFolder();
                    }}
                    placeholder="輸入資料夾名稱…"
                    className="mt-3 h-12 w-full rounded-md border border-[#0077e6] px-3 text-base outline-none ring-1 ring-blue-100"
                  />
                </label>
              </div>
              <div className="flex items-center justify-between border-t border-[#d7dbe0] px-5 py-4">
                <button
                  type="button"
                  onClick={() => setFolderDialogOpen(false)}
                  className="h-11 rounded-md border border-[#d7dbe0] px-4 text-base font-medium text-[#202124] hover:bg-[#f5f5f5]"
                >
                  取消
                </button>
                <button
                  type="button"
                  disabled={folderSaving}
                  onClick={createFolder}
                  className="h-11 rounded-md bg-[#0077e6] px-5 text-base font-semibold text-white hover:bg-[#0064c8] disabled:bg-[#d7dbe0]"
                >
                  {folderSaving ? "建立中…" : "建立"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-112px)] w-full overflow-visible rounded-lg border border-zinc-200 bg-zinc-100 text-zinc-950 lg:h-[calc(100vh-112px)] lg:overflow-hidden">
      <div className="px-4 pt-4 lg:px-6">
        <AutomationScopeBanner
          badgeLabel="工作區共用"
          notice={
            selectedChannelName
              ? `目前左側選擇的是「${selectedChannelName}」，但自動化流程仍是整個工作區共用。`
              : "自動化目前顯示整個工作區的流程。"
          }
          selectedChannelName={selectedChannelName || undefined}
          releaseNote={isSimpleRelease ? "簡版生產站" : "完整版本"}
          testId="automation-scope-notice"
        />
      </div>
      <div className="flex min-h-16 flex-col gap-3 border-b border-zinc-200 bg-white px-3 py-3 sm:px-4 lg:flex-row lg:items-center lg:justify-between lg:py-0">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setView(selectedFolderId ? "folder" : "overview")}
            aria-label="返回自動化列表"
            className="shrink-0 rounded-md p-2 text-zinc-500 hover:bg-zinc-100"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-1 text-xs text-zinc-500 sm:gap-2 sm:text-sm">
              <span>自動化</span>
              <span>/</span>
              <button
                type="button"
                onClick={() => setView(selectedFolderId ? "folder" : "overview")}
                className="max-w-[120px] truncate hover:text-[#006fe6] sm:max-w-[220px]"
              >
                {selectedFolder?.name || "我的自動化"}
              </button>
              <span>/</span>
              <span className="truncate">流程編輯器</span>
            </div>
            <div className="mt-1 flex min-w-0 items-center gap-2">
              <input
                value={draft.name}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                className="min-w-0 max-w-[220px] bg-transparent text-lg font-semibold text-zinc-950 outline-none sm:max-w-none"
              />
              <span className="rounded bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">啟用</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 pl-10 sm:pl-11 lg:pl-0">
          <span className="inline-flex items-center gap-1 text-xs text-zinc-500 sm:text-sm">
            <Check className="h-4 w-4" />
            {draft.id ? "已儲存" : "草稿"}
          </span>
          <button
            type="button"
            onClick={() => {
              setPreviewMode("preview");
              previewPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50"
          >
            預覽
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={saveFlow}
            className="inline-flex items-center gap-2 rounded-md bg-[#006fe6] px-4 py-2 text-sm font-medium text-white hover:bg-[#0057b8] disabled:bg-[#d7dbe0] disabled:text-[#667085]"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {saving ? "儲存中…" : "儲存"}
          </button>
          <button
            type="button"
            disabled
            title="更多操作屬於受控開通功能，需先完成複製、封存、匯出與稽核紀錄設計。"
            aria-label="更多操作受控開通"
            aria-disabled="true"
            data-testid="automation-editor-more-disabled"
            className="cursor-not-allowed rounded-md border border-zinc-300 p-2 text-zinc-400 opacity-60"
          >
            <MoreVertical className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {error ? <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div> : null}

      <div className="grid min-h-0 min-w-0 grid-cols-1 lg:h-[calc(100%-4rem)] lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)_320px]">
        <aside className={`${editorOpen ? "block" : "hidden"} overflow-y-visible border-zinc-200 bg-white lg:overflow-y-auto lg:border-r`}>
          <div className="flex h-14 items-center justify-between border-b border-zinc-200 bg-emerald-50 px-4">
            <div className="min-w-0">
              <p className="truncate font-semibold text-zinc-950">{selectedNode?.data.label || "尚未選取節點"}</p>
              <p className="text-xs text-zinc-500">點選畫布節點即可編輯</p>
            </div>
            <button type="button" onClick={() => setEditorOpen(false)} aria-label="收合節點編輯面板" className="hidden rounded-md p-2 hover:bg-white lg:block">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="space-y-5 p-4">
            <StepConfigEditor
              node={selectedNode}
              draft={draft}
              mediaItems={mediaItems}
              mediaLoading={mediaLoading}
              mediaError={mediaError}
              mediaErrorActionHref={mediaErrorActionHref}
              onDraftChange={setDraft}
              onRefreshMedia={refreshMedia}
              onChange={updateNode}
            />
            {selectedNode?.id !== "trigger" ? (
              <button
                type="button"
                onClick={deleteSelectedNode}
                className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                刪除節點
              </button>
            ) : null}
            <div className="border-t border-zinc-200 pt-4">
              <label className="flex items-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-sm">
                <Search className="h-4 w-4 text-zinc-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="搜尋其他自動化…"
                  className="min-w-0 flex-1 outline-none"
                />
              </label>
              <div className="mt-3 flex gap-2 text-xs">
                {[
                  ["all", "全部"],
                  ["active", "啟用中"],
                  ["stopped", "已停止"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStatusFilter(value as typeof statusFilter)}
                    className={`rounded-md px-2 py-1 ${
                      statusFilter === value ? "bg-[#006fe6] text-white" : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="mt-3 space-y-2">
                {visibleItems.slice(0, 5).map((item) => (
                  <article key={item.id} className="rounded-md border border-zinc-200 p-3 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <button type="button" onClick={() => loadAutomation(item)} className="min-w-0 text-left">
                        <p className="truncate font-medium text-zinc-950">{item.name}</p>
                        <p className="mt-1 text-xs text-zinc-500">{formatDateTime(item.updatedAt)}</p>
                      </button>
                      <button type="button" onClick={() => deleteFlow(item.id)} aria-label={`刪除自動化 ${item.name}`} className="text-zinc-400 hover:text-red-500">
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main className="relative hidden min-w-0 bg-[#f3f6f8] lg:block">
          <div
            className="absolute left-1/2 top-3 z-10 inline-flex -translate-x-1/2 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 shadow"
            data-testid="automation-canvas-editor-hint"
          >
            <MousePointer2 className="h-4 w-4 text-[#006fe6]" aria-hidden="true" />
            點選節點即可編輯
          </div>
          {!editorOpen ? (
            <button
              type="button"
              onClick={() => setEditorOpen(true)}
              aria-label="展開節點編輯面板"
              className="absolute left-3 top-1/2 z-20 rounded-full bg-white p-3 text-zinc-500 shadow hover:text-zinc-950"
            >
              <ChevronLeft className="h-5 w-5 rotate-180" aria-hidden="true" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setLibraryOpen((value) => !value)}
            data-testid="flow-add-node"
            className="absolute right-8 top-20 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-[#006fe6] text-white shadow-xl hover:bg-[#0057b8]"
            aria-label="新增節點"
          >
            <Plus className="h-7 w-7" />
          </button>
          <button
            type="button"
            onClick={autoArrange}
            data-testid="flow-auto-arrange"
            className="absolute right-8 top-40 z-20 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow hover:bg-zinc-50"
          >
            自動排列
          </button>
          {libraryOpen ? (
            <div className="absolute right-8 top-52 z-20 w-72 rounded-lg border border-zinc-200 bg-white p-3 shadow-xl" data-testid="flow-node-library">
              <p className="mb-3 text-sm font-semibold text-zinc-950">新增步驟</p>
              <div className="grid gap-2">
                {(Object.keys(stepMeta) as StepType[]).map((type) => {
                  const meta = stepMeta[type];
                  return (
                    <button
                      key={type}
                      type="button"
                      draggable
                      onDragStart={(event) => onDragStart(event, type)}
                      onClick={() => addStep(type)}
                      className="flex items-center gap-3 rounded-md border border-zinc-200 px-3 py-2 text-left text-sm hover:border-blue-300 hover:bg-blue-50"
                    >
                      <IconByName name={meta.iconName} className="h-4 w-4 text-blue-600" />
                      <span>
                        <span className="block font-medium text-zinc-950">{meta.label}</span>
                        <span className="block text-xs text-zinc-500">{meta.description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="h-full min-h-[520px]" onDrop={onDrop} onDragOver={(event) => event.preventDefault()}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={(_, node) => selectNode(node.id)}
              onNodeDragStart={(_, node) => selectNode(node.id)}
              onSelectionChange={({ nodes: selectedNodes }) => {
                const nextSelectedId = selectedNodes[0]?.id;
                if (nextSelectedId && nextSelectedId !== selectedNodeId) setSelectedNodeId(nextSelectedId);
              }}
              nodeClickDistance={8}
              nodesDraggable
              nodesConnectable
              elementsSelectable
              connectOnClick
              fitView
            >
              <Background />
              <Controls />
              <MiniMap className="!pointer-events-none" style={{ width: 150, height: 100 }} />
            </ReactFlow>
          </div>
        </main>

        <aside ref={previewPanelRef} className="hidden overflow-y-auto border-l border-zinc-200 bg-white xl:block">
          <div className="border-b border-zinc-200 p-4">
            <div className="flex rounded-md bg-zinc-100 p-1 text-sm">
              {(["preview", "test"] as PreviewMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPreviewMode(mode)}
                  className={`flex-1 rounded px-3 py-1.5 ${
                    previewMode === mode ? "bg-white font-medium text-zinc-950 shadow-sm" : "text-zinc-500"
                  }`}
                >
                  {mode === "preview" ? "預覽" : "測試"}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-zinc-950">IG 商業聊天模擬</p>
                <p className="text-xs text-zinc-500">{previewMode === "preview" ? "預覽目前流程" : "測試目前節點路徑"}</p>
              </div>
              <MousePointer2 className="h-4 w-4 text-blue-600" />
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
              <div className="ml-auto max-w-[78%] rounded-2xl rounded-br-md bg-[#006fe6] px-3 py-2 text-sm text-white">
                {draft.keywords.split(",")[0] || "價格"}
              </div>
              <div className="mt-3 max-w-[88%] whitespace-pre-wrap rounded-2xl rounded-bl-md bg-white px-3 py-2 text-sm leading-6 text-zinc-900 shadow-sm">
                {previewText}
              </div>
              {selectedStep ? (
                <div className="mt-3 rounded-md border border-dashed border-zinc-300 bg-white p-3 text-xs leading-5 text-zinc-500">
                  目前選取：{stepMeta[selectedStep.type].label}
                  <br />
                  {stepSummary(selectedStep)}
                </div>
              ) : null}
              {previewMode === "test" ? (
                <button
                  type="button"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100"
                >
                  <RotateCcw className="h-4 w-4" />
                  重新開始
                </button>
              ) : null}
            </div>
            <a
              href="/automations/instagram-default-reply"
              className="mt-4 block rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 hover:bg-emerald-100"
            >
              Instagram 預設回覆設定
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}

export function AutomationBuilderClient({
  initialItems,
  initialFolders,
  selectedChannelName,
  isSimpleRelease,
}: AutomationBuilderClientProps) {
  return (
    <ReactFlowProvider>
      <FlowBuilderInner
        initialItems={initialItems}
        initialFolders={initialFolders}
        selectedChannelName={selectedChannelName}
        isSimpleRelease={isSimpleRelease}
      />
    </ReactFlowProvider>
  );
}
