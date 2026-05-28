"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Globe2,
  Inbox,
  Menu,
  MessageCircle,
  Play,
  Settings2,
  ShieldCheck,
  Sparkles,
  Tags,
  Timer,
  UserRoundCheck,
  Workflow,
  X,
  Zap,
} from "lucide-react";
import {
  siFacebook,
  siGoogle,
  siInstagram,
  siMeta,
  siShopify,
  siTelegram,
  siTiktok,
  siWhatsapp,
} from "simple-icons";
import { useEffect, useRef, useState, type ComponentType } from "react";

type Locale = "zh" | "en";
type IconComponent = ComponentType<{ className?: string }>;
type SimpleIconShape = { path: string; title: string };

const productTourVideo = "/videos/official-v2/inboxpilot-product-tour.mp4";
const mobileStoryVideo = "/videos/official-v2/inboxpilot-mobile-story.mp4";

const copy = {
  zh: {
    nav: {
      demo: "影片展示",
      automation: "自動化",
      compare: "比較",
      faq: "FAQ",
      pricing: "價格",
      login: "登入",
      start: "免費開始",
      menu: "選單",
    },
    hero: {
      eyebrow: "IG 留言自動化 + ManyChat 風格 Flow Builder",
      title: "InboxPilot",
      subtitle: "把留言、私訊與銷售機會，自動整理成能成交的對話流程。",
      body:
        "這版不再只做像 BotCommerce 的版型，而是把 HyperFrames 製作的實際產品介紹影片放到首屏，讓使用者一進來就看到 IG 留言關鍵字、DM、自動化流程與 Inbox 接手。",
      primary: "開始建立自動化",
      secondary: "觀看產品影片",
      proof: "HyperFrames 影片展示、繁中預設、Meta API 串接、多帳號 SaaS",
    },
    stats: [
      ["3 分鐘", "建立第一個留言回覆流程"],
      ["24/7", "自動捕捉 IG 銷售訊號"],
      ["0 程式", "拖拉節點就能串流程"],
    ],
    channelsTitle: "你的客戶在哪裡留言，InboxPilot 就在哪裡接住",
    videoSection: {
      eyebrow: "See InboxPilot in action",
      title: "這次先補上 BotCommerce 最有說服力的東西：影片",
      body:
        "BotCommerce 看起來強，是因為每段都用產品畫面或短影片證明功能。InboxPilot v2 現在也把實際產品介紹影片放進頁面，而不是只靠靜態 mock。",
    },
    videos: [
      {
        title: "完整產品巡覽",
        body: "從 IG 留言關鍵字到 DM、自動化流程、標籤與 Inbox 接手，做成一支橫版產品導覽。",
        src: productTourVideo,
        label: "HyperFrames 16:9",
      },
      {
        title: "手機直式短片",
        body: "適合放在社群廣告、限動或手機版首屏，快速傳達 InboxPilot 的核心價值。",
        src: mobileStoryVideo,
        label: "HyperFrames 9:16",
      },
      {
        title: "Flow Builder 展示",
        body: "用影片呈現節點串接、關鍵字條件、延遲與動作，補足原本 v2 只有靜態卡片的不足。",
        src: productTourVideo,
        label: "實際流程畫面",
      },
      {
        title: "Inbox 接手展示",
        body: "把未指派、提醒、熱門名單與真人接手放進影片邏輯，讓使用者知道這不是只有自動回覆。",
        src: productTourVideo,
        label: "團隊收件匣",
      },
    ],
    features: {
      eyebrow: "Powerful automation tools",
      title: "自動化該有的能力，先從 IG 真正會用到的開始",
      body:
        "重構後的 v2 對齊 BotCommerce 的長銷售頁節奏，但內容不照抄，改成 InboxPilot 真正要交付的 IG 自動化能力。",
    },
    featureItems: [
      ["留言觸發 DM", "支援指定貼文、全部貼文、關鍵字條件、延遲觸發、自動按讚與公開回覆。"],
      ["視覺化 Flow Builder", "訊息、條件、動作、等待、標籤、指派節點，用拖拉方式串成完整對話流程。"],
      ["共享 Inbox", "未指派、指派給我、提醒、標籤、收藏、熱門名單與團隊協作都放在同一個收件匣。"],
      ["AI 回覆設定", "每個帳號可設定自己的 AI provider 與 API key，不把 SaaS 使用者設定綁死在 .env。"],
      ["官方 API 優先", "Meta OAuth、Webhook、Token、IG 專業帳號資訊都以正式 API 流程為主。"],
      ["繁中預設", "後台與官網預設繁體中文，英文作為切換語系，不再讓使用者一進來就被英文卡住。"],
    ],
    tabs: {
      title: "為什麼團隊會選 InboxPilot",
      body: "參考 BotCommerce 的 tab 展示，但內容改成 InboxPilot 的真實使用情境。",
      items: [
        ["全天候接住留言", "活動貼文半夜有人留言也能自動回覆，不用等人工醒來才補救。"],
        ["減少重複客服", "價格、尺寸、課程、領取連結等常見問題先由流程處理。"],
        ["高意圖名單標籤", "留言特定關鍵字的人自動加上熱門名單或活動標籤。"],
        ["真人接手不斷線", "自動化先篩選與收集資訊，真正需要溝通時再交給團隊。"],
        ["多帳號管理", "新增 IG 帳號走平台登入流程，每個帳號保留名稱、大頭貼與連線狀態。"],
      ],
    },
    botcommerceMatch: {
      title: "現在 v2 哪裡真的比較像 BotCommerce？",
      body:
        "不是顏色像，也不是排版抄一抄。真正像的是銷售頁的說服節奏：先看產品影片，再看功能、情境、整合、比較、價格與 FAQ。",
      items: [
        ["影片先行", "首屏與 Demo 區都放 HyperFrames 產出的產品影片。"],
        ["長頁節奏", "從 Hero 到 FAQ 的順序參考 BotCommerce 的高密度銷售頁。"],
        ["互動 Tab", "把使用情境拆成可點擊內容，不一次塞滿。"],
        ["ManyChat 比較", "保留替代方案定位，但改成 InboxPilot 的 IG 自動化差異。"],
      ],
    },
    compare: {
      title: "ManyChat 替代方案，但先做好你真的需要的 IG 流程",
      body:
        "BotCommerce 用價格對比 ManyChat；InboxPilot 的對比重點則是中文介面、IG 留言流程、Meta 串接與可控的 AI 設定。",
      rows: [
        ["視覺化自動化", "成熟 Flow Builder", "ManyChat 風格 Flow Builder，聚焦 IG 留言與 DM"],
        ["語系", "英文為主", "繁體中文預設，英文可切換"],
        ["新增帳號", "Meta / Instagram OAuth", "平台登入導向、保留 IG 名稱與大頭貼"],
        ["AI 設定", "平台內建與方案限制", "每個租戶自己的 provider / API key"],
        ["Inbox", "完整客服收件匣", "未指派、提醒、標籤、團隊接手優先補齊"],
      ],
    },
    pricing: {
      eyebrow: "Pricing",
      title: "不用先懂所有功能，先讓第一條 IG 自動化跑起來",
      body:
        "正式價格仍接到現有 /pricing。v2 的任務是先把產品價值、影片展示和使用情境講清楚，價格頁再承接方案比較。",
      cta: "查看價格方案",
      notes: ["連接 IG 帳號", "留言關鍵字自動化", "共享 Inbox", "AI provider 設定"],
    },
    faq: {
      title: "常見問題",
      items: [
        ["這個頁面會取代原本 /official 嗎？", "不會。原本 /official 保留不動，這次新增並重構的是 /official/v2，方便比較兩版官網。"],
        ["v2 現在跟 BotCommerce 像在哪？", "像的是長銷售頁架構、影片先行、功能 tab、比較表、價格 CTA 與 FAQ，而不是照抄品牌或文案。"],
        ["影片真的是 HyperFrames 做的嗎？", "是。這版嵌入的產品巡覽與手機直式短片來自專案內既有 HyperFrames render，並複製到 public/videos/official-v2 使用。"],
        ["還需要補哪些影片？", "下一階段建議再補新增 IG 帳號、指定貼文、留言觸發、Inbox 接手、AI 設定五段短影片，會更接近 BotCommerce 的說服密度。"],
      ],
    },
    footer: {
      tagline: "把 IG 留言與私訊變成可追蹤、可接手、可成交的自動化流程。",
      old: "舊版官網",
      legal: "法律與政策",
      resources: "資源",
      copyright: "© 2026 InboxPilot. All rights reserved.",
    },
  },
  en: {
    nav: {
      demo: "Video demo",
      automation: "Automation",
      compare: "Compare",
      faq: "FAQ",
      pricing: "Pricing",
      login: "Sign in",
      start: "Start free",
      menu: "Menu",
    },
    hero: {
      eyebrow: "IG automation + ManyChat-style Flow Builder",
      title: "InboxPilot",
      subtitle: "Turn comments, DMs, and sales moments into automated conversations.",
      body:
        "V2 no longer only borrows BotCommerce's page rhythm. It now opens with HyperFrames product videos that show comment keywords, DMs, automation flows, and inbox handoff.",
      primary: "Build automation",
      secondary: "Watch product video",
      proof: "HyperFrames demos, Traditional Chinese first, Meta API ready, multi-account SaaS",
    },
    stats: [
      ["3 min", "Create your first comment reply flow"],
      ["24/7", "Catch Instagram sales signals"],
      ["No code", "Build flows with visual nodes"],
    ],
    channelsTitle: "InboxPilot meets customers where they already message you",
    videoSection: {
      eyebrow: "See InboxPilot in action",
      title: "The missing BotCommerce ingredient: real video proof",
      body:
        "BotCommerce feels persuasive because every section shows product motion. InboxPilot v2 now adds rendered product videos instead of relying on static mockups.",
    },
    videos: [
      {
        title: "Full product tour",
        body: "A landscape walkthrough covering IG comment keywords, DM replies, automation flow, tags, and inbox handoff.",
        src: productTourVideo,
        label: "HyperFrames 16:9",
      },
      {
        title: "Mobile vertical story",
        body: "A portrait video for social ads, stories, and mobile-first landing sections.",
        src: mobileStoryVideo,
        label: "HyperFrames 9:16",
      },
      {
        title: "Flow Builder demo",
        body: "Shows node-based keyword, delay, and action logic instead of leaving the flow as a static card.",
        src: productTourVideo,
        label: "Workflow footage",
      },
      {
        title: "Inbox handoff demo",
        body: "Connects automation to the shared inbox so the product does not look like auto-reply only.",
        src: productTourVideo,
        label: "Team inbox",
      },
    ],
    features: {
      eyebrow: "Powerful automation tools",
      title: "Start with the Instagram workflows teams actually need",
      body:
        "The rebuilt v2 follows BotCommerce's sales-page rhythm, but the content is rewritten around InboxPilot's IG automation promise.",
    },
    featureItems: [
      ["Comment to DM", "Selected posts, all posts, keyword conditions, delayed triggers, auto-like, and public replies."],
      ["Visual Flow Builder", "Drag message, condition, action, wait, tag, and assignment nodes into complete paths."],
      ["Shared Inbox", "Unassigned, assigned to me, reminders, tags, favorites, hot leads, and team handoff."],
      ["AI Reply Settings", "Each account can store its own AI provider and API key instead of relying on SaaS deployment .env settings."],
      ["Official API First", "Meta OAuth, webhooks, tokens, and Instagram professional account data follow official API flows."],
      ["Bilingual by Design", "Traditional Chinese is the default experience, with English available as a switchable version."],
    ],
    tabs: {
      title: "Why teams choose InboxPilot",
      body: "Inspired by BotCommerce's tab section, but rewritten around InboxPilot's real use cases.",
      items: [
        ["Always-on comment capture", "Campaign posts can reply overnight without waiting for manual follow-up."],
        ["Less repeated support", "Pricing, sizing, course info, and links can be answered by flows first."],
        ["High-intent lead tags", "People who comment specific keywords can be tagged as hot leads automatically."],
        ["Human handoff stays clear", "Automation collects context first; the team takes over only when needed."],
        ["Multi-account management", "Connect IG accounts through platform login while keeping names, avatars, and status visible."],
      ],
    },
    botcommerceMatch: {
      title: "Where v2 now actually resembles BotCommerce",
      body:
        "It is not about copying colors. It is about the conversion rhythm: product video first, then features, use cases, integrations, comparison, pricing, and FAQ.",
      items: [
        ["Video first", "Hero and demo sections now use HyperFrames-rendered product videos."],
        ["Long-form rhythm", "The page moves from Hero to FAQ like a dense sales page."],
        ["Interactive tabs", "Use cases are grouped into clickable, digestible states."],
        ["ManyChat comparison", "The alternative positioning is kept, but rewritten for IG automation."],
      ],
    },
    compare: {
      title: "A ManyChat alternative focused on the IG workflows you need first",
      body:
        "BotCommerce compares pricing with ManyChat. InboxPilot's comparison is about Chinese UX, IG comment flows, Meta integration, and user-controlled AI settings.",
      rows: [
        ["Visual automation", "Mature Flow Builder", "ManyChat-style builder focused on IG comments and DMs"],
        ["Language", "English-first", "Traditional Chinese default, English switchable"],
        ["Account connect", "Meta / Instagram OAuth", "Platform login flow with IG name and avatar retained"],
        ["AI settings", "Plan and platform dependent", "Tenant-owned provider and API key settings"],
        ["Inbox", "Full support inbox", "Unassigned, reminders, tags, and team handoff first"],
      ],
    },
    pricing: {
      eyebrow: "Pricing",
      title: "You do not need every feature first. You need your first IG automation live.",
      body:
        "Pricing still routes to the existing /pricing page. V2 clarifies product value, video proof, and use cases before visitors compare plans.",
      cta: "View pricing",
      notes: ["Connect IG accounts", "Comment keyword automation", "Shared Inbox", "AI provider settings"],
    },
    faq: {
      title: "Frequently asked questions",
      items: [
        ["Will this replace /official?", "No. The original /official page stays untouched. This is a rebuilt /official/v2 route so both versions can be compared."],
        ["Where does v2 resemble BotCommerce now?", "The page now follows the long-form sales structure, video-first demo, feature tabs, comparison table, pricing CTA, and FAQ rhythm."],
        ["Were the videos made with HyperFrames?", "Yes. The embedded product tour and mobile story come from existing HyperFrames renders in this project and are served from public/videos/official-v2."],
        ["What videos should be added next?", "Account connection, selected post setup, comment trigger, inbox handoff, and AI settings should become separate short clips next."],
      ],
    },
    footer: {
      tagline: "Turn Instagram comments and DMs into trackable, assignable, revenue-ready automation.",
      old: "Old official site",
      legal: "Legal",
      resources: "Resources",
      copyright: "© 2026 InboxPilot. All rights reserved.",
    },
  },
} as const;

const channels = [
  { label: "Instagram", icon: siInstagram, color: "#e4405f" },
  { label: "WhatsApp", icon: siWhatsapp, color: "#25d366" },
  { label: "Messenger", icon: siFacebook, color: "#0866ff" },
  { label: "TikTok", icon: siTiktok, color: "#111111" },
  { label: "Telegram", icon: siTelegram, color: "#26a5e4" },
  { label: "Meta", icon: siMeta, color: "#0467df" },
];

const integrations = [
  { label: "Instagram", icon: siInstagram, color: "#e4405f" },
  { label: "Meta", icon: siMeta, color: "#0467df" },
  { label: "WhatsApp", icon: siWhatsapp, color: "#25d366" },
  { label: "Google", icon: siGoogle, color: "#4285f4" },
  { label: "Shopify", icon: siShopify, color: "#7ab55c" },
  { label: "Telegram", icon: siTelegram, color: "#26a5e4" },
];

const featureIcons: IconComponent[] = [MessageCircle, Workflow, Inbox, Bot, ShieldCheck, Globe2];
const tabIcons: IconComponent[] = [Clock3, Zap, Tags, UserRoundCheck, Settings2];

function useRevealAnimation() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-v2-reveal]"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
}

function useHeroParallax() {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;

    const update = () => {
      frame = 0;
      const rect = root.getBoundingClientRect();
      const scrollProgress = Math.max(-1, Math.min(1, rect.top / Math.max(rect.height, 1)));
      const scrollOffset = -scrollProgress * 72;
      root.style.setProperty("--v2-back-x", `${(-pointerX * 0.22).toFixed(2)}px`);
      root.style.setProperty("--v2-back-y", `${(scrollOffset * 0.22 - pointerY * 0.12).toFixed(2)}px`);
      root.style.setProperty("--v2-mid-x", `${(pointerX * 0.42).toFixed(2)}px`);
      root.style.setProperty("--v2-mid-y", `${(scrollOffset * 0.42 + pointerY * 0.22).toFixed(2)}px`);
      root.style.setProperty("--v2-front-x", `${(pointerX * 0.76).toFixed(2)}px`);
      root.style.setProperty("--v2-front-y", `${(scrollOffset * 0.62 + pointerY * 0.36).toFixed(2)}px`);
      root.style.setProperty("--v2-card-x", `${(pointerX * 0.5).toFixed(2)}px`);
      root.style.setProperty("--v2-card-y", `${(scrollOffset * 0.26 + pointerY * 0.2).toFixed(2)}px`);
      root.style.setProperty("--v2-card-rx", `${(-pointerY * 0.1).toFixed(2)}deg`);
      root.style.setProperty("--v2-card-ry", `${(pointerX * 0.08).toFixed(2)}deg`);
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };
    const handlePointerMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 36;
      pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 28;
      schedule();
    };
    const handlePointerLeave = () => {
      pointerX = 0;
      pointerY = 0;
      schedule();
    };

    root.addEventListener("pointermove", handlePointerMove);
    root.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();

    return () => {
      root.removeEventListener("pointermove", handlePointerMove);
      root.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return ref;
}

function BrandMark({ dark = false }: { dark?: boolean }) {
  return (
    <span className={`flex items-center gap-2 text-xl font-black tracking-[-0.04em] ${dark ? "text-white" : "text-[#111]"}`}>
      <span className={`flex h-9 w-9 items-center justify-center rounded-md text-sm font-black ${dark ? "bg-[#ffde45] text-[#111]" : "bg-[#111] text-[#ffde45]"}`}>
        IP
      </span>
      InboxPilot
    </span>
  );
}

function SimpleIcon({ icon, className = "h-5 w-5" }: { icon: SimpleIconShape; className?: string }) {
  return (
    <svg role="img" aria-label={icon.title} viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d={icon.path} />
    </svg>
  );
}

function VideoFrame({
  src,
  label,
  className = "",
  portrait = false,
}: {
  src: string;
  label: string;
  className?: string;
  portrait?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden rounded-lg border border-[#111] bg-[#111] shadow-[12px_12px_0_rgba(17,17,17,0.16)] ${className}`}>
      <div
        className={`relative block h-full w-full overflow-hidden bg-[#111] ${portrait ? "aspect-[9/16]" : "aspect-video"}`}
        data-demo-src={src}
      >
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#141414_0%,#252525_42%,#0f172a_100%)]" />
        <div className="absolute inset-x-4 top-4 flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-2 h-2 flex-1 rounded-full bg-white/12" />
        </div>
        <div className={`${portrait ? "inset-x-5 top-16" : "left-8 top-16 w-[44%]"} absolute rounded-lg border border-white/10 bg-white p-4 text-[#111] shadow-2xl`}>
          <p className="text-xs font-black uppercase text-[#2f6df6]">InboxPilot</p>
          <p className="mt-2 text-lg font-black leading-tight">Comment to DM Flow</p>
          <div className="mt-4 space-y-2">
            {["留言關鍵字", "自動私訊", "標籤與接手"].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-md bg-[#f2f6ff] px-3 py-2 text-xs font-bold">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#00a876]" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className={`${portrait ? "bottom-7 left-6 right-6" : "bottom-8 right-8 w-[42%]"} absolute rounded-xl bg-[#2f6df6] p-4 text-white shadow-2xl`}>
          <p className="text-xs font-black uppercase opacity-80">Live Preview</p>
          <p className="mt-2 text-sm font-bold leading-6">有人留言「價格」後，自動送出 DM 並建立可追蹤名單。</p>
        </div>
      </div>
      <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black text-[#111]">
        <Play className="h-3.5 w-3.5 fill-[#111]" />
        {label}
      </span>
    </div>
  );
}

function HeroProductVideo({ locale }: { locale: Locale }) {
  return (
    <div className="official-v2-card relative">
      <VideoFrame src={productTourVideo} label={locale === "zh" ? "HyperFrames 產品影片" : "HyperFrames product video"} />
      <div className="absolute -bottom-5 left-6 right-6 rounded-lg border border-[#111] bg-white p-4 shadow-[8px_8px_0_rgba(17,17,17,0.16)]">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-[#2f6df6]">Live walkthrough</p>
        <p className="mt-1 text-sm font-bold leading-6 text-[#111]">
          {locale === "zh"
            ? "留言關鍵字、DM、自動化節點、標籤與 Inbox 接手一次看懂。"
            : "Comment keywords, DMs, automation nodes, tags, and inbox handoff in one flow."}
        </p>
      </div>
    </div>
  );
}

function VideoShowcase({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <section className="border-y border-black/10 bg-white px-5 py-20" id="demo">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div data-v2-reveal>
            <div className="official-v2-reveal">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#2f6df6]">{t.videoSection.eyebrow}</p>
              <h2 className="mt-4 text-4xl font-black leading-[1.02] tracking-[-0.04em] text-[#111] md:text-6xl">
                {t.videoSection.title}
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#4b4f4a]">{t.videoSection.body}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {t.videos.map((video, index) => (
              <article key={video.title} className="rounded-lg border border-black/10 bg-[#f8fafb] p-4">
                <VideoFrame src={video.src} label={video.label} portrait={video.src === mobileStoryVideo} />
                <h3 className="mt-5 text-2xl font-black tracking-[-0.03em] text-[#111]">{video.title}</h3>
                <p className="mt-3 leading-8 text-[#4b4f4a]">{video.body}</p>
                <div className="mt-4 inline-flex rounded-full bg-[#ffde45] px-3 py-1 text-xs font-black text-[#111]">
                  {locale === "zh" ? `影片 ${index + 1}` : `Video ${index + 1}`}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureSection({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <section className="bg-white px-5 py-20" id="automation">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl" data-v2-reveal>
          <div className="official-v2-reveal">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#2f6df6]">{t.features.eyebrow}</p>
            <h2 className="mt-4 text-4xl font-black leading-[1.02] tracking-[-0.04em] text-[#111] md:text-6xl">
              {t.features.title}
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#4b4f4a]">{t.features.body}</p>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {t.featureItems.map(([title, body], index) => {
            const Icon = featureIcons[index] ?? Sparkles;
            return (
              <article key={title} className="rounded-lg border border-black/10 bg-[#f8fafb] p-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-md bg-[#111] text-[#ffde45]">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-2xl font-black tracking-[-0.03em] text-[#111]">{title}</h3>
                <p className="mt-3 leading-8 text-[#4b4f4a]">{body}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FeatureTabs({ locale }: { locale: Locale }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = copy[locale].tabs.items[activeIndex];
  const Icon = tabIcons[activeIndex] ?? Zap;

  return (
    <section className="bg-[#111] px-5 py-20 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.84fr_1.16fr]">
        <div data-v2-reveal>
          <div className="official-v2-reveal">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ffde45]">Why InboxPilot</p>
            <h2 className="mt-4 text-4xl font-black leading-[1.02] tracking-[-0.04em] md:text-6xl">{copy[locale].tabs.title}</h2>
            <p className="mt-5 text-lg leading-8 text-white/72">{copy[locale].tabs.body}</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-[0.82fr_1.18fr]">
          <div className="space-y-3">
            {copy[locale].tabs.items.map(([title], index) => (
              <button
                key={title}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`flex w-full items-center justify-between rounded-md border px-4 py-3 text-left text-sm font-black transition ${
                  activeIndex === index ? "border-[#ffde45] bg-[#ffde45] text-[#111]" : "border-white/12 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                {title}
                <ArrowRight className="h-4 w-4" />
              </button>
            ))}
          </div>
          <div className="min-h-[330px] rounded-lg border border-white/12 bg-white p-6 text-[#111]">
            <span className="flex h-12 w-12 items-center justify-center rounded-md bg-[#2f6df6] text-white">
              <Icon className="h-6 w-6" />
            </span>
            <h3 className="mt-8 text-3xl font-black tracking-[-0.03em]">{active[0]}</h3>
            <p className="mt-4 text-lg leading-8 text-[#4b4f4a]">{active[1]}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-md bg-[#f3f5ef] p-4">
                <Timer className="h-5 w-5 text-[#13c296]" />
                <p className="mt-2 text-sm font-black">{locale === "zh" ? "節省人工時間" : "Save manual time"}</p>
              </div>
              <div className="rounded-md bg-[#f3f5ef] p-4">
                <UserRoundCheck className="h-5 w-5 text-[#13c296]" />
                <p className="mt-2 text-sm font-black">{locale === "zh" ? "團隊一起接手" : "Team handoff"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BotCommerceMatch({ locale }: { locale: Locale }) {
  const t = copy[locale].botcommerceMatch;

  return (
    <section className="border-y border-black/10 bg-[#ffde45] px-5 py-20">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#111]">BotCommerce reference</p>
          <h2 className="mt-4 text-4xl font-black leading-[1.02] tracking-[-0.04em] text-[#111] md:text-6xl">{t.title}</h2>
          <p className="mt-5 text-lg leading-8 text-[#2e332e]">{t.body}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {t.items.map(([title, body]) => (
            <article key={title} className="rounded-lg border border-[#111] bg-white p-5 shadow-[8px_8px_0_rgba(17,17,17,0.13)]">
              <CheckCircle2 className="h-7 w-7 text-[#13c296]" />
              <h3 className="mt-4 text-2xl font-black text-[#111]">{title}</h3>
              <p className="mt-3 leading-8 text-[#4b4f4a]">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function IntegrationWall({ locale }: { locale: Locale }) {
  return (
    <section className="border-y border-black/10 bg-white px-5 py-16">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#13c296]">Connect tools</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] text-[#111] md:text-5xl">
            {locale === "zh" ? "連接你已經在用的平台" : "Connect the platforms you already use"}
          </h2>
          <p className="mt-5 text-lg leading-8 text-[#4b4f4a]">
            {locale === "zh"
              ? "保留 BotCommerce 的整合工具牆，但優先放 InboxPilot 目前最重要的 Meta、IG、WhatsApp、Google 與商務工具。"
              : "The integration wall is inspired by BotCommerce, but focused on Meta, IG, WhatsApp, Google, and commerce tools."}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {integrations.map((item) => (
            <div key={item.label} className="rounded-lg border border-black/10 bg-[#f8fafb] p-5">
              <span style={{ color: item.color }}>
                <SimpleIcon icon={item.icon} className="h-7 w-7" />
              </span>
              <p className="mt-4 font-black text-[#111]">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ComparisonTable({ locale }: { locale: Locale }) {
  const t = copy[locale].compare;

  return (
    <section className="border-y border-black/10 bg-[#f8fafb] px-5 py-20" id="compare">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl" data-v2-reveal>
          <div className="official-v2-reveal">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#2f6df6]">ManyChat alternative</p>
            <h2 className="mt-4 text-4xl font-black leading-[1.02] tracking-[-0.04em] text-[#111] md:text-6xl">{t.title}</h2>
            <p className="mt-5 text-lg leading-8 text-[#4b4f4a]">{t.body}</p>
          </div>
        </div>
        <div className="mt-10 overflow-hidden rounded-lg border border-[#111] bg-white shadow-[12px_12px_0_rgba(17,17,17,0.12)]">
          <div className="grid grid-cols-[0.8fr_1fr_1.2fr] bg-[#111] text-sm font-black text-white">
            <div className="p-4">{locale === "zh" ? "項目" : "Feature"}</div>
            <div className="p-4">ManyChat</div>
            <div className="bg-[#ffde45] p-4 text-[#111]">InboxPilot</div>
          </div>
          {t.rows.map(([feature, manychat, inboxPilot]) => (
            <div key={feature} className="grid grid-cols-[0.8fr_1fr_1.2fr] border-t border-black/10 text-sm">
              <div className="p-4 font-black text-[#111]">{feature}</div>
              <div className="p-4 text-[#5a5d58]">{manychat}</div>
              <div className="bg-[#fff9d9] p-4 font-semibold text-[#111]">{inboxPilot}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingCta({ locale }: { locale: Locale }) {
  const t = copy[locale].pricing;

  return (
    <section className="bg-white px-5 py-20" id="pricing">
      <div className="mx-auto grid max-w-7xl gap-8 rounded-lg border border-[#111] bg-[#ffde45] p-6 shadow-[12px_12px_0_rgba(17,17,17,0.14)] md:grid-cols-[1fr_0.8fr] md:p-10">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#111]">{t.eyebrow}</p>
          <h2 className="mt-4 text-4xl font-black leading-[1.02] tracking-[-0.04em] text-[#111] md:text-6xl">{t.title}</h2>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[#2e332e]">{t.body}</p>
          <Link href="/pricing" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#111] px-7 py-4 font-black text-white">
            {t.cta}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-5">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[#74786f]">
            {locale === "zh" ? "方案應該清楚包含" : "Plans should include"}
          </p>
          <ul className="mt-5 space-y-4">
            {t.notes.map((item) => (
              <li key={item} className="flex items-start gap-3 font-bold text-[#111]">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#13c296]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Faq({ locale }: { locale: Locale }) {
  const [openIndex, setOpenIndex] = useState(0);
  const t = copy[locale].faq;

  return (
    <section className="bg-[#ffde45] px-5 py-20" id="faq">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-4xl font-black tracking-[-0.04em] text-[#111] md:text-6xl">{t.title}</h2>
        <div className="mt-10 divide-y divide-black/10 overflow-hidden rounded-lg border border-[#111] bg-white">
          {t.items.map(([question, answer], index) => {
            const isOpen = openIndex === index;
            return (
              <div key={question}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left font-black text-[#111]"
                  aria-expanded={isOpen}
                >
                  {question}
                  <ChevronDown className={`h-5 w-5 shrink-0 transition ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen ? <p className="px-5 pb-5 leading-8 text-[#4b4f4a]">{answer}</p> : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function OfficialV2LandingPage() {
  const [locale, setLocale] = useState<Locale>("zh");
  const [menuOpen, setMenuOpen] = useState(false);
  const heroRef = useHeroParallax();
  const t = copy[locale];

  useRevealAnimation();

  const navItems = [
    [t.nav.demo, "#demo"],
    [t.nav.automation, "#automation"],
    [t.nav.compare, "#compare"],
    [t.nav.faq, "#faq"],
  ];

  return (
    <main className="min-h-screen bg-white text-[#111]">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/92 backdrop-blur">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 py-3">
          <Link href="/official/v2" aria-label="InboxPilot official v2">
            <BrandMark />
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-bold text-[#343832] lg:flex" aria-label="Main navigation">
            {navItems.map(([label, href]) => (
              <Link key={href} href={href} className="hover:text-[#2f6df6]">
                {label}
              </Link>
            ))}
            <Link href="/pricing" className="hover:text-[#2f6df6]">
              {t.nav.pricing}
            </Link>
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <button
              type="button"
              onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
              className="rounded-full border border-black/10 px-4 py-2 text-sm font-black text-[#111] hover:bg-[#f3f5ef]"
            >
              {locale === "zh" ? "EN" : "繁中"}
            </button>
            <Link href="/login" className="rounded-full px-4 py-2 text-sm font-black text-[#111] hover:bg-[#f3f5ef]">
              {t.nav.login}
            </Link>
            <Link href="/signup" className="rounded-full bg-[#111] px-5 py-2.5 text-sm font-black text-white">
              {t.nav.start}
            </Link>
          </div>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-md border border-black/10 lg:hidden"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label={t.nav.menu}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen ? (
          <div className="border-t border-black/10 bg-white px-5 py-4 lg:hidden">
            <div className="grid gap-2">
              {navItems.map(([label, href]) => (
                <Link key={href} href={href} className="rounded-md px-3 py-3 font-black hover:bg-[#f3f5ef]" onClick={() => setMenuOpen(false)}>
                  {label}
                </Link>
              ))}
              <Link href="/pricing" className="rounded-md px-3 py-3 font-black hover:bg-[#f3f5ef]" onClick={() => setMenuOpen(false)}>
                {t.nav.pricing}
              </Link>
              <button
                type="button"
                onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
                className="rounded-md px-3 py-3 text-left font-black hover:bg-[#f3f5ef]"
              >
                {locale === "zh" ? "Switch to English" : "切換繁中"}
              </button>
              <Link href="/signup" className="rounded-md bg-[#111] px-3 py-3 text-center font-black text-white" onClick={() => setMenuOpen(false)}>
                {t.nav.start}
              </Link>
            </div>
          </div>
        ) : null}
      </header>

      <section ref={heroRef} className="official-v2-parallax-root relative min-h-[calc(100svh-72px)] overflow-hidden bg-[#ffde45]">
        <div className="official-v2-grid-bg absolute inset-0" />
        <div className="official-v2-layer official-v2-back absolute left-[7%] top-[14%] h-24 w-24 rounded-full border border-black/15 bg-white/70" />
        <div className="official-v2-layer official-v2-mid absolute right-[10%] top-[12%] h-20 w-20 rounded-full bg-[#13c296]/55" />
        <div className="official-v2-layer official-v2-front absolute bottom-[10%] left-[42%] h-16 w-16 rounded-full bg-[#ff6b4a]/55" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-14 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:py-20">
          <div className="official-v2-hero-text official-v2-hero-reveal">
            <p className="inline-flex rounded-full border border-black/15 bg-white px-4 py-2 text-sm font-black text-[#111] shadow-[4px_4px_0_rgba(17,17,17,0.12)]">
              {t.hero.eyebrow}
            </p>
            <h1 className="mt-6 text-[clamp(4.25rem,13vw,10.5rem)] font-black leading-[0.78] tracking-[-0.06em] text-[#111]">
              {t.hero.title}
            </h1>
            <p className="mt-6 max-w-2xl text-3xl font-black leading-tight tracking-[-0.03em] text-[#111] md:text-5xl">
              {t.hero.subtitle}
            </p>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#2e332e]">{t.hero.body}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#111] px-7 py-4 font-black text-white shadow-[6px_6px_0_rgba(17,17,17,0.18)]">
                {t.hero.primary}
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="#demo" className="inline-flex items-center justify-center gap-2 rounded-full border border-black/15 bg-white px-7 py-4 font-black text-[#111]">
                {t.hero.secondary}
              </Link>
            </div>
            <p className="mt-5 text-sm font-bold text-[#41463f]">{t.hero.proof}</p>
          </div>

          <div className="official-v2-hero-card-layer pb-8">
            <HeroProductVideo locale={locale} />
          </div>
        </div>

        <div className="relative overflow-hidden border-y border-black/10 bg-white/78 py-4 backdrop-blur">
          <div className="official-v2-marquee flex gap-3 whitespace-nowrap text-sm font-black text-[#111]">
            {[...channels, ...channels].map((channel, index) => (
              <span key={`${channel.label}-${index}`} className="mx-2 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2">
                <span style={{ color: channel.color }}>
                  <SimpleIcon icon={channel.icon} className="h-4 w-4" />
                </span>
                {channel.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-10">
        <div className="mx-auto grid max-w-7xl gap-3 md:grid-cols-3">
          {t.stats.map(([number, label]) => (
            <div key={number} className="rounded-lg border border-black/10 bg-[#f8fafb] p-5">
              <p className="text-4xl font-black tracking-[-0.04em] text-[#111]">{number}</p>
              <p className="mt-2 font-semibold leading-7 text-[#4b4f4a]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-black/10 bg-[#f8fafb] px-5 py-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-sm font-black uppercase tracking-[0.18em] text-[#74786f]">{t.channelsTitle}</p>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {channels.map((channel) => (
              <div key={channel.label} className="flex items-center gap-3 rounded-md border border-black/10 bg-white p-4 font-black text-[#111]">
                <span style={{ color: channel.color }}>
                  <SimpleIcon icon={channel.icon} className="h-5 w-5" />
                </span>
                {channel.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <VideoShowcase locale={locale} />
      <FeatureSection locale={locale} />
      <FeatureTabs locale={locale} />
      <BotCommerceMatch locale={locale} />
      <IntegrationWall locale={locale} />
      <ComparisonTable locale={locale} />
      <PricingCta locale={locale} />
      <Faq locale={locale} />

      <footer className="bg-[#111] px-5 py-12 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.1fr_0.7fr_0.7fr]">
          <div>
            <Link href="/official/v2" className="inline-flex">
              <BrandMark dark />
            </Link>
            <p className="mt-4 max-w-md leading-8 text-white/70">{t.footer.tagline}</p>
            <p className="mt-6 text-sm text-white/45">{t.footer.copyright}</p>
          </div>
          <div>
            <p className="font-black text-[#ffde45]">{t.footer.resources}</p>
            <div className="mt-4 grid gap-3 text-sm text-white/72">
              <Link href="/pricing">Pricing</Link>
              <Link href="/help-center">Help Center</Link>
              <Link href="/api-docs">API Docs</Link>
              <Link href="/official">{t.footer.old}</Link>
            </div>
          </div>
          <div>
            <p className="font-black text-[#ffde45]">{t.footer.legal}</p>
            <div className="mt-4 grid gap-3 text-sm text-white/72">
              <Link href="/privacy-policy">Privacy Policy</Link>
              <Link href="/terms-of-service">Terms of Service</Link>
              <Link href="/data-deletion">Data Deletion</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
