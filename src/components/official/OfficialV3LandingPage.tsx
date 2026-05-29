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
  siGoogle,
  siInstagram,
  siShopify,
  siTelegram,
  siWhatsapp,
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

const integrationIcons = [siGoogle, siShopify, siInstagram, siWhatsapp, siFacebook, siTelegram];

const copy = {
  zhTW: {
    topNotice: "終身優惠限時開放 - 2026 年 5 月 25 日結束，之後將回到訂閱制價格。",
    menu: "選單",
    nav: ["影片", "流程", "工具", "比較", "FAQ"],
    deal: {
      title: "取得終身方案",
      price: "$499 $49 一次付清 - 今日結束",
      choose: "選擇方案",
    },
    hero: {
      title: "用 AI 聊天機器人，把對話變成客戶",
      body:
        "把 Instagram、WhatsApp、Facebook、Telegram 與網站聊天室集中在一套工具裡，自動回覆留言、收集聯絡資料、預約會議，讓銷售對話不用等人工上線。",
      partner: "Meta Business\nPartners",
      cardName: "Olivia Hayes",
      cardText: "剛剛從限時留言進來",
      dm: "有人留言「價格」時，自動私訊優惠、詢問 Email，並把名單送進你的銷售流程。",
    },
    action: {
      eyebrow: "限時終身優惠",
      title: "用完整自動化，把每一則留言都變成下一步",
      body:
        "InboxPilot 讓你建立可視化流程、AI FAQ、廣播訊息與客服交接。影片區塊保留實際操作感，讓訪客一進頁面就知道產品正在做什麼。",
    },
    comments: {
      label: "留言自動化",
      title: "自動回覆留言，\n並接住聯絡資料",
      body:
        "當顧客在貼文或 Reels 留下關鍵字，系統會立即回覆並引導到私訊，收集 Email、電話、需求或預約時間。",
    },
    flows: {
      title: "依照你的情境切換自動化流程",
      body:
        "這一區是可點擊的分頁，每個分頁都對應一個真實使用情境：留言私訊、廣播、FAQ、銷售開場、歡迎訊息與自動預約。",
      check: "Check It Out",
      tabs: [
        {
          title: "留言自動私訊並收集聯絡資料",
          message: "有人留言關鍵字時，立刻送出私訊、詢問 Email 與電話，並標記來源活動。",
          label: "Auto-DM from comments and capture contact details",
          header: "Comment-to-DM",
          avatar: "DM",
          lines: ["偵測留言關鍵字", "送出優惠私訊", "收集 Email / 電話"],
        },
        {
          title: "發送廣播訊息",
          message: "把新品、活動、限時優惠推送給已同意接收訊息的名單，並追蹤點擊與回覆。",
          label: "Broadcast a message",
          header: "Broadcast",
          avatar: "BC",
          lines: ["選擇受眾分群", "安排發送時間", "追蹤回覆與點擊"],
        },
        {
          title: "自動回覆常見問題",
          message: "用 AI 與固定回覆處理價格、配送、付款、退換貨，讓客服保留時間處理真正複雜的問題。",
          label: "Automate FAQ replies",
          header: "AI FAQ",
          avatar: "FAQ",
          lines: ["讀取 FAQ 資料", "比對顧客問題", "必要時交給真人"],
        },
        {
          title: "立即開啟銷售對話",
          message: "用問題篩選需求、推薦商品或方案，再把高意願客戶交給銷售團隊跟進。",
          label: "Start sales conversations instantly",
          header: "Sales Flow",
          avatar: "SALE",
          lines: ["詢問需求", "推薦方案", "標記高意願名單"],
        },
        {
          title: "發送歡迎訊息",
          message: "新追蹤、新訂閱或第一次私訊時，立即送出品牌介紹、熱門連結與下一步行動。",
          label: "Send welcome messages",
          header: "Welcome",
          avatar: "HI",
          lines: ["辨識新聯絡人", "送出歡迎內容", "引導到下一步"],
        },
        {
          title: "自動預約會議或通話",
          message: "詢問可預約時段、收集需求，並把會議資訊整理給團隊，不再來回確認時間。",
          label: "Book appointments or calls automatically",
          header: "Booking",
          avatar: "CAL",
          lines: ["確認需求", "收集可預約時間", "送出提醒與摘要"],
        },
      ],
    },
    ctaBand: {
      title: "從第一則訊息開始，建立完整銷售流程",
      body: "留言、私訊、FAQ、廣播、預約與真人交接都在同一個工作區完成。",
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
      body: "建立 AI 聊天機器人、廣播活動、名單收集與跨通路訊息流程。",
      items: [
        ["AI 聊天機器人", "用 FAQ、文件或網站內容訓練 AI，全天候回覆顧客。"],
        ["廣播活動", "針對分眾名單發送新品、優惠與活動訊息。"],
        ["整合收件匣", "集中管理留言、私訊、提醒、客服交接與銷售跟進。"],
        ["AI 改寫", "快速改寫回覆內容，維持自然又清楚的語氣。"],
        ["快速回覆", "保存每天都會用到的答案，團隊可以直接套用。"],
        ["跟進提醒", "避免高意願名單因為沒有即時跟進而流失。"],
      ],
    },
    integrations: {
      title: "連接你常用的工具",
      body:
        "串接 AI 模型、電商平台、CRM、表單與自動化工具，不用寫程式也能建立完整工作流。",
    },
    bonus: {
      title: "額外應用程式已包含",
      body: "同步取得更多行銷工具，讓你的自動化堆疊更完整。",
      app1: "自動化工作流",
      app2: "BioLink 頁面",
      cardBody: "建立可視化流程、活動連結與圍繞顧客對話的自動化作業。",
    },
    why: {
      title: "為什麼選擇 InboxPilot",
      body: "從同一個工作區自動化客服、銷售、名單收集與活動回覆。",
      heading: "更有效率",
      tabs: ["留言回覆", "電商導購", "客服銷售", "精簡團隊"],
      cards: ["最適合回覆留言", "為電商品牌打造", "支援客服與銷售", "適合小團隊快速上線"],
    },
    different: {
      title: "InboxPilot 的設計不一樣",
      body: "不用再被聯絡人數、席次與平台加價綁住，先把自動化跑起來，再安心擴大對話量。",
      items: [
        ["不按聯絡人數漲價", "名單成長不應該變成每月帳單壓力。"],
        ["適合代理商與品牌", "管理多個專案、活動與客戶流程。"],
        ["AI 與人工交接", "自動處理重複問題，需要時交給真人。"],
        ["多通路集中", "把社群訊息與網站對話放在同一個地方。"],
      ],
    },
    compare: {
      heroTitle: "更聰明的 ManyChat 替代方案",
      heroBody: "ManyChat 會隨聯絡人數增加成本。InboxPilot 讓你先用一次付清建立自動化，再擴大規模。",
      featureTitle: "InboxPilot vs ManyChat 功能比較",
      pricingTitle: "InboxPilot vs ManyChat 價格比較",
      pricingBody: "在終身優惠結束前取得完整權限，之後將回到訂閱制。",
      table: ["功能", "ManyChat", "InboxPilot", "情境", "月費工具"],
      rows: [
        ["聯絡人限制", "依名單規模計費", "終身優惠期間不按聯絡人加價"],
        ["AI FAQ", "需額外設定或加購", "內建 AI 回覆與知識來源"],
        ["多通路收件匣", "以 Messenger / IG 為主", "IG、WhatsApp、Facebook、Telegram、Webchat"],
        ["銷售流程", "可建立流程", "針對留言、名單、預約與成交設計"],
      ],
      pricingRows: [
        ["1,000 位聯絡人", "$15+/月", "$49 一次付清"],
        ["10,000 位聯絡人", "$95+/月", "$49 一次付清"],
        ["團隊工具", "多工具堆疊", "同一平台完成"],
      ],
    },
    plans: {
      title: "Choose Your Lifetime Plan",
      body: "在優惠結束前一次付清取得完整權限，之後只會保留訂閱方案。",
      trust: ["一次付清", "終身存取", "無月費"],
      cards: [
        ["Lifetime Plan", "$49", "$499", "10,000 credits", "適合個人品牌、創作者與小型商家快速啟動自動化。"],
        ["Lifetime Bundle", "$149", "$999", "30,000 credits", "適合代理商、成長團隊與多專案管理。"],
      ],
    },
    faq: {
      title: "常見問題",
      body: "先把最容易卡住的問題講清楚，避免你買完才發現少一塊。",
      items: [
        ["這真的是終身方案嗎？", "是，這個頁面呈現的是一次付清的終身優惠，之後新用戶會回到訂閱制。"],
        ["可以自動回覆 Instagram 留言嗎？", "可以，流程可以從留言關鍵字觸發，接著發送私訊、收集資料並標記名單。"],
        ["支援哪些通路？", "頁面展示 Instagram、Facebook、WhatsApp、Telegram 與 Webchat 等通路。"],
        ["我需要寫程式嗎？", "不需要，主要流程可透過視覺化設定完成。"],
      ],
    },
    footer: ["Privacy", "Terms", "Contact"],
  },
  zhCN: {
    topNotice: "终身优惠限时开放 - 2026 年 5 月 25 日结束，之后将回到订阅制价格。",
    menu: "菜单",
    nav: ["视频", "流程", "工具", "比较", "FAQ"],
    deal: { title: "取得终身方案", price: "$499 $49 一次付清 - 今日结束", choose: "选择方案" },
    hero: {
      title: "用 AI 聊天机器人，把对话变成客户",
      body:
        "把 Instagram、WhatsApp、Facebook、Telegram 与网站聊天室集中在一套工具里，自动回复留言、收集联系方式、预约会议，让销售对话不用等人工上线。",
      partner: "Meta Business\nPartners",
      cardName: "Olivia Hayes",
      cardText: "刚刚从限时留言进来",
      dm: "有人留言“价格”时，自动私信优惠、询问 Email，并把名单送进你的销售流程。",
    },
    action: {
      eyebrow: "限时终身优惠",
      title: "用完整自动化，把每一则留言都变成下一步",
      body:
        "InboxPilot 让你建立可视化流程、AI FAQ、广播消息与客服交接。视频区块保留实际操作感，让访客一进页面就知道产品正在做什么。",
    },
    comments: {
      label: "留言自动化",
      title: "自动回复留言，\n并接住联系方式",
      body:
        "当顾客在帖子或 Reels 留下关键词，系统会立即回复并引导到私信，收集 Email、电话、需求或预约时间。",
    },
    flows: {
      title: "按照你的情境切换自动化流程",
      body:
        "这一区是可点击的分页，每个分页都对应一个真实使用情境：留言私信、广播、FAQ、销售开场、欢迎消息与自动预约。",
      check: "Check It Out",
      tabs: [
        { title: "留言自动私信并收集联系方式", message: "有人留言关键词时，立刻送出私信、询问 Email 与电话，并标记来源活动。", label: "Auto-DM from comments and capture contact details", header: "Comment-to-DM", avatar: "DM", lines: ["侦测留言关键词", "送出优惠私信", "收集 Email / 电话"] },
        { title: "发送广播消息", message: "把新品、活动、限时优惠推送给已同意接收消息的名单，并追踪点击与回复。", label: "Broadcast a message", header: "Broadcast", avatar: "BC", lines: ["选择受众分群", "安排发送时间", "追踪回复与点击"] },
        { title: "自动回复常见问题", message: "用 AI 与固定回复处理价格、配送、付款、退换货，让客服保留时间处理真正复杂的问题。", label: "Automate FAQ replies", header: "AI FAQ", avatar: "FAQ", lines: ["读取 FAQ 资料", "比对顾客问题", "必要时交给真人"] },
        { title: "立即开启销售对话", message: "用问题筛选需求、推荐商品或方案，再把高意愿客户交给销售团队跟进。", label: "Start sales conversations instantly", header: "Sales Flow", avatar: "SALE", lines: ["询问需求", "推荐方案", "标记高意愿名单"] },
        { title: "发送欢迎消息", message: "新关注、新订阅或第一次私信时，立即送出品牌介绍、热门链接与下一步行动。", label: "Send welcome messages", header: "Welcome", avatar: "HI", lines: ["识别新联系人", "送出欢迎内容", "引导到下一步"] },
        { title: "自动预约会议或通话", message: "询问可预约时段、收集需求，并把会议信息整理给团队，不再来回确认时间。", label: "Book appointments or calls automatically", header: "Booking", avatar: "CAL", lines: ["确认需求", "收集可预约时间", "送出提醒与摘要"] },
      ],
    },
    ctaBand: { title: "从第一则消息开始，建立完整销售流程", body: "留言、私信、FAQ、广播、预约与人工交接都在同一个工作区完成。" },
    proof: {
      title: "成长中的品牌与创作者正在使用",
      body: "把对话自动化、接住潜在客户，让消息不再只是通知，而是可追踪的收入来源。",
      items: [["Oleg Bykov", "Russia", "以前用 ManyChat，联系人越多月费越高。"], ["Carlo Liaci", "Italy", "留言与私信名单会自动被接住，团队可以专心成交。"], ["Ali Kryzan", "Saudi Arabia", "一个下午就完成 Instagram 自动回复，每周省下很多时间。"]],
    },
    tools: {
      title: "完整的自动化工具",
      body: "建立 AI 聊天机器人、广播活动、名单收集与跨通路消息流程。",
      items: [["AI 聊天机器人", "用 FAQ、文件或网站内容训练 AI，全天候回复顾客。"], ["广播活动", "针对分众名单发送新品、优惠与活动消息。"], ["整合收件箱", "集中管理留言、私信、提醒、客服交接与销售跟进。"], ["AI 改写", "快速改写回复内容，维持自然又清楚的语气。"], ["快速回复", "保存每天都会用到的答案，团队可以直接套用。"], ["跟进提醒", "避免高意愿名单因为没有即时跟进而流失。"]],
    },
    integrations: { title: "连接你常用的工具", body: "串接 AI 模型、电商平台、CRM、表单与自动化工具，不用写程序也能建立完整工作流。" },
    bonus: { title: "额外应用程序已包含", body: "同步取得更多营销工具，让你的自动化堆栈更完整。", app1: "自动化工作流", app2: "BioLink 页面", cardBody: "建立可视化流程、活动链接与围绕顾客对话的自动化作业。" },
    why: { title: "为什么选择 InboxPilot", body: "从同一个工作区自动化客服、销售、名单收集与活动回复。", heading: "更有效率", tabs: ["留言回复", "电商导购", "客服销售", "精简团队"], cards: ["最适合回复留言", "为电商品牌打造", "支持客服与销售", "适合小团队快速上线"] },
    different: {
      title: "InboxPilot 的设计不一样",
      body: "不用再被联系人数、席次与平台加价绑住，先把自动化跑起来，再安心扩大对话量。",
      items: [["不按联系人数涨价", "名单成长不应该变成每月账单压力。"], ["适合代理商与品牌", "管理多个项目、活动与客户流程。"], ["AI 与人工交接", "自动处理重复问题，需要时交给真人。"], ["多通路集中", "把社群消息与网站对话放在同一个地方。"]],
    },
    compare: {
      heroTitle: "更聪明的 ManyChat 替代方案",
      heroBody: "ManyChat 会随联系人数增加成本。InboxPilot 让你先用一次付清建立自动化，再扩大规模。",
      featureTitle: "InboxPilot vs ManyChat 功能比较",
      pricingTitle: "InboxPilot vs ManyChat 价格比较",
      pricingBody: "在终身优惠结束前取得完整权限，之后将回到订阅制。",
      table: ["功能", "ManyChat", "InboxPilot", "情境", "月费工具"],
      rows: [["联系人限制", "依名单规模计费", "终身优惠期间不按联系人加价"], ["AI FAQ", "需额外设置或加购", "内建 AI 回复与知识来源"], ["多通路收件箱", "以 Messenger / IG 为主", "IG、WhatsApp、Facebook、Telegram、Webchat"], ["销售流程", "可建立流程", "针对留言、名单、预约与成交设计"]],
      pricingRows: [["1,000 位联系人", "$15+/月", "$49 一次付清"], ["10,000 位联系人", "$95+/月", "$49 一次付清"], ["团队工具", "多工具堆叠", "同一平台完成"]],
    },
    plans: {
      title: "Choose Your Lifetime Plan",
      body: "在优惠结束前一次付清取得完整权限，之后只会保留订阅方案。",
      trust: ["一次付清", "终身存取", "无月费"],
      cards: [["Lifetime Plan", "$49", "$499", "10,000 credits", "适合个人品牌、创作者与小型商家快速启动自动化。"], ["Lifetime Bundle", "$149", "$999", "30,000 credits", "适合代理商、成长团队与多项目管理。"]],
    },
    faq: {
      title: "常见问题",
      body: "先把最容易卡住的问题讲清楚，避免你买完才发现少一块。",
      items: [["这真的是终身方案吗？", "是，这个页面呈现的是一次付清的终身优惠，之后新用户会回到订阅制。"], ["可以自动回复 Instagram 留言吗？", "可以，流程可以从留言关键词触发，接着发送私信、收集资料并标记名单。"], ["支持哪些通路？", "页面展示 Instagram、Facebook、WhatsApp、Telegram 与 Webchat 等通路。"], ["我需要写程序吗？", "不需要，主要流程可通过可视化设置完成。"]],
    },
    footer: ["Privacy", "Terms", "Contact"],
  },
  en: {
    topNotice: "Lifetime deal closes on May 25, 2026. Subscription pricing returns after the offer ends.",
    menu: "Menu",
    nav: ["Video", "Flows", "Tools", "Compare", "FAQ"],
    deal: { title: "Get The Lifetime Deal", price: "$499 $49 One-Time - Ends Today", choose: "Choose Plan" },
    hero: {
      title: "Turn Conversations Into Customers With AI Chatbots",
      body:
        "Automate Instagram, WhatsApp, Facebook, Telegram, and website chat from one workspace. Reply to comments, capture contact details, book calls, and move leads forward without waiting for a human agent.",
      partner: "Meta Business\nPartners",
      cardName: "Olivia Hayes",
      cardText: "New lead from story reply",
      dm: "When someone comments “price”, InboxPilot sends the offer, asks for email, and moves the lead into your sales flow.",
    },
    action: {
      eyebrow: "Limited lifetime offer",
      title: "Turn every comment into the next step",
      body:
        "InboxPilot gives you visual automations, AI FAQ replies, broadcasts, and human handoff. The video section keeps the page product-led so visitors immediately understand what the tool does.",
    },
    comments: {
      label: "Comment automation",
      title: "Auto-reply to comments\nand capture contact details",
      body:
        "When customers comment on posts or Reels, InboxPilot replies instantly, opens the DM, and collects email, phone, intent, or booking details.",
    },
    flows: {
      title: "Switch automation flows for every use case",
      body:
        "This is a real tabbed section. Each tab mirrors one selling flow: comment-to-DM, broadcast, FAQ, sales starters, welcome messages, and automatic booking.",
      check: "Check It Out",
      tabs: [
        { title: "Auto-DM from comments and capture contact details", message: "Trigger a DM from comment keywords, ask for email and phone, and tag the campaign source.", label: "Auto-DM from comments and capture contact details", header: "Comment-to-DM", avatar: "DM", lines: ["Detect comment keyword", "Send offer in DM", "Capture email / phone"] },
        { title: "Broadcast a message", message: "Send launches, promotions, and updates to opted-in contacts while tracking clicks and replies.", label: "Broadcast a message", header: "Broadcast", avatar: "BC", lines: ["Choose audience segment", "Schedule the send", "Track replies and clicks"] },
        { title: "Automate FAQ replies", message: "Use AI and saved answers for pricing, shipping, payments, and returns so your team handles the harder questions.", label: "Automate FAQ replies", header: "AI FAQ", avatar: "FAQ", lines: ["Read FAQ sources", "Match customer intent", "Handoff when needed"] },
        { title: "Start sales conversations instantly", message: "Qualify buyers, recommend products or plans, and route high-intent leads to your sales team.", label: "Start sales conversations instantly", header: "Sales Flow", avatar: "SALE", lines: ["Ask qualifying questions", "Recommend a plan", "Tag high-intent leads"] },
        { title: "Send welcome messages", message: "Greet new followers, subscribers, or first-time DM contacts with your best links and next action.", label: "Send welcome messages", header: "Welcome", avatar: "HI", lines: ["Identify new contact", "Send welcome content", "Guide the next step"] },
        { title: "Book appointments or calls automatically", message: "Collect availability, confirm intent, and prepare the booking summary without back-and-forth messages.", label: "Book appointments or calls automatically", header: "Booking", avatar: "CAL", lines: ["Confirm the need", "Collect availability", "Send reminders and summary"] },
      ],
    },
    ctaBand: { title: "Build a complete sales flow from the first message", body: "Comments, DMs, FAQ, broadcasts, bookings, and human handoff all live in one workspace." },
    proof: {
      title: "Trusted by growing businesses and creators",
      body: "Automate conversations, capture leads, and turn messages into trackable revenue.",
      items: [["Oleg Bykov", "Russia", "We were using ManyChat before, but contact limits kept increasing our monthly bill."], ["Carlo Liaci", "Italy", "InboxPilot captures leads from comments and messages automatically, and our team can focus on closing sales."], ["Ali Kryzan", "Saudi Arabia", "We automated Instagram replies in one afternoon. It saves our team hours every week."]],
    },
    tools: {
      title: "Powerful automation tools",
      body: "Create AI chatbots, send broadcasts, capture leads, and automate conversations across every messaging channel.",
      items: [["AI Chatbots", "Automate conversations 24/7 with AI trained on your FAQs, documents, or website content."], ["Broadcast Campaigns", "Reach your audience with targeted messages designed to drive action."], ["Unified Inbox", "Manage comments, DMs, handoff, reminders, and support in one workspace."], ["Rewrite With AI", "Improve replies quickly while keeping the tone useful and human."], ["Quick Replies", "Save the answers your team sends every day and reuse them instantly."], ["Follow-Up Reminders", "Never lose a lead because the first reply happened at the wrong time."]],
    },
    integrations: { title: "Connect with your favorite tools", body: "Connect AI models, ecommerce platforms, CRMs, forms, and automation tools to build powerful workflows without coding." },
    bonus: { title: "Extra apps included", body: "Get additional apps to expand your marketing stack and automate more of your business.", app1: "Automation workflows", app2: "BioLink pages", cardBody: "Build visual workflows, campaign links, and automated processes around your customer conversations." },
    why: { title: "Why businesses choose InboxPilot", body: "Automate support, sales, lead capture, and campaign replies from one focused workspace.", heading: "Super-efficient", tabs: ["Comment replies", "Ecommerce sales", "Support & sales", "Lean teams"], cards: ["Best at replying to comments", "Designed for ecommerce owners", "Built for support and sales", "Ready for lean teams"] },
    different: {
      title: "Why InboxPilot is built differently",
      body: "Scale your chatbot business without contact-based anxiety, seat restrictions, or hidden platform markups.",
      items: [["No contact-based pricing pressure", "Your list growth should not punish you with a bigger monthly bill."], ["Agency and brand friendly", "Manage multiple projects, campaigns, and client workflows."], ["AI plus human handoff", "Automate repeated questions and route complex issues to your team."], ["Multi-channel workspace", "Keep social and website conversations in one place."]],
    },
    compare: {
      heroTitle: "Smarter ManyChat alternative: stop paying for contacts",
      heroBody: "ManyChat pricing grows as your contact list grows. InboxPilot keeps the landing offer simple: launch automation first, scale conversations next.",
      featureTitle: "InboxPilot vs ManyChat: feature comparison",
      pricingTitle: "InboxPilot vs ManyChat: pricing comparison",
      pricingBody: "Get full access with a one-time payment before this offer disappears and only subscription plans remain.",
      table: ["Feature", "ManyChat", "InboxPilot", "Scenario", "Monthly Tool"],
      rows: [["Contact limits", "Priced by list size", "No contact-based increase during this lifetime offer"], ["AI FAQ", "Requires extra setup or add-ons", "Built-in AI replies and knowledge sources"], ["Multi-channel inbox", "Messenger / IG focused", "IG, WhatsApp, Facebook, Telegram, Webchat"], ["Sales workflows", "Flow builder available", "Designed around comments, leads, bookings, and sales"]],
      pricingRows: [["1,000 contacts", "$15+/mo", "$49 one-time"], ["10,000 contacts", "$95+/mo", "$49 one-time"], ["Team stack", "Multiple tools", "One platform"]],
    },
    plans: {
      title: "Choose Your Lifetime Plan",
      body: "Get full access with a one-time payment before this offer disappears and only subscription plans remain.",
      trust: ["One-time payment", "Lifetime access", "No monthly fees"],
      cards: [["Lifetime Plan", "$49", "$499", "10,000 credits", "Best for solo creators, small shops, and personal brands launching automation."], ["Lifetime Bundle", "$149", "$999", "30,000 credits", "Best for agencies, growing teams, and multiple automation projects."]],
    },
    faq: {
      title: "Frequently Asked Questions",
      body: "Get the key answers before you choose a plan.",
      items: [["Is this really lifetime access?", "Yes. This page presents a one-time lifetime offer. New customers return to subscription pricing after the offer ends."], ["Can it auto-reply to Instagram comments?", "Yes. Flows can start from comment keywords, send DMs, collect details, and tag leads."], ["Which channels are supported?", "The page showcases Instagram, Facebook, WhatsApp, Telegram, and Webchat workflows."], ["Do I need to code?", "No. Core flows can be built visually without writing code."]],
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
      <LifetimePlans t={t} />
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
        <p className={`${compact ? "text-lg" : "text-2xl"} mt-2 font-black leading-tight`}>留言觸發 AI 私訊</p>
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

function LifetimePlans({ t }: { t: Copy }) {
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
          {t.footer.map((item) => (
            <a key={item} href="#" className="hover:text-white">
              {item}
            </a>
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
