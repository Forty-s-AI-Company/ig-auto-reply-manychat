"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Bot,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Gift,
  Globe2,
  Headphones,
  Inbox,
  Menu,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
  Tags,
  X,
  Zap,
} from "lucide-react";
import {
  siFacebook,
  siInstagram,
  siMeta,
} from "simple-icons";
import { useState, type ComponentType } from "react";

type Locale = "zhTW" | "zhCN" | "en";
type IconComponent = ComponentType<{ className?: string }>;
type SimpleIconShape = { path: string; title: string };

const heroImage =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=2200&q=85";
const sectionImage =
  "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?auto=format&fit=crop&w=2000&q=85";
const finalImage =
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=2000&q=85";

const localeLabels: Record<Locale, string> = {
  zhTW: "繁中",
  zhCN: "简中",
  en: "EN",
};

const flowChrome: Array<{ accent: string; icon: IconComponent }> = [
  { accent: "#ff00d4", icon: MessageCircle },
  { accent: "#4f46e5", icon: Send },
  { accent: "#00a876", icon: Bot },
  { accent: "#f97316", icon: Zap },
  { accent: "#06b6d4", icon: Inbox },
  { accent: "#7c3aed", icon: CalendarCheck },
];

const integrationIcons = [siInstagram, siMeta, siFacebook];
const footerLinks = [
  { label: "Privacy", href: "/privacy-policy" },
  { label: "Terms", href: "/terms-of-service" },
  { label: "Contact", href: "/contact" },
] as const;

const copy = {
  zhTW: {
    topNotice: "官方網站 v3 - 聚焦 Instagram 留言自動化、DM 流程與團隊 Inbox。",
    menu: "選單",
    nav: ["影片", "流程", "工具", "比較", "FAQ"],
    deal: {
      title: "開始建立 IG 自動化",
      price: "查看方案",
      choose: "查看方案",
    },
    hero: {
      title: "把 Instagram 留言變成可接手的 DM 流程",
      body:
        "InboxPilot 幫你偵測貼文與 Reels 的留言關鍵字，自動送出私訊、標記名單，並把高意願對話交給團隊 Inbox 接手。",
      partner: "Meta Business\nPartners",
      cardName: "Olivia Hayes",
      cardText: "剛剛從活動貼文留言進來",
      dm: "有人留言「價格」時，自動私訊活動資訊、加上標籤，並提醒團隊後續跟進。",
    },
    action: {
      eyebrow: "產品導覽",
      title: "用清楚的流程，把每一則留言變成下一步",
      body:
        "InboxPilot 讓你建立可視化留言流程、DM 回覆、標籤與客服交接。頁面只保留和 IG 自動化有關的產品內容。",
    },
    comments: {
      label: "留言自動化",
      title: "自動回覆留言，\n並接住聯絡資料",
      body:
        "當顧客在貼文或 Reels 留下關鍵字，系統會立即回覆並引導到私訊，收集需求、加上活動標籤，讓團隊知道誰需要跟進。",
    },
    flows: {
      title: "依照你的情境切換自動化流程",
      body:
        "每個分頁都對應一個真實 IG 情境：留言私訊、貼文活動、常見問題、銷售開場、歡迎訊息與真人接手。",
      check: "Check It Out",
      tabs: [
        {
          title: "留言自動私訊並標記來源",
          message: "有人留言關鍵字時，立刻送出私訊、標記活動來源，並把高意願名單送進 Inbox。",
          label: "留言觸發私訊與標籤",
          header: "Comment-to-DM",
          avatar: "DM",
          lines: ["偵測留言關鍵字", "送出活動私訊", "標記來源與意圖"],
        },
        {
          title: "指定貼文活動自動化",
          message: "針對特定貼文或 Reels 設定關鍵字、公開回覆、按讚與私訊內容。",
          label: "指定貼文活動",
          header: "Campaign Post",
          avatar: "BC",
          lines: ["選擇貼文", "設定關鍵字", "追蹤觸發名單"],
        },
        {
          title: "自動回覆常見問題",
          message: "用固定回覆與流程條件處理價格、課程資訊、領取連結等重複問題。",
          label: "常見問題流程",
          header: "FAQ Flow",
          avatar: "FAQ",
          lines: ["套用常用回覆", "比對關鍵字", "必要時交給真人"],
        },
        {
          title: "立即開啟銷售對話",
          message: "用幾個問題篩選需求，再把高意願客戶交給團隊跟進。",
          label: "Start sales conversations instantly",
          header: "Sales Flow",
          avatar: "SALE",
          lines: ["詢問需求", "推薦方案", "標記高意願名單"],
        },
        {
          title: "發送第一次私訊歡迎",
          message: "第一次進入 DM 時，送出品牌介紹、熱門連結與下一步行動。",
          label: "Send welcome messages",
          header: "Welcome",
          avatar: "HI",
          lines: ["辨識新對話", "送出歡迎內容", "引導到下一步"],
        },
        {
          title: "真人接手與提醒",
          message: "當對話需要人工處理時，建立提醒、保留標籤，並讓團隊從 Inbox 接續。",
          label: "真人接手與提醒",
          header: "Handoff",
          avatar: "CAL",
          lines: ["建立跟進提醒", "保留對話脈絡", "指派團隊成員"],
        },
      ],
    },
    ctaBand: {
      title: "從第一則訊息開始，建立完整銷售流程",
      body: "留言、私訊、標籤、提醒與真人交接都在同一個工作區完成。",
    },
    proof: {
      title: "成長中的品牌與創作者正在使用",
      body: "把對話自動化、接住潛在客戶，讓訊息不再只是通知，而是可追蹤的收入來源。",
      items: [
        ["Oleg Bykov", "Russia", "以前用 ManyChat，聯絡人越多月費越高。"],
        ["Carlo Liaci", "Italy", "留言與私訊名單會自動被接住，團隊可以專心成交。"],
        ["Ali Kryzan", "Saudi Arabia", "一個下午就完成 Instagram 自動回覆，每週省下很多時間。"],
      ],
    },
    tools: {
      title: "完整的自動化工具",
      body: "建立留言觸發、DM 回覆、標籤、提醒與 Inbox 接手流程。",
      items: [
        ["留言觸發", "依照指定貼文、全部貼文與關鍵字啟動流程。"],
        ["DM 回覆流程", "用訊息、條件、等待與動作節點建立對話路徑。"],
        ["整合收件匣", "集中管理留言、私訊、提醒、客服交接與銷售跟進。"],
        ["標籤管理", "把活動來源、需求與高意願狀態整理到名單上。"],
        ["快速回覆", "保存每天都會用到的答案，團隊可以直接套用。"],
        ["跟進提醒", "避免高意願名單因為沒有即時跟進而流失。"],
      ],
    },
    integrations: {
      title: "連接你常用的工具",
      body:
        "連接 Instagram、Meta 與 Messenger 相關權限，讓留言、私訊與 Webhook 資料回到同一個工作區。",
    },
    bonus: {
      title: "不是工具包，是 IG 自動化工作區",
      body: "v3 移除無關的製作工具與額外應用程式，回到本專案真的要交付的功能。",
      app1: "留言流程 Builder",
      app2: "團隊 Inbox 接手",
      cardBody: "建立可視化流程、活動標籤、提醒與圍繞 IG 對話的日常作業。",
    },
    why: {
      title: "為什麼選擇 InboxPilot",
      body: "從同一個工作區處理 IG 留言、DM、名單標籤與團隊接手。",
      heading: "更有效率",
      tabs: ["留言回覆", "活動貼文", "客服接手", "精簡團隊"],
      cards: ["最適合回覆留言", "為 IG 活動打造", "支援客服與銷售", "適合小團隊快速上線"],
    },
    different: {
      title: "InboxPilot 的設計不一樣",
      body: "先把 Instagram 留言自動化跑順，再逐步擴大貼文活動與團隊協作。",
      items: [
        ["IG 流程優先", "不先承諾一堆跨通路工具，先把留言到 DM 做紮實。"],
        ["適合代理商與品牌", "管理多個 IG 帳號、活動貼文與客戶流程。"],
        ["自動化與人工交接", "自動處理重複問題，需要時交給真人。"],
        ["繁中工作區", "後台、官網與日常操作以繁體中文優先。"],
      ],
    },
    compare: {
      heroTitle: "更聰明的 ManyChat 替代方案",
      heroBody: "ManyChat 功能完整但設定較廣。InboxPilot 先聚焦繁中團隊最常用的 IG 留言到 DM 流程。",
      featureTitle: "InboxPilot vs ManyChat 功能比較",
      pricingTitle: "InboxPilot vs ManyChat 價格比較",
      pricingBody: "價格頁會承接正式方案；官網先清楚說明產品能解決哪些 IG 自動化問題。",
      table: ["功能", "ManyChat", "InboxPilot", "情境", "月費工具"],
      rows: [
        ["留言觸發", "支援成熟但設定較多", "聚焦 IG 貼文、Reels 與關鍵字"],
        ["語系", "英文介面為主", "繁體中文優先"],
        ["收件匣", "完整客服收件匣", "未指派、提醒、標籤與團隊接手優先"],
        ["銷售流程", "可建立流程", "針對留言、名單、提醒與成交設計"],
      ],
      pricingRows: [
        ["起步", "需先理解完整平台", "先建立第一條 IG 留言流程"],
        ["團隊協作", "依方案與席次規則", "以 Inbox 指派與提醒為核心"],
        ["產品定位", "跨通路自動化平台", "IG 留言自動化工作區"],
      ],
    },
    plans: {
      title: "選擇適合你的 InboxPilot 方案",
      body: "正式方案以 /pricing 為準；這裡先讓訪客理解不同使用規模會需要哪些能力。",
      trust: ["IG 帳號連線", "留言自動化", "團隊 Inbox"],
      cards: [
        ["Starter", "先上線", "正式價格見 /pricing", "單一 IG 帳號", "適合個人品牌、創作者與小型商家快速啟動第一條留言流程。"],
        ["Team", "一起接手", "正式價格見 /pricing", "多帳號與團隊", "適合代理商、成長團隊與多活動管理。"],
      ],
    },
    faq: {
      title: "常見問題",
      body: "先把最容易卡住的問題講清楚，避免你買完才發現少一塊。",
      items: [
        ["這裡的方案就是正式價格嗎？", "正式價格以 /pricing 頁面為準。v3 先用簡化方案說明適合的使用情境。"],
        ["可以自動回覆 Instagram 留言嗎？", "可以，流程可以從留言關鍵字觸發，接著發送私訊、收集資料並標記名單。"],
        ["支援哪些通路？", "官方頁面現在聚焦 Instagram 與 Meta 相關連線，不再宣傳尚未作為核心交付的通路。"],
        ["我需要寫程式嗎？", "不需要，主要流程可透過視覺化設定完成。"],
      ],
    },
    footer: ["Privacy", "Terms", "Contact"],
  },
  zhCN: {
    topNotice: "官方网站 v3 - 聚焦 Instagram 留言自动化、DM 流程与团队 Inbox。",
    menu: "菜单",
    nav: ["视频", "流程", "工具", "比较", "FAQ"],
    deal: { title: "开始建立 IG 自动化", price: "查看方案", choose: "查看方案" },
    hero: {
      title: "把 Instagram 留言变成可接手的 DM 流程",
      body:
        "InboxPilot 帮你侦测帖子与 Reels 的留言关键词，自动送出私信、标记名单，并把高意愿对话交给团队 Inbox 接手。",
      partner: "Meta Business\nPartners",
      cardName: "Olivia Hayes",
      cardText: "刚刚从活动帖子留言进来",
      dm: "有人留言“价格”时，自动私信活动信息、加上标签，并提醒团队后续跟进。",
    },
    action: {
      eyebrow: "产品导览",
      title: "用清楚的流程，把每一则留言变成下一步",
      body:
        "InboxPilot 让你建立可视化留言流程、DM 回复、标签与客服交接。页面只保留和 IG 自动化有关的产品内容。",
    },
    comments: {
      label: "留言自动化",
      title: "自动回复留言，\n并接住联系方式",
      body:
        "当顾客在帖子或 Reels 留下关键词，系统会立即回复并引导到私信，收集需求、加上活动标签，让团队知道谁需要跟进。",
    },
    flows: {
      title: "按照你的情境切换自动化流程",
      body:
        "每个分页都对应一个真实 IG 情境：留言私信、帖子活动、常见问题、销售开场、欢迎消息与人工接手。",
      check: "Check It Out",
      tabs: [
        { title: "留言自动私信并标记来源", message: "有人留言关键词时，立刻送出私信、标记活动来源，并把高意愿名单送进 Inbox。", label: "留言触发私信与标签", header: "Comment-to-DM", avatar: "DM", lines: ["侦测留言关键词", "送出活动私信", "标记来源与意图"] },
        { title: "指定帖子活动自动化", message: "针对特定帖子或 Reels 设置关键词、公开回复、点赞与私信内容。", label: "指定帖子活动", header: "Campaign Post", avatar: "BC", lines: ["选择帖子", "设置关键词", "追踪触发名单"] },
        { title: "自动回复常见问题", message: "用固定回复与流程条件处理价格、课程信息、领取链接等重复问题。", label: "常见问题流程", header: "FAQ Flow", avatar: "FAQ", lines: ["套用常用回复", "比对关键词", "必要时交给真人"] },
        { title: "立即开启销售对话", message: "用几个问题筛选需求，再把高意愿客户交给团队跟进。", label: "Start sales conversations instantly", header: "Sales Flow", avatar: "SALE", lines: ["询问需求", "推荐方案", "标记高意愿名单"] },
        { title: "发送第一次私信欢迎", message: "第一次进入 DM 时，送出品牌介绍、热门链接与下一步行动。", label: "Send welcome messages", header: "Welcome", avatar: "HI", lines: ["识别新对话", "送出欢迎内容", "引导到下一步"] },
        { title: "人工接手与提醒", message: "当对话需要人工处理时，建立提醒、保留标签，并让团队从 Inbox 接续。", label: "人工接手与提醒", header: "Handoff", avatar: "CAL", lines: ["建立跟进提醒", "保留对话脉络", "指派团队成员"] },
      ],
    },
    ctaBand: { title: "从第一则消息开始，建立完整销售流程", body: "留言、私信、标签、提醒与人工交接都在同一个工作区完成。" },
    proof: {
      title: "成长中的品牌与创作者正在使用",
      body: "把对话自动化、接住潜在客户，让消息不再只是通知，而是可追踪的收入来源。",
      items: [["Oleg Bykov", "Russia", "以前用 ManyChat，联系人越多月费越高。"], ["Carlo Liaci", "Italy", "留言与私信名单会自动被接住，团队可以专心成交。"], ["Ali Kryzan", "Saudi Arabia", "一个下午就完成 Instagram 自动回复，每周省下很多时间。"]],
    },
    tools: {
      title: "完整的自动化工具",
      body: "建立留言触发、DM 回复、标签、提醒与 Inbox 接手流程。",
      items: [["留言触发", "依照指定帖子、全部帖子与关键词启动流程。"], ["DM 回复流程", "用消息、条件、等待与动作节点建立对话路径。"], ["整合收件箱", "集中管理留言、私信、提醒、客服交接与销售跟进。"], ["标签管理", "把活动来源、需求与高意愿状态整理到名单上。"], ["快速回复", "保存每天都会用到的答案，团队可以直接套用。"], ["跟进提醒", "避免高意愿名单因为没有即时跟进而流失。"]],
    },
    integrations: { title: "连接你常用的工具", body: "连接 Instagram、Meta 与 Messenger 相关权限，让留言、私信与 Webhook 数据回到同一个工作区。" },
    bonus: { title: "不是工具包，是 IG 自动化工作区", body: "v3 移除无关的制作工具与额外应用程序，回到本项目真的要交付的功能。", app1: "留言流程 Builder", app2: "团队 Inbox 接手", cardBody: "建立可视化流程、活动标签、提醒与围绕 IG 对话的日常作业。" },
    why: { title: "为什么选择 InboxPilot", body: "从同一个工作区处理 IG 留言、DM、名单标签与团队接手。", heading: "更有效率", tabs: ["留言回复", "活动帖子", "客服接手", "精简团队"], cards: ["最适合回复留言", "为 IG 活动打造", "支持客服与销售", "适合小团队快速上线"] },
    different: {
      title: "InboxPilot 的设计不一样",
      body: "先把 Instagram 留言自动化跑顺，再逐步扩大帖子活动与团队协作。",
      items: [["IG 流程优先", "不先承诺一堆跨通路工具，先把留言到 DM 做扎实。"], ["适合代理商与品牌", "管理多个 IG 帐号、活动帖子与客户流程。"], ["自动化与人工交接", "自动处理重复问题，需要时交给真人。"], ["中文工作区", "后台、官网与日常操作以中文优先。"]],
    },
    compare: {
      heroTitle: "更聪明的 ManyChat 替代方案",
      heroBody: "ManyChat 功能完整但设置较广。InboxPilot 先聚焦中文团队最常用的 IG 留言到 DM 流程。",
      featureTitle: "InboxPilot vs ManyChat 功能比较",
      pricingTitle: "InboxPilot vs ManyChat 价格比较",
      pricingBody: "价格页会承接正式方案；官网先清楚说明产品能解决哪些 IG 自动化问题。",
      table: ["功能", "ManyChat", "InboxPilot", "情境", "月费工具"],
      rows: [["留言触发", "支持成熟但设置较多", "聚焦 IG 帖子、Reels 与关键词"], ["语系", "英文界面为主", "中文优先"], ["收件箱", "完整客服收件箱", "未指派、提醒、标签与团队接手优先"], ["销售流程", "可建立流程", "针对留言、名单、提醒与成交设计"]],
      pricingRows: [["起步", "需先理解完整平台", "先建立第一条 IG 留言流程"], ["团队协作", "依方案与席次规则", "以 Inbox 指派与提醒为核心"], ["产品定位", "跨通路自动化平台", "IG 留言自动化工作区"]],
    },
    plans: {
      title: "选择适合你的 InboxPilot 方案",
      body: "正式方案以 /pricing 为准；这里先让访客理解不同使用规模会需要哪些能力。",
      trust: ["IG 帐号连接", "留言自动化", "团队 Inbox"],
      cards: [["Starter", "先上线", "正式价格见 /pricing", "单一 IG 帐号", "适合个人品牌、创作者与小型商家快速启动第一条留言流程。"], ["Team", "一起接手", "正式价格见 /pricing", "多帐号与团队", "适合代理商、成长团队与多活动管理。"]],
    },
    faq: {
      title: "常见问题",
      body: "先把最容易卡住的问题讲清楚，避免你买完才发现少一块。",
      items: [["这里的方案就是正式价格吗？", "正式价格以 /pricing 页面为准。v3 先用简化方案说明适合的使用情境。"], ["可以自动回复 Instagram 留言吗？", "可以，流程可以从留言关键词触发，接着发送私信、收集资料并标记名单。"], ["支持哪些通路？", "官方页面现在聚焦 Instagram 与 Meta 相关连接，不再宣传尚未作为核心交付的通路。"], ["我需要写程序吗？", "不需要，主要流程可通过可视化设置完成。"]],
    },
    footer: ["Privacy", "Terms", "Contact"],
  },
  en: {
    topNotice: "Official v3 - focused on Instagram comment automation, DM flows, and team inbox.",
    menu: "Menu",
    nav: ["Video", "Flows", "Tools", "Compare", "FAQ"],
    deal: { title: "Build IG automation", price: "View plans", choose: "View plans" },
    hero: {
      title: "Turn Instagram comments into handoff-ready DM flows",
      body:
        "InboxPilot detects comment keywords on posts and Reels, sends DMs, tags leads, and routes high-intent conversations to your team inbox.",
      partner: "Meta Business\nPartners",
      cardName: "Olivia Hayes",
      cardText: "New lead from campaign post",
      dm: "When someone comments “price”, InboxPilot sends campaign details, adds a tag, and reminds the team to follow up.",
    },
    action: {
      eyebrow: "Product tour",
      title: "Turn every comment into a clear next step",
      body:
        "InboxPilot gives you visual comment flows, DM replies, tags, and handoff. This page keeps only product content that belongs to IG automation.",
    },
    comments: {
      label: "Comment automation",
      title: "Auto-reply to comments\nand capture contact details",
      body:
        "When customers comment on posts or Reels, InboxPilot replies instantly, opens the DM, captures intent, adds campaign tags, and shows your team who needs follow-up.",
    },
    flows: {
      title: "Switch automation flows for every use case",
      body:
        "Each tab mirrors a real Instagram workflow: comment-to-DM, campaign posts, FAQs, sales starters, welcome messages, and human handoff.",
      check: "Check It Out",
      tabs: [
        { title: "Auto-DM from comments and tag the source", message: "Trigger a DM from comment keywords, tag the campaign source, and send high-intent leads into the inbox.", label: "Comment-triggered DMs and tags", header: "Comment-to-DM", avatar: "DM", lines: ["Detect comment keyword", "Send campaign DM", "Tag source and intent"] },
        { title: "Selected post automation", message: "Set keywords, public replies, likes, and DM content for a specific post or Reel.", label: "Selected post campaign", header: "Campaign Post", avatar: "BC", lines: ["Choose a post", "Set keywords", "Track triggered leads"] },
        { title: "Automate common questions", message: "Use saved replies and flow conditions for pricing, course info, links, and repeated questions.", label: "FAQ flows", header: "FAQ Flow", avatar: "FAQ", lines: ["Use saved replies", "Match keywords", "Handoff when needed"] },
        { title: "Start sales conversations instantly", message: "Ask a few qualifying questions, then route high-intent customers to your team.", label: "Start sales conversations instantly", header: "Sales Flow", avatar: "SALE", lines: ["Ask qualifying questions", "Recommend a plan", "Tag high-intent leads"] },
        { title: "Send first-DM welcomes", message: "When a conversation starts, send brand context, useful links, and the next action.", label: "Send welcome messages", header: "Welcome", avatar: "HI", lines: ["Identify new conversation", "Send welcome content", "Guide the next step"] },
        { title: "Human handoff and reminders", message: "When a conversation needs a person, create reminders, keep tags, and let the team continue in the inbox.", label: "Human handoff and reminders", header: "Handoff", avatar: "CAL", lines: ["Create follow-up reminder", "Keep conversation context", "Assign a teammate"] },
      ],
    },
    ctaBand: { title: "Build a complete sales flow from the first message", body: "Comments, DMs, tags, reminders, and human handoff all live in one workspace." },
    proof: {
      title: "Trusted by growing businesses and creators",
      body: "Automate conversations, capture leads, and turn messages into trackable revenue.",
      items: [["Oleg Bykov", "Russia", "We were using ManyChat before, but contact limits kept increasing our monthly bill."], ["Carlo Liaci", "Italy", "InboxPilot captures leads from comments and messages automatically, and our team can focus on closing sales."], ["Ali Kryzan", "Saudi Arabia", "We automated Instagram replies in one afternoon. It saves our team hours every week."]],
    },
    tools: {
      title: "Powerful automation tools",
      body: "Build comment triggers, DM replies, tags, reminders, and inbox handoff flows.",
      items: [["Comment triggers", "Start flows from selected posts, all posts, and keywords."], ["DM reply flows", "Use message, condition, wait, and action nodes to build conversation paths."], ["Unified Inbox", "Manage comments, DMs, handoff, reminders, and support in one workspace."], ["Tag management", "Organize campaign source, needs, and high-intent status on every lead."], ["Quick Replies", "Save the answers your team sends every day and reuse them instantly."], ["Follow-Up Reminders", "Never lose a lead because the first reply happened at the wrong time."]],
    },
    integrations: { title: "Connect the channels InboxPilot actually uses", body: "Connect Instagram, Meta, and Messenger permissions so comments, DMs, and webhook data return to one workspace." },
    bonus: { title: "Not a tool bundle. An IG automation workspace.", body: "V3 removes unrelated creation tools and extra apps so the page reflects what this project actually ships.", app1: "Comment Flow Builder", app2: "Team Inbox Handoff", cardBody: "Build visual flows, campaign tags, reminders, and daily work around IG conversations." },
    why: { title: "Why businesses choose InboxPilot", body: "Handle IG comments, DMs, tags, and team handoff from one focused workspace.", heading: "Super-efficient", tabs: ["Comment replies", "Campaign posts", "Support handoff", "Lean teams"], cards: ["Best at replying to comments", "Built for IG campaigns", "Built for support and sales", "Ready for lean teams"] },
    different: {
      title: "Why InboxPilot is built differently",
      body: "Get Instagram comment automation working first, then expand campaign and team workflows with confidence.",
      items: [["IG flows first", "No broad multi-channel promises before comment-to-DM is solid."], ["Agency and brand friendly", "Manage multiple IG accounts, campaign posts, and client workflows."], ["Automation plus human handoff", "Handle repeated questions automatically and route complex issues to your team."], ["Chinese-first workspace", "The admin, website, and daily workflow are designed for Chinese-speaking teams first."]],
    },
    compare: {
      heroTitle: "A focused ManyChat alternative for IG comment workflows",
      heroBody: "ManyChat is broad and mature. InboxPilot starts with the IG comment-to-DM workflow Chinese-speaking teams use most.",
      featureTitle: "InboxPilot vs ManyChat: feature comparison",
      pricingTitle: "InboxPilot vs ManyChat: pricing comparison",
      pricingBody: "The pricing page carries the official plans. This page first explains which IG automation problems the product solves.",
      table: ["Feature", "ManyChat", "InboxPilot", "Scenario", "Monthly Tool"],
      rows: [["Comment triggers", "Mature but broader setup", "Focused on IG posts, Reels, and keywords"], ["Language", "English-first", "Chinese-first"], ["Inbox", "Full support inbox", "Unassigned, reminders, tags, and team handoff first"], ["Sales workflows", "Flow builder available", "Designed around comments, leads, reminders, and closing"]],
      pricingRows: [["Getting started", "Learn a broad platform first", "Create the first IG comment flow"], ["Team collaboration", "Depends on plan and seats", "Inbox assignment and reminders are central"], ["Product focus", "Multi-channel automation platform", "IG comment automation workspace"]],
    },
    plans: {
      title: "Choose the InboxPilot plan that fits",
      body: "Official pricing lives on /pricing. This section explains which capability set fits each stage.",
      trust: ["IG account connection", "Comment automation", "Team inbox"],
      cards: [["Starter", "Launch first", "See /pricing", "Single IG account", "Best for creators, personal brands, and small shops launching the first comment flow."], ["Team", "Handoff together", "See /pricing", "Multiple accounts and team", "Best for agencies, growing teams, and multiple campaign workflows."]],
    },
    faq: {
      title: "Frequently Asked Questions",
      body: "Get the key answers before you choose a plan.",
      items: [["Is this the official price?", "Official pricing lives on /pricing. V3 uses simplified plan language to explain fit."], ["Can it auto-reply to Instagram comments?", "Yes. Flows can start from comment keywords, send DMs, collect details, and tag leads."], ["Which channels are supported?", "The official page now focuses on Instagram and Meta-related connections instead of advertising channels that are not core delivery yet."], ["Do I need to code?", "No. Core flows can be built visually without writing code."]],
    },
    footer: ["Privacy", "Terms", "Contact"],
  },
} as const;

type Copy = (typeof copy)[Locale];

export function OfficialV3LandingPage() {
  const [locale, setLocale] = useState<Locale>("zhTW");
  const t = copy[locale];

  return (
    <main className="min-h-screen bg-white text-zinc-950">
      <Header locale={locale} setLocale={setLocale} t={t} />
      <Hero t={t} />
      <ActionVideoSection t={t} />
      <CommentAutomationSection t={t} />
      <FlowMachineSection t={t} />
      <ImageCtaBand t={t} />
      <SocialProofSection t={t} />
      <ToolsSection t={t} />
      <IntegrationsSection t={t} />
      <BonusSection t={t} />
      <WhyChooseSection t={t} />
      <BuiltDifferentSection t={t} />
      <CompareSection t={t} />
      <PlanSection t={t} />
      <FaqSection t={t} />
      <Footer t={t} />
      <FloatingMenu t={t} />
    </main>
  );
}

function Header({
  locale,
  setLocale,
  t,
}: {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Copy;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="bg-zinc-950 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-white">
        {t.topNotice}
      </div>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link href="/official/v3" className="flex items-center gap-3 font-black tracking-tight">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#ff00d4] text-white shadow-lg shadow-fuchsia-300">
            <Bot className="h-5 w-5" />
          </span>
          <span className="text-xl">InboxPilot</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-semibold text-zinc-700 lg:flex">
          {t.nav.map((item, index) => (
            <a key={item} href={["#video", "#flows", "#tools", "#compare", "#faq"][index]} className="transition hover:text-[#ff00d4]">
              {item}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden items-center rounded-full border border-zinc-200 bg-zinc-50 p-1 sm:flex">
            <Globe2 className="ml-2 h-4 w-4 text-zinc-500" />
            {(Object.keys(localeLabels) as Locale[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setLocale(item)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  locale === item ? "bg-[#111827] text-white" : "text-zinc-600 hover:text-zinc-950"
                }`}
              >
                {localeLabels[item]}
              </button>
            ))}
          </div>
          <DealButton t={t} />
        </div>
      </div>
    </header>
  );
}

function DealButton({ t, variant = "pink" }: { t: Copy; variant?: "pink" | "blue" | "dark" }) {
  const color =
    variant === "blue"
      ? "bg-[#0057ff] text-white shadow-blue-200 hover:bg-[#0049d8]"
      : variant === "dark"
        ? "bg-[#111827] text-white shadow-zinc-300 hover:bg-zinc-800"
        : "bg-[#ff00d4] text-[#111827] shadow-fuchsia-200 hover:bg-[#df00bb]";

  return (
    <a
      href="#plans"
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-black shadow-lg transition ${color}`}
    >
      <Sparkles className="h-4 w-4" />
      <span className="hidden sm:inline">{t.deal.price}</span>
      <span className="sm:hidden">{t.deal.choose}</span>
      <ArrowRight className="h-4 w-4" />
    </a>
  );
}

function Hero({ t }: { t: Copy }) {
  return (
    <section className="official-v3-photo-hero relative overflow-hidden">
      <div className="absolute inset-0">
        <Image src={heroImage} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/10" />
      </div>
      <div className="relative mx-auto grid min-h-[760px] max-w-7xl items-center gap-12 px-5 py-20 text-white lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold backdrop-blur">
            <ShieldCheck className="h-4 w-4 text-[#00f0ff]" />
            {t.hero.partner.split("\n").map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
          <h1 className="max-w-4xl text-5xl font-black leading-[1.02] tracking-tight md:text-7xl">{t.hero.title}</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-100 md:text-xl">{t.hero.body}</p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <DealButton t={t} variant="blue" />
            <a href="#video" className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-[#111827] px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-black">
              <Zap className="h-4 w-4" />
              {t.deal.title}
            </a>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-md">
          <div className="rounded-[2rem] border border-white/20 bg-white/15 p-5 shadow-2xl backdrop-blur-xl">
            <div className="rounded-[1.5rem] bg-white p-4 text-zinc-950">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-[#ff00d4] text-sm font-black text-white">OH</div>
                  <div>
                    <p className="font-black">{t.hero.cardName}</p>
                    <p className="text-xs font-semibold text-zinc-500">{t.hero.cardText}</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">LIVE</span>
              </div>
              <ProductDemoPanel portrait compact />
              <div className="official-v3-flow-message mt-4 rounded-2xl bg-zinc-950 p-4 text-sm font-semibold leading-6 text-white">
                {t.hero.dm}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionTitle({ eyebrow, title, body, light = false }: { eyebrow?: string; title: string; body?: string; light?: boolean }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow ? <p className={`mb-3 text-sm font-black uppercase tracking-[0.18em] ${light ? "text-[#00f0ff]" : "text-[#ff00d4]"}`}>{eyebrow}</p> : null}
      <h2 className={`text-4xl font-black tracking-tight md:text-6xl ${light ? "text-white" : "text-zinc-950"}`}>{title}</h2>
      {body ? <p className={`mt-5 text-lg leading-8 ${light ? "text-zinc-200" : "text-zinc-600"}`}>{body}</p> : null}
    </div>
  );
}

function ProductDemoPanel({ portrait = false, compact = false }: { portrait?: boolean; compact?: boolean }) {
  return (
    <div className={`relative overflow-hidden bg-zinc-950 ${portrait ? "aspect-[9/16] rounded-2xl" : "aspect-video"}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,0,212,0.34),transparent_28%),linear-gradient(135deg,#09090b,#1e1b4b_48%,#0f172a)]" />
      <div className="absolute inset-x-4 top-4 flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 h-2 flex-1 rounded-full bg-white/15" />
      </div>
      <div className={`${portrait ? "inset-x-5 top-16" : "left-8 top-16 w-[42%]"} absolute rounded-2xl bg-white p-5 text-zinc-950 shadow-2xl`}>
        <p className="text-xs font-black uppercase text-[#ff00d4]">InboxPilot Flow</p>
        <p className={`${compact ? "text-lg" : "text-2xl"} mt-2 font-black leading-tight`}>留言觸發私訊流程</p>
        <div className="mt-5 space-y-3">
          {["偵測 IG 關鍵字", "送出優惠與表單", "交給真人跟進"].map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-xl bg-zinc-100 px-3 py-2 text-sm font-bold">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              {item}
            </div>
          ))}
        </div>
      </div>
      <div className={`${portrait ? "bottom-6 left-5 right-5" : "bottom-8 right-8 w-[40%]"} absolute rounded-2xl bg-[#0057ff] p-5 text-white shadow-2xl`}>
        <p className="text-xs font-black uppercase opacity-80">Live Inbox</p>
        <p className="mt-2 text-sm font-semibold leading-6">自動化先回覆，團隊可從同一個收件匣接手高意願對話。</p>
      </div>
    </div>
  );
}

function ActionVideoSection({ t }: { t: Copy }) {
  return (
    <section id="video" className="bg-white px-5 py-24 lg:px-8">
      <SectionTitle eyebrow={t.action.eyebrow} title={t.action.title} body={t.action.body} />
      <div className="mx-auto mt-12 max-w-6xl overflow-hidden rounded-[2rem] border border-zinc-200 bg-zinc-950 shadow-2xl">
        <ProductDemoPanel />
      </div>
    </section>
  );
}

function CommentAutomationSection({ t }: { t: Copy }) {
  return (
    <section className="bg-[#f7f7fb] px-5 py-24 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-[2rem] bg-zinc-950 p-5 shadow-2xl">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.5rem]">
            <Image src={sectionImage} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover opacity-85" />
          </div>
          <div className="absolute bottom-10 left-10 right-10 rounded-3xl bg-white p-5 shadow-2xl">
            <p className="text-sm font-black uppercase tracking-[0.15em] text-[#ff00d4]">{t.comments.label}</p>
            <p className="mt-2 text-2xl font-black text-zinc-950">{t.flows.tabs[0].label}</p>
          </div>
        </div>
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ff00d4]">{t.comments.label}</p>
          <h2 className="mt-4 whitespace-pre-line text-5xl font-black leading-tight tracking-tight text-zinc-950">{t.comments.title}</h2>
          <p className="mt-6 text-lg leading-8 text-zinc-600">{t.comments.body}</p>
          <div className="mt-8 grid gap-3">
            {t.flows.tabs[0].lines.map((line) => (
              <div key={line} className="flex items-center gap-3 rounded-2xl bg-white p-4 font-bold shadow-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FlowMachineSection({ t }: { t: Copy }) {
  const [active, setActive] = useState(0);
  const tab = t.flows.tabs[active];

  return (
    <section id="flows" className="bg-white px-5 py-24 lg:px-8">
      <SectionTitle title={t.flows.title} body={t.flows.body} />
      <div className="mx-auto mt-14 grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="grid gap-3">
          {t.flows.tabs.map((item, index) => {
            const Icon = flowChrome[index].icon;
            const isActive = active === index;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setActive(index)}
                className={`group flex items-center justify-between rounded-2xl border p-4 text-left transition ${
                  isActive ? "border-zinc-950 bg-zinc-950 text-white shadow-xl" : "border-zinc-200 bg-white hover:border-zinc-400"
                }`}
              >
                <span className="flex items-center gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white" style={{ backgroundColor: flowChrome[index].accent }}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-base font-black">{item.label}</span>
                    <span className={`mt-1 block text-sm ${isActive ? "text-zinc-300" : "text-zinc-500"}`}>{t.flows.check}</span>
                  </span>
                </span>
                <ChevronDown className={`h-5 w-5 transition ${isActive ? "rotate-180" : ""}`} />
              </button>
            );
          })}
        </div>
        <div className="rounded-[2rem] bg-[#f7f7fb] p-6 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <FlowPhoneMock tab={tab} index={active} />
            <div className="flex flex-col justify-center">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ff00d4]">{tab.header}</p>
              <h3 className="mt-4 text-4xl font-black tracking-tight">{tab.title}</h3>
              <p className="mt-5 text-lg leading-8 text-zinc-600">{tab.message}</p>
              <div className="mt-8 grid gap-3">
                {tab.lines.map((line) => (
                  <div key={line} className="flex items-center gap-3 rounded-2xl bg-white p-4 font-bold">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FlowPhoneMock({ tab, index }: { tab: Copy["flows"]["tabs"][number]; index: number }) {
  return (
    <div className="mx-auto w-full max-w-[310px] rounded-[2.2rem] border-[10px] border-zinc-950 bg-white p-4 shadow-2xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full text-xs font-black text-white" style={{ backgroundColor: flowChrome[index].accent }}>
            {tab.avatar}
          </div>
          <div>
            <p className="text-sm font-black">{tab.header}</p>
            <p className="text-xs font-semibold text-zinc-500">Online</p>
          </div>
        </div>
        <span className="h-3 w-3 rounded-full bg-emerald-400" />
      </div>
      <div className="space-y-3">
        <div className="mr-8 rounded-2xl bg-zinc-100 p-3 text-sm font-semibold leading-6">{tab.message}</div>
        {tab.lines.map((line) => (
          <div key={line} className="ml-8 rounded-2xl bg-[#0057ff] p-3 text-sm font-bold text-white">
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

function ImageCtaBand({ t }: { t: Copy }) {
  return (
    <section className="official-v3-photo-band relative overflow-hidden px-5 py-24 text-white lg:px-8">
      <Image src={finalImage} alt="" fill sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-zinc-950/70" />
      <div className="relative mx-auto max-w-4xl text-center">
        <h2 className="text-4xl font-black tracking-tight md:text-6xl">{t.ctaBand.title}</h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-100">{t.ctaBand.body}</p>
        <div className="mt-8">
          <DealButton t={t} variant="blue" />
        </div>
      </div>
    </section>
  );
}

function SocialProofSection({ t }: { t: Copy }) {
  return (
    <section className="bg-white px-5 py-24 lg:px-8">
      <SectionTitle title={t.proof.title} body={t.proof.body} />
      <div className="mx-auto mt-12 grid max-w-7xl gap-5 md:grid-cols-3">
        {t.proof.items.map(([name, country, quote]) => (
          <article key={name} className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex text-[#ff00d4]">★★★★★</div>
            <p className="text-lg font-semibold leading-8 text-zinc-700">“{quote}”</p>
            <div className="mt-6 border-t border-zinc-100 pt-5">
              <p className="font-black">{name}</p>
              <p className="text-sm font-semibold text-zinc-500">{country}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ToolsSection({ t }: { t: Copy }) {
  const icons = [Bot, Send, Inbox, Sparkles, MessageCircle, CalendarCheck];
  return (
    <section id="tools" className="bg-[#f7f7fb] px-5 py-24 lg:px-8">
      <SectionTitle title={t.tools.title} body={t.tools.body} />
      <div className="mx-auto mt-12 grid max-w-7xl gap-5 md:grid-cols-2 lg:grid-cols-3">
        {t.tools.items.map(([title, body], index) => {
          const Icon = icons[index];
          return (
            <article key={title} className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-zinc-950 text-white">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-xl font-black">{title}</h3>
              <p className="mt-3 leading-7 text-zinc-600">{body}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function IntegrationsSection({ t }: { t: Copy }) {
  return (
    <section className="bg-zinc-950 px-5 py-24 text-white lg:px-8">
      <SectionTitle title={t.integrations.title} body={t.integrations.body} light />
      <div className="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {integrationIcons.map((icon) => (
          <IconTile key={icon.title} icon={icon} />
        ))}
      </div>
    </section>
  );
}

function IconTile({ icon }: { icon: SimpleIconShape }) {
  return (
    <div className="grid aspect-square place-items-center rounded-3xl border border-white/10 bg-white/10 p-6">
      <svg viewBox="0 0 24 24" className="h-11 w-11 fill-white" aria-label={icon.title}>
        <path d={icon.path} />
      </svg>
    </div>
  );
}

function BonusSection({ t }: { t: Copy }) {
  return (
    <section className="bg-white px-5 py-24 lg:px-8">
      <SectionTitle title={t.bonus.title} body={t.bonus.body} />
      <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-2">
        {[t.bonus.app1, t.bonus.app2].map((item, index) => (
          <article key={item} className="rounded-3xl border border-zinc-200 p-8 shadow-sm">
            <div className={`grid h-14 w-14 place-items-center rounded-2xl text-white ${index === 0 ? "bg-[#0057ff]" : "bg-[#ff00d4]"}`}>
              <Gift className="h-6 w-6" />
            </div>
            <h3 className="mt-6 text-2xl font-black">{item}</h3>
            <p className="mt-4 leading-7 text-zinc-600">{t.bonus.cardBody}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function WhyChooseSection({ t }: { t: Copy }) {
  return (
    <section className="bg-[#f7f7fb] px-5 py-24 lg:px-8">
      <SectionTitle title={t.why.title} body={t.why.body} />
      <div className="mx-auto mt-12 max-w-6xl rounded-[2rem] bg-white p-6 shadow-sm md:p-10">
        <div className="flex flex-wrap justify-center gap-3">
          {t.why.tabs.map((tab) => (
            <span key={tab} className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-black text-white">
              {tab}
            </span>
          ))}
        </div>
        <h3 className="mt-10 text-center text-4xl font-black">{t.why.heading}</h3>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {t.why.cards.map((item) => (
            <div key={item} className="rounded-2xl border border-zinc-200 p-5 text-center font-bold">
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BuiltDifferentSection({ t }: { t: Copy }) {
  return (
    <section className="bg-zinc-950 px-5 py-24 text-white lg:px-8">
      <SectionTitle title={t.different.title} body={t.different.body} light />
      <div className="mx-auto mt-12 grid max-w-7xl gap-5 md:grid-cols-2 lg:grid-cols-4">
        {t.different.items.map(([title, body]) => (
          <article key={title} className="rounded-3xl border border-white/10 bg-white/10 p-6">
            <ShieldCheck className="h-8 w-8 text-[#00f0ff]" />
            <h3 className="mt-5 text-xl font-black">{title}</h3>
            <p className="mt-3 leading-7 text-zinc-300">{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function CompareSection({ t }: { t: Copy }) {
  return (
    <section id="compare" className="bg-white px-5 py-24 lg:px-8">
      <SectionTitle title={t.compare.heroTitle} body={t.compare.heroBody} />
      <div className="mx-auto mt-12 grid max-w-7xl gap-8 lg:grid-cols-2">
        <CompareTable title={t.compare.featureTitle} headers={t.compare.table.slice(0, 3)} rows={t.compare.rows} />
        <CompareTable title={t.compare.pricingTitle} body={t.compare.pricingBody} headers={t.compare.table.slice(3, 5).concat(["InboxPilot"])} rows={t.compare.pricingRows} />
      </div>
    </section>
  );
}

function CompareTable({ title, body, headers, rows }: { title: string; body?: string; headers: readonly string[]; rows: readonly (readonly string[])[] }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-200 shadow-sm">
      <div className="bg-[#111827] p-6 text-white">
        <h3 className="text-2xl font-black">{title}</h3>
        {body ? <p className="mt-3 leading-7 text-zinc-300">{body}</p> : null}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-full text-left text-sm md:min-w-[520px]">
          <thead className="bg-zinc-100 text-zinc-600">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-5 py-4 font-black">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.join("-")} className="border-t border-zinc-100">
                {row.map((cell, index) => (
                  <td key={`${cell}-${index}`} className={`px-5 py-4 font-semibold ${index === row.length - 1 ? "text-[#0057ff]" : "text-zinc-700"}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PlanSection({ t }: { t: Copy }) {
  return (
    <section id="plans" className="bg-[#f7f7fb] px-5 py-24 lg:px-8">
      <SectionTitle title={t.plans.title} body={t.plans.body} />
      <div className="mx-auto mt-8 flex flex-wrap justify-center gap-3">
        {t.plans.trust.map((item) => (
          <span key={item} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black shadow-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            {item}
          </span>
        ))}
      </div>
      <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
        {t.plans.cards.map(([name, price, oldPrice, credits, body], index) => (
          <article key={name} className={`rounded-[2rem] border p-8 shadow-sm ${index === 1 ? "border-[#ff00d4] bg-[#111827] text-white" : "border-zinc-200 bg-white"}`}>
            <p className={`text-sm font-black uppercase tracking-[0.18em] ${index === 1 ? "text-[#00f0ff]" : "text-[#ff00d4]"}`}>{credits}</p>
            <h3 className="mt-4 text-3xl font-black">{name}</h3>
            <div className="mt-6 flex items-end gap-3">
              <span className="text-6xl font-black">{price}</span>
              <span className={`pb-2 text-xl font-bold line-through ${index === 1 ? "text-zinc-400" : "text-zinc-400"}`}>{oldPrice}</span>
            </div>
            <p className={`mt-5 leading-7 ${index === 1 ? "text-zinc-300" : "text-zinc-600"}`}>{body}</p>
            <a href="#faq" className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-4 text-sm font-black transition ${index === 1 ? "bg-[#ff00d4] text-[#111827] hover:bg-[#df00bb]" : "bg-[#0057ff] text-white hover:bg-[#0049d8]"}`}>
              {t.deal.choose}
              <ArrowRight className="h-4 w-4" />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

function FaqSection({ t }: { t: Copy }) {
  return (
    <section id="faq" className="bg-white px-5 py-24 lg:px-8">
      <SectionTitle title={t.faq.title} body={t.faq.body} />
      <div className="mx-auto mt-12 max-w-4xl divide-y divide-zinc-200 rounded-3xl border border-zinc-200 bg-white">
        {t.faq.items.map(([question, answer]) => (
          <details key={question} className="group p-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-lg font-black">
              {question}
              <ChevronDown className="h-5 w-5 shrink-0 transition group-open:rotate-180" />
            </summary>
            <p className="mt-4 leading-8 text-zinc-600">{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Footer({ t }: { t: Copy }) {
  return (
    <footer className="bg-zinc-950 px-5 py-10 text-white lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 md:flex-row">
        <div className="flex items-center gap-3 font-black">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#ff00d4]">
            <Bot className="h-5 w-5" />
          </span>
          InboxPilot
        </div>
        <div className="flex flex-wrap justify-center gap-5 text-sm font-bold text-zinc-300">
          {footerLinks.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-white">
              {t.footer.find((label) => label === item.label) || item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

function FloatingMenu({ t }: { t: Copy }) {
  const [open, setOpen] = useState(false);
  const actions = [
    [t.nav[0], "#video", Zap],
    [t.nav[1], "#flows", MessageCircle],
    [t.nav[2], "#tools", Tags],
    [t.nav[3], "#compare", CreditCard],
    [t.nav[4], "#faq", Headphones],
  ] as const;

  return (
    <div className="fixed bottom-5 right-5 z-50 lg:hidden">
      {open ? (
        <div className="mb-3 grid gap-2 rounded-3xl bg-white p-3 shadow-2xl">
          {actions.map(([label, href, Icon]) => (
            <a key={href} href={href} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black text-zinc-800 hover:bg-zinc-100" onClick={() => setOpen(false)}>
              <Icon className="h-4 w-4 text-[#ff00d4]" />
              {label}
            </a>
          ))}
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-full bg-[#ff00d4] px-5 py-4 text-sm font-black text-[#111827] shadow-2xl"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        {t.menu}
      </button>
    </div>
  );
}
