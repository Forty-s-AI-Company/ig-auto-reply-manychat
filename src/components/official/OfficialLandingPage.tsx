"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Menu,
  MessageCircle,
  MousePointerClick,
  X,
  Send,
  ShieldCheck,
  Sparkles,
  Tags,
  Zap,
} from "lucide-react";
import {
  siFacebook,
  siInstagram,
  siMeta,
  siTiktok,
  siWhatsapp,
  siYoutube,
} from "simple-icons";
import { useEffect, useMemo, useRef, useState } from "react";

type Locale = "zh" | "en";

const copy = {
  zh: {
    nav: {
      solutions: "解決方案",
      pricing: "方案",
      resources: "資源",
      signIn: "登入",
    },
    hero: {
      eyebrow: "Instagram 自動回覆與收件匣工作台",
      title: "社群訊息，自動處理。成交機會，不再漏接。",
      body:
        "InboxPilot 幫你把 Instagram 留言、私訊、關鍵字、自動回覆與客戶標籤整合在同一個直覺工作台，像 ManyChat 一樣快速建立流程，但更聚焦在中文團隊的日常營運。",
      primary: "免費開始",
      secondary: "查看自動化範例",
      trusted: "為創作者、電商與小型團隊打造",
    },
    badges: ["Meta 串接準備", "IG 留言關鍵字", "繁中介面", "No-code 流程"],
    channelsTitle: "支援你每天使用的社群入口",
    socialProofTitle: "讓每一次留言都變成可以追蹤的對話",
    socialProofBody:
      "不只是自動回覆，InboxPilot 會把留言、私訊、標籤、指派與提醒串在一起，讓銷售與客服都看得懂下一步。",
    testimonials: [
      {
        name: "Lina Chen",
        role: "美妝電商品牌",
        quote: "新品留言一多，私訊回覆終於不用靠人工複製貼上，熱門關鍵字也能直接分流。",
        metric: "42% faster replies",
      },
      {
        name: "Kevin Wu",
        role: "內容創作者",
        quote: "抽獎活動以前會把 inbox 淹掉，現在關鍵字、標籤和提醒會幫我接住後續。",
        metric: "3.1x lead capture",
      },
      {
        name: "Mia Studio",
        role: "社群工作室",
        quote: "操作感接近 ManyChat，新同事比較快理解流程，不需要一直解釋每個步驟。",
        metric: "1 workspace",
      },
    ],
    featuresTitle: "把最有效的對話流程放大",
    featuresBody: "從留言觸發到私訊追蹤，把社群互動變成可管理、可衡量的流程。",
    features: [
      {
        title: "留言轉私訊",
        body: "選擇指定貼文或全部貼文，當關鍵字命中時，自動按讚、回覆留言並送出 IG 私訊。",
      },
      {
        title: "視覺化 Flow Builder",
        body: "用訊息、條件、標籤、延遲與指派節點，拖拉出清楚的自動化路徑。",
      },
      {
        title: "收件匣管理",
        body: "未指派、提醒、標籤、收藏、熱門名單與團隊指派都集中在同一個畫面。",
      },
      {
        title: "繁體中文優先",
        body: "後台預設繁中介面，也保留英文切換，適合中文團隊與跨國協作。",
      },
    ],
    beforeAfter: {
      title: "收件匣使用前後",
      subtitle: "訊息變多，不應該代表工作更亂。",
      beforeTitle: "Before",
      beforeLead: "複製貼上到懷疑人生",
      before: ["重複回答同樣問題", "高意圖客戶藏在私訊裡", "活動留言難追蹤", "半夜錯過成交訊號"],
      afterTitle: "After",
      afterLead: "少一點手忙腳亂",
      after: ["關鍵字自動回覆", "標籤整理高意圖客戶", "提醒與指派接住後續", "互動直接累積成名單"],
    },
    templatesTitle: "從歡迎訊息到銷售漏斗",
    templatesBody: "快速套用常見情境，也能進入 Flow Builder 做完整分支。",
    templates: ["留言自動私訊", "新追蹤者歡迎", "FAQ 自動回覆", "抽獎活動分流", "加標籤與提醒"],
    stepsTitle: "三步驟開始",
    steps: [
      ["建立免費帳號", "註冊後立即進入中文工作台。"],
      ["連接 Instagram", "透過 Meta 授權連接你的專業帳號。"],
      ["發布自動化", "設定關鍵字、延遲、按讚與回覆流程。"],
    ],
    faqTitle: "常見問題",
    faqs: [
      ["需要寫程式嗎？", "不需要。常用流程可以用拖拉節點與表單完成，進階串接再由 API 處理。"],
      ["可以指定某篇 IG 貼文嗎？", "可以。系統設計支援指定貼文或全部貼文，再設定關鍵字與延遲。"],
      ["可以繁體中文使用嗎？", "可以。官方網站與後台都以繁體中文為預設，也提供英文切換。"],
    ],
    footer: {
      company: "InboxPilot",
      resources: "資源",
      copyright: "© 2026 InboxPilot. All rights reserved.",
    },
  },
  en: {
    nav: {
      solutions: "Solutions",
      pricing: "Pricing",
      resources: "Resources",
      signIn: "Sign in",
    },
    hero: {
      eyebrow: "Instagram automation and inbox workspace",
      title: "Social conversations, automated. Sales moments, captured.",
      body:
        "InboxPilot brings Instagram comments, DMs, keywords, automated replies, and customer tags into one clear workspace. Build flows quickly with a ManyChat-style experience designed for teams that need clarity.",
      primary: "Get started free",
      secondary: "View automation examples",
      trusted: "Built for creators, sellers, and lean teams",
    },
    badges: ["Meta-ready setup", "IG comment keywords", "Bilingual UI", "No-code flows"],
    channelsTitle: "Works with the channels your audience already uses",
    socialProofTitle: "Turn every comment into a trackable conversation",
    socialProofBody:
      "InboxPilot connects comments, DMs, tags, assignments, and reminders so sales and support teams know exactly what to do next.",
    testimonials: [
      {
        name: "Lina Chen",
        role: "Beauty commerce brand",
        quote: "Launch comments no longer become a manual copy-paste marathon. Keywords route replies automatically.",
        metric: "42% faster replies",
      },
      {
        name: "Kevin Wu",
        role: "Creator",
        quote: "Giveaway messages used to flood my inbox. Now keywords, tags, and reminders catch the follow-up.",
        metric: "3.1x lead capture",
      },
      {
        name: "Mia Studio",
        role: "Social agency",
        quote: "The inbox feels close to ManyChat, so new teammates understand the workflow much faster.",
        metric: "1 workspace",
      },
    ],
    featuresTitle: "Scale your best conversations",
    featuresBody: "From comment triggers to DM follow-up, turn social engagement into manageable, measurable workflows.",
    features: [
      {
        title: "Comment to DM",
        body: "Target a specific post or all posts, then send automated DM replies when keywords match.",
      },
      {
        title: "Visual flow builder",
        body: "Drag message, condition, tag, delay, and assignment nodes into clear automation paths.",
      },
      {
        title: "Inbox management",
        body: "Manage unassigned chats, reminders, tags, favorites, and hot leads in one place.",
      },
      {
        title: "Bilingual by design",
        body: "Traditional Chinese is the default, with an English version ready for international teams.",
      },
    ],
    beforeAfter: {
      title: "Your inbox: before and after",
      subtitle: "More messages should not mean more mess.",
      beforeTitle: "Before",
      beforeLead: "Copy-paste overload",
      before: ["Repeating the same replies", "Hot leads lost in DMs", "Campaign comments hard to track", "Sales signals missed overnight"],
      afterTitle: "After",
      afterLead: "Less grind, more signal",
      after: ["Keyword-based replies", "Tags for high-intent leads", "Reminders and assignments", "Every interaction builds your list"],
    },
    templatesTitle: "From welcome messages to sales funnels",
    templatesBody: "Start with common templates or open the Flow Builder for full branching logic.",
    templates: ["Auto-DM from comments", "New follower welcome", "FAQ automation", "Giveaway routing", "Tags and reminders"],
    stepsTitle: "Get running in three steps",
    steps: [
      ["Create your account", "Start in the workspace immediately."],
      ["Connect Instagram", "Authorize your professional account through Meta."],
      ["Launch automation", "Set keywords, delays, likes, and reply flows."],
    ],
    faqTitle: "Frequently asked questions",
    faqs: [
      ["Do I need code?", "No. Common workflows can be built with visual nodes and forms; advanced integrations use APIs."],
      ["Can I target one Instagram post?", "Yes. The system supports a selected post or all posts, then matches keywords and timing rules."],
      ["Is Traditional Chinese supported?", "Yes. Traditional Chinese is the default, and English is available as a switchable version."],
    ],
    footer: {
      company: "InboxPilot",
      resources: "Resources",
      copyright: "© 2026 InboxPilot. All rights reserved.",
    },
  },
} satisfies Record<Locale, Record<string, unknown>>;

const channelIcons = [
  { label: "Instagram", icon: siInstagram, bg: "#E4405F" },
  { label: "WhatsApp", icon: siWhatsapp, bg: "#25D366" },
  { label: "Messenger", icon: siFacebook, bg: "#0866FF" },
  { label: "TikTok", icon: siTiktok, bg: "#111111" },
  { label: "Meta", icon: siMeta, bg: "#0467DF" },
];

const avatarImages = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=240&q=80",
];

function useRevealAnimation() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
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

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (prefersReduced.matches) return;

    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;

    const update = () => {
      frame = 0;
      const rect = root.getBoundingClientRect();
      const scrollProgress = Math.max(-1, Math.min(1, rect.top / Math.max(rect.height, 1)));
      const scrollY = -scrollProgress * 90;
      const setLayer = (name: string, xFactor: number, yFactor: number, scrollFactor: number) => {
        root.style.setProperty(`--ip-${name}-x`, `${(pointerX * xFactor).toFixed(2)}px`);
        root.style.setProperty(`--ip-${name}-y`, `${(scrollY * scrollFactor + pointerY * yFactor).toFixed(2)}px`);
      };

      root.style.setProperty("--ip-card-rotate-x", `${(pointerY * -0.14).toFixed(2)}deg`);
      root.style.setProperty("--ip-card-rotate-y", `${(pointerX * 0.12).toFixed(2)}deg`);
      setLayer("back", -0.25, -0.18, 0.2);
      setLayer("mid", 0.45, 0.32, 0.38);
      setLayer("front", 0.8, 0.55, 0.56);
      setLayer("text", -0.18, 0, 0.12);
      setLayer("card", 0.62, 0.36, 0.3);
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 28;
      pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 22;
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

function SimpleIcon({
  icon,
  className = "h-5 w-5",
}: {
  icon: { path: string; title: string };
  className?: string;
}) {
  return (
    <svg role="img" aria-label={icon.title} viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d={icon.path} />
    </svg>
  );
}

function AnimatedHeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <span className="inboxpilot-parallax-layer inboxpilot-depth-back inboxpilot-float-bubble left-[8%] top-[14%] h-16 w-16 bg-white/70 delay-100" />
      <span className="inboxpilot-parallax-layer inboxpilot-depth-mid inboxpilot-float-bubble right-[12%] top-[10%] h-24 w-24 bg-[#2f6df6]/20 delay-300" />
      <span className="inboxpilot-parallax-layer inboxpilot-depth-front inboxpilot-float-bubble bottom-[8%] left-[42%] h-20 w-20 bg-white/45 delay-500" />
      <span className="inboxpilot-parallax-layer inboxpilot-depth-mid absolute bottom-16 right-[34%] h-32 w-32 rounded-full border border-black/10 bg-white/15" />
    </div>
  );
}

function WorkflowPreview({ locale }: { locale: Locale }) {
  const isZh = locale === "zh";
  const nodes = [
    { top: 20, icon: MessageCircle, title: isZh ? "When 留言命中關鍵字" : "When keyword matches", color: "#2f6df6" },
    { top: 142, icon: Send, title: isZh ? "Send IG 私訊回覆" : "Send Instagram DM", color: "#ffcc32" },
    { top: 264, icon: Tags, title: isZh ? "Action 加入熱門名單" : "Action add hot lead tag", color: "#24bf6b" },
  ];

  return (
    <div className="inboxpilot-hero-card relative min-h-[560px] overflow-hidden rounded-[28px] border border-[#151515] bg-[#111] p-4 shadow-[0_28px_70px_rgba(0,0,0,0.24)]">
      <div className="inboxpilot-orbit-card absolute right-7 top-7 rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#111] shadow-xl">
        {isZh ? "自動化已啟用" : "Automation on"}
      </div>
      <div className="rounded-[22px] bg-[#f7f7f2] p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#333] shadow-sm">
            Flow Builder
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-2xl border border-[#deded4] bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8a8a7c]">
              {isZh ? "觸發條件" : "Trigger"}
            </p>
            <div className="mt-4 space-y-3">
              {[
                [isZh ? "指定貼文" : "Selected post", isZh ? "新品測試貼文" : "Launch post"],
                [isZh ? "關鍵字" : "Keyword", "price, dm, coupon"],
                [isZh ? "延遲" : "Delay", "2 min"],
              ].map(([label, value], index) => (
                <div
                  key={label}
                  className="inboxpilot-stagger-item rounded-xl bg-[#f4f5ef] p-3"
                  style={{ animationDelay: `${220 + index * 130}ms` }}
                >
                  <p className="text-xs text-[#777]">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-[#171717]">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[370px] rounded-2xl border border-[#deded4] bg-[#fbfbf8] p-4">
            <div className="inboxpilot-flow-line absolute left-9 top-12 h-[250px] w-px bg-[#c7c7ba]" />
            {nodes.map((node, index) => {
              const Icon = node.icon;
              return (
                <div
                  key={node.title}
                  className="inboxpilot-flow-node absolute left-4 right-4 rounded-2xl border border-[#deded4] bg-white p-4 shadow-[0_14px_30px_rgba(23,23,23,0.08)]"
                  style={{ top: node.top, animationDelay: `${360 + index * 180}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: node.color }}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-[#151515]">{node.title}</p>
                      <p className="text-xs text-[#777]">{isZh ? "點擊可編輯內容與下一步" : "Click to edit content and next step"}</p>
                    </div>
                  </div>
                  <span className="inboxpilot-blue-dot absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white bg-[#2f6df6]" />
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            ["1.8s", isZh ? "平均自動回覆" : "avg. auto reply"],
            ["24/7", isZh ? "不中斷接單" : "always on"],
            ["100%", isZh ? "免寫程式" : "no-code"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-2xl bg-[#171717] p-4 text-white">
              <p className="text-2xl font-black">{value}</p>
              <p className="mt-1 text-xs text-white/70">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function OfficialLandingPage() {
  const [locale, setLocale] = useState<Locale>("zh");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroParallaxRef = useHeroParallax();
  useRevealAnimation();

  const t = copy[locale];
  const isZh = locale === "zh";
  const features = t.features as Array<{ title: string; body: string }>;
  const testimonials = t.testimonials as Array<{ name: string; role: string; quote: string; metric: string }>;
  const steps = t.steps as Array<[string, string]>;
  const faqs = t.faqs as Array<[string, string]>;
  const beforeAfter = t.beforeAfter as {
    title: string;
    subtitle: string;
    beforeTitle: string;
    beforeLead: string;
    before: string[];
    afterTitle: string;
    afterLead: string;
    after: string[];
  };
  const nav = t.nav as Record<string, string>;
  const hero = t.hero as Record<string, string>;
  const footer = t.footer as Record<string, string>;
  const badges = t.badges as string[];
  const templates = t.templates as string[];
  const footerColumns = [
    {
      title: footer.company,
      links: [
        { label: "InboxPilot", href: "/inboxpilot" },
        { label: isZh ? "關於我們" : "About", href: "/about" },
        { label: isZh ? "隱私權政策" : "Privacy", href: "/privacy-policy" },
        { label: isZh ? "服務條款" : "Terms", href: "/terms-of-service" },
        { label: isZh ? "系統狀態" : "Status", href: "/status" },
      ],
    },
    {
      title: footer.resources,
      links: [
        { label: isZh ? "說明中心" : "Help Center", href: "/help-center" },
        { label: isZh ? "範本" : "Templates", href: "/templates" },
        { label: isZh ? "API 文件" : "API", href: "/api-docs" },
        { label: isZh ? "聯絡我們" : "Contact", href: "/contact" },
      ],
    },
  ];

  const navItems = useMemo(
    () => [
      [nav.solutions, "#templates"],
      [nav.pricing, "/pricing"],
      [nav.resources, "#faq"],
    ],
    [nav],
  );

  return (
    <main className="min-h-screen bg-[#fffdf2] text-[#111]">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#fffdf2]/92 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5">
          <Link href="/official" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#111] text-lg font-black text-[#ffdd35]">
              IP
            </span>
            <span className="text-2xl font-black tracking-[-0.04em]">InboxPilot</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-[#2f2f2f] lg:flex">
            {navItems.map(([label, href]) => (
              <Link key={href} href={href} className="hover:text-[#2f6df6]">
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setLocale(isZh ? "en" : "zh")}
              className="rounded-full border border-black/15 bg-white px-4 py-2 text-sm font-bold text-[#111] shadow-sm hover:border-black/30"
              aria-label="Switch language"
            >
              {isZh ? "EN" : "繁中"}
            </button>
            <Link href="/login" className="hidden text-sm font-bold text-[#222] hover:text-[#2f6df6] sm:inline">
              {nav.signIn}
            </Link>
            <Link
              href="/signup"
              className="hidden items-center gap-2 whitespace-nowrap rounded-full bg-[#ffdd35] px-4 py-3 text-xs font-black text-[#111] shadow-[0_5px_0_#111] transition hover:-translate-y-0.5 hover:shadow-[0_7px_0_#111] sm:inline-flex sm:px-5 sm:text-sm"
            >
              {hero.primary}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/15 bg-white text-[#111] shadow-sm lg:hidden"
              aria-label={mobileMenuOpen ? "關閉選單" : "開啟選單"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen ? (
          <div className="border-t border-black/10 bg-[#fffdf2] px-5 py-4 shadow-[0_20px_40px_rgba(0,0,0,0.08)] lg:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col gap-2 text-base font-black">
              {navItems.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-2xl bg-white px-4 py-4 shadow-sm hover:bg-[#ffdd35]"
                >
                  {label}
                </Link>
              ))}
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl bg-white px-4 py-4 shadow-sm hover:bg-[#ffdd35]"
              >
                {nav.signIn}
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#ffdd35] px-5 py-4 text-center font-black shadow-[0_5px_0_#111]"
              >
                {hero.primary}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </nav>
          </div>
        ) : null}
      </header>

      <section
        ref={heroParallaxRef}
        className="inboxpilot-parallax-root relative overflow-hidden border-b border-black/10 bg-[#ffdd35]"
      >
        <AnimatedHeroBackground />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[0.94fr_1.06fr] lg:py-24">
          <div className="inboxpilot-parallax-layer inboxpilot-depth-text relative z-10 flex flex-col justify-center">
            <div className="inboxpilot-hero-reveal mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-black/15 bg-white px-4 py-2 text-sm font-black">
              <Sparkles className="h-4 w-4 text-[#2f6df6]" />
              {hero.eyebrow}
            </div>
            <h1 className="inboxpilot-hero-reveal max-w-3xl text-[42px] font-black leading-[0.95] tracking-[-0.06em] text-[#111] [animation-delay:120ms] sm:text-[70px] lg:text-[84px]">
              {hero.title}
            </h1>
            <p className="inboxpilot-hero-reveal mt-6 max-w-2xl text-lg leading-8 text-[#383838] [animation-delay:240ms] sm:text-xl">
              {hero.body}
            </p>
            <div className="inboxpilot-hero-reveal mt-8 flex flex-col gap-3 [animation-delay:360ms] sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#111] px-7 py-4 text-base font-black text-white shadow-[0_6px_0_#2f6df6] transition hover:-translate-y-0.5"
              >
                {hero.primary}
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="#templates"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-black/15 bg-white px-7 py-4 text-base font-black text-[#111] hover:border-black/35"
              >
                {hero.secondary}
                <ChevronDown className="h-5 w-5" />
              </Link>
            </div>
            <div className="inboxpilot-hero-reveal mt-8 flex flex-wrap gap-2 [animation-delay:480ms]">
              {badges.map((badge) => (
                <span key={badge} className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-bold text-[#3a3a3a]">
                  {badge}
                </span>
              ))}
            </div>
            <p className="inboxpilot-hero-reveal mt-8 text-sm font-bold uppercase tracking-[0.18em] text-[#656565] [animation-delay:600ms]">
              {hero.trusted}
            </p>
          </div>

          <div className="inboxpilot-parallax-layer inboxpilot-depth-card pointer-events-none relative z-0 select-none" aria-hidden="true">
            <WorkflowPreview locale={locale} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10" data-reveal>
        <p className="mb-5 text-center text-sm font-black uppercase tracking-[0.18em] text-[#666]">
          {t.channelsTitle as string}
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {channelIcons.map((item, index) => (
            <div
              key={item.label}
              className="inboxpilot-reveal-card flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-4 shadow-sm"
              style={{ transitionDelay: `${index * 70}ms` }}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl text-white" style={{ backgroundColor: item.bg }}>
                <SimpleIcon icon={item.icon} />
              </span>
              <span className="font-black">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-black/10 bg-[#111] text-white" data-reveal>
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="inboxpilot-reveal-card">
            <h2 className="text-4xl font-black tracking-[-0.04em] sm:text-5xl">{t.socialProofTitle as string}</h2>
            <p className="mt-5 text-lg leading-8 text-white/70">{t.socialProofBody as string}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((item, index) => (
              <article
                key={item.name}
                className="inboxpilot-reveal-card rounded-3xl bg-white p-5 text-[#111]"
                style={{ transitionDelay: `${index * 90}ms` }}
              >
                <div
                  role="img"
                  aria-label={item.name}
                  className="h-16 w-16 rounded-2xl bg-cover bg-center"
                  style={{ backgroundImage: `url(${avatarImages[index]})` }}
                />
                <p className="mt-5 min-h-[108px] text-sm leading-6 text-[#333]">“{item.quote}”</p>
                <div className="mt-5 border-t border-black/10 pt-4">
                  <p className="font-black">{item.name}</p>
                  <p className="text-sm text-[#666]">{item.role}</p>
                  <p className="mt-3 rounded-full bg-[#ffdd35] px-3 py-1 text-xs font-black">{item.metric}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-5 py-20" data-reveal>
        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="inboxpilot-reveal-card">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2f6df6] text-white">
              <Zap className="h-7 w-7" />
            </div>
            <h2 className="text-4xl font-black tracking-[-0.05em] sm:text-6xl">{t.featuresTitle as string}</h2>
            <p className="mt-5 text-lg leading-8 text-[#4a4a4a]">{t.featuresBody as string}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature, index) => {
              const Icon = [MessageCircle, MousePointerClick, Tags, ShieldCheck][index];
              return (
                <article
                  key={feature.title}
                  className="inboxpilot-reveal-card rounded-3xl border border-black/10 bg-white p-6 shadow-sm"
                  style={{ transitionDelay: `${index * 80}ms` }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ffdd35]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-black">{feature.title}</h3>
                  <p className="mt-3 leading-7 text-[#555]">{feature.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#f1efe2] px-5 py-20" data-reveal>
        <div className="mx-auto max-w-7xl">
          <div className="inboxpilot-reveal-card mb-10 text-center">
            <h2 className="text-4xl font-black tracking-[-0.05em] sm:text-6xl">{beforeAfter.title}</h2>
            <p className="mt-4 text-lg text-[#555]">{beforeAfter.subtitle}</p>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {[
              [beforeAfter.beforeTitle, beforeAfter.beforeLead, beforeAfter.before, "bg-white"],
              [beforeAfter.afterTitle, beforeAfter.afterLead, beforeAfter.after, "bg-[#ffdd35]"],
            ].map(([title, lead, items, cardClass], index) => (
              <article
                key={String(title)}
                className={`inboxpilot-reveal-card rounded-[30px] border border-black/10 p-7 ${cardClass}`}
                style={{ transitionDelay: `${index * 120}ms` }}
              >
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#666]">{String(title)}</p>
                <h3 className="mt-3 text-4xl font-black tracking-[-0.05em]">{String(lead)}</h3>
                <ul className="mt-6 space-y-3">
                  {(items as string[]).map((item) => (
                    <li key={item} className="flex items-start gap-3 rounded-2xl bg-white/65 p-4 font-bold">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#2f6df6]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="templates" className="mx-auto max-w-7xl px-5 py-20" data-reveal>
        <div className="inboxpilot-reveal-card mb-10 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h2 className="max-w-3xl text-4xl font-black tracking-[-0.05em] sm:text-6xl">{t.templatesTitle as string}</h2>
            <p className="mt-4 text-lg text-[#555]">{t.templatesBody as string}</p>
          </div>
          <Link href="/automations" className="inline-flex w-fit items-center gap-2 rounded-full bg-[#111] px-6 py-3 font-black text-white">
            {isZh ? "進入自動化" : "Open automations"}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          {templates.map((template, index) => (
            <article
              key={template}
              className="inboxpilot-reveal-card min-h-[180px] rounded-3xl border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              style={{ transitionDelay: `${index * 70}ms` }}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2f6df6] text-sm font-black text-white">
                {index + 1}
              </span>
              <h3 className="mt-6 text-lg font-black">{template}</h3>
              <p className="mt-4 text-sm font-bold text-[#2f6df6]">{isZh ? "查看範例" : "Check it out"}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-black/10 bg-[#ffdd35] px-5 py-20" data-reveal>
        <div className="mx-auto max-w-7xl">
          <h2 className="inboxpilot-reveal-card text-center text-4xl font-black tracking-[-0.05em] sm:text-6xl">
            {t.stepsTitle as string}
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map(([title, body], index) => (
              <article
                key={title}
                className="inboxpilot-reveal-card rounded-3xl border border-black/10 bg-white p-7"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#777]">Step {index + 1}</p>
                <h3 className="mt-4 text-2xl font-black">{title}</h3>
                <p className="mt-3 leading-7 text-[#555]">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-4xl px-5 py-20" data-reveal>
        <h2 className="inboxpilot-reveal-card text-center text-4xl font-black tracking-[-0.05em] sm:text-6xl">
          {t.faqTitle as string}
        </h2>
        <div className="inboxpilot-reveal-card mt-10 divide-y divide-black/10 rounded-[30px] border border-black/10 bg-white">
          {faqs.map(([question, answer]) => (
            <details key={question} className="group p-6" open>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-xl font-black">
                {question}
                <ChevronDown className="h-5 w-5 transition group-open:rotate-180" />
              </summary>
              <p className="mt-4 leading-7 text-[#555]">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="bg-[#111] px-5 py-12 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.5fr_0.7fr_0.7fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ffdd35] text-lg font-black text-[#111]">
                IP
              </span>
              <span className="text-2xl font-black">InboxPilot</span>
            </div>
            <p className="mt-4 max-w-md text-white/65">
              {isZh
                ? "把 Instagram 訊息、留言與自動化集中管理，讓每個互動都有下一步。"
                : "Manage Instagram conversations, comments, and automations so every interaction has a next step."}
            </p>
            <div className="mt-6 flex gap-3 text-white/75">
              {[siInstagram, siYoutube, siTiktok].map((icon) => (
                <span key={icon.title} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                  <SimpleIcon icon={icon} className="h-5 w-5" />
                </span>
              ))}
            </div>
          </div>
          {footerColumns.map((column) => (
            <div key={String(column.title)}>
              <h3 className="font-black uppercase tracking-[0.16em] text-white/55">{String(column.title)}</h3>
              <ul className="mt-4 space-y-3 text-white/80">
                {column.links.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="hover:text-[#ffdd35]">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-sm text-white/50">
          {footer.copyright}
        </div>
      </footer>
    </main>
  );
}
