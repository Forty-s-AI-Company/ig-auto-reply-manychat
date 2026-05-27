import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { loadProjectEnv } from "./load-env.mjs";

loadProjectEnv();

const base = "http://localhost:3041";
const outDir = path.resolve("docs/assets");
fs.mkdirSync(outDir, { recursive: true });

const pages = [
  { path: "/dashboard", title: "首頁", mustHave: ["首頁", "自動化", "帳號連線狀態"] },
  { path: "/contacts", title: "聯絡人", mustHave: ["聯絡人", "全部聯絡人", "已訂閱", "新增標籤"] },
  { path: "/automations", title: "自動化", mustHave: ["自動化", "流程編輯器", "點選節點即可編輯"] },
  { path: "/inbox", title: "收件匣", mustHave: ["收件匣", "全部對話", "未指派", "指派給我", "提醒"] },
  { path: "/channels", title: "設定", mustHave: ["設定", "新增平台帳號", "Instagram", "Facebook Messenger", "開發中"] },
  { path: "/profile", title: "我的個人檔案", mustHave: ["我的個人檔案", "基本資料", "已連結平台帳號", "繁體中文"] },
  { path: "/ai-settings", title: "AI", mustHave: ["AI 模型設定", "AI 供應商", "儲存設定"] },
];

const unsafeButtonPattern = /(New Account|我的個人檔案|新增登入方式|Email 通知設定|刪除|解除|停用|登出|傳送到 Instagram|傳送|儲存|加密儲存|清除 Key|測試模型|抓取最新|抓取貼文|同步|長效權杖|刷新|重新讀取|立即執行|付款|建立付款|Dev Tools|Disconnect|Delete|Logout|Send|Save|Refresh)/i;
const unsafeHrefPattern = /\/api\/meta\/oauth\/start|\/api\/auth\/logout|^https?:\/\//i;
const accountSwitcherPattern = /(connected channels|已連接 \d+ 個平台帳號|PRO|Instagram @|Inbox 測試 Instagram|新增平台帳號)/i;

async function waitForServer() {
  const deadline = Date.now() + 45_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(base, { redirect: "manual" });
      if (response.status) return null;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  const child = spawn(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "dev"], {
    cwd: process.cwd(),
    stdio: "ignore",
    detached: false,
  });

  const startedDeadline = Date.now() + 60_000;
  while (Date.now() < startedDeadline) {
    try {
      const response = await fetch(base, { redirect: "manual" });
      if (response.status) return child;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  child.kill();
  throw new Error("本機 dev server 沒有啟動，無法測試 http://localhost:3041。");
}

function cookieFromSetCookie(setCookie) {
  const match = String(setCookie || "").match(/pca_session=([^;]+)/);
  if (!match) throw new Error("登入 API 沒有回傳 pca_session cookie。");
  return {
    name: "pca_session",
    value: match[1],
    domain: "localhost",
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
  };
}

async function login(context) {
  const response = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "admin@example.com", password: "admin123456" }),
  });
  if (!response.ok) throw new Error(`預設帳密登入失敗：${response.status}`);
  await context.addCookies([cookieFromSetCookie(response.headers.get("set-cookie"))]);
}

async function gotoAppPage(page, targetPath) {
  await page.goto(`${base}${targetPath}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => {});
}

async function safeClickButtons(page, checks, pageTitle) {
  const buttons = await page.locator("button").all();
  if (pageTitle === "收件匣") {
    checks.push({
      label: `${pageTitle} 已掃描按鈕`,
      ok: buttons.length > 0,
      details: { total: buttons.length, clicked: [], skipped: ["Inbox 另由 scripts/test-inbox-ui.mjs 做完整互動測試"] },
    });
    return;
  }

  const clicked = [];
  const skipped = [];

  for (let index = 0; index < buttons.length; index += 1) {
    const button = buttons[index];
    const visible = await button.isVisible({ timeout: 500 }).catch(() => false);
    const disabled = await button.isDisabled({ timeout: 500 }).catch(() => true);
    if (!visible || disabled) continue;

    const rawLabel =
      (await button.innerText({ timeout: 500 }).catch(() => "")) ||
      (await button.getAttribute("aria-label", { timeout: 500 }).catch(() => "")) ||
      (await button.getAttribute("title", { timeout: 500 }).catch(() => "")) ||
      "";
    const label = rawLabel.trim();
    const type = await button.getAttribute("type", { timeout: 500 }).catch(() => "");
    const expanded = await button.getAttribute("aria-expanded", { timeout: 500 }).catch(() => null);
    if (!label || unsafeButtonPattern.test(label) || accountSwitcherPattern.test(label) || (expanded !== null && /IG|Instagram|平台/.test(label)) || type === "submit") {
      skipped.push(label || `button-${index}`);
      continue;
    }

    try {
      await button.click({ timeout: 1500 });
      clicked.push(label);
      await page.keyboard.press("Escape").catch(() => {});
      await page.waitForTimeout(150);
    } catch (error) {
      checks.push({ label: `${pageTitle} 按鈕可點擊：${label}`, ok: false, details: String(error).slice(0, 200) });
    }
  }

  checks.push({ label: `${pageTitle} 已掃描按鈕`, ok: buttons.length > 0, details: { total: buttons.length, clicked, skipped } });
}

async function checkLinks(page, checks, pageTitle) {
  const links = await page.locator("a").evaluateAll((items) =>
    items.map((item) => ({
      text: item.textContent?.trim() || "",
      href: item.getAttribute("href") || "",
    })),
  );
  const broken = links.filter((item) => !item.href || item.href === "#");
  const external = links.filter((item) => unsafeHrefPattern.test(item.href));
  checks.push({ label: `${pageTitle} 連結有 href`, ok: broken.length === 0, details: broken });
  checks.push({ label: `${pageTitle} 外部/OAuth 連結只檢查不執行`, ok: true, details: external });
}

const serverProcess = await waitForServer();
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const context = await browser.newContext({ viewport: { width: 1600, height: 900 }, locale: "zh-TW" });
await login(context);

const page = await context.newPage();
const consoleErrors = [];
const responseErrors = [];
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", (error) => consoleErrors.push(error.message));
page.on("response", (response) => {
  const status = response.status();
  if (status >= 400) {
    responseErrors.push({ status, url: response.url() });
  }
});

const checks = [];

for (const target of pages) {
  console.error(`[main-ui] 測試 ${target.title}`);
  await gotoAppPage(page, target.path);
  await page.screenshot({ path: path.join(outDir, `fullsite-${target.title}.png`), fullPage: true });
  const body = await page.locator("body").innerText();
  for (const text of target.mustHave) {
    checks.push({ label: `${target.title} 顯示：${text}`, ok: body.includes(text) });
  }
  checks.push({ label: `${target.title} 沒有英文 Workspace`, ok: !/Default Workspace|Workspace/.test(body) });
  await checkLinks(page, checks, target.title);
  await safeClickButtons(page, checks, target.title);
}

await gotoAppPage(page, "/channels/connect");
console.error("[main-ui] 測試新增平台帳號入口");
const instagramHref = await page.locator('a:has-text("Instagram")').first().getAttribute("href");
checks.push({
  label: "新增平台帳號流程：平台選項會進入 Instagram 連線頁",
  ok: Boolean(instagramHref?.includes("/channels/connect/instagram")),
  details: instagramHref,
});

await gotoAppPage(page, "/dashboard");
console.error("[main-ui] 測試左上角帳號選單");
await page.locator('button[aria-expanded]').first().click();
const dropdownText = await page.locator("body").innerText();
checks.push({ label: "左上角選單顯示新增平台帳號", ok: dropdownText.includes("新增平台帳號") });
checks.push({ label: "左上角選單維持 ManyChat 帳號清單樣式", ok: dropdownText.includes("PRO") && dropdownText.includes("@") && dropdownText.includes("新增平台帳號") });
checks.push({ label: "左上角選單不再顯示工作區切換", ok: !dropdownText.includes("工作區") && !dropdownText.includes("Default Workspace") });
await page.screenshot({ path: path.join(outDir, "fullsite-platform-account-dropdown.png"), fullPage: true });

await browser.close();
if (serverProcess) serverProcess.kill();

const failed = checks.filter((item) => !item.ok);
const blockingConsoleErrors = consoleErrors.filter((item) => !/^Failed to load resource: the server responded with a status of (400|404)/.test(item));
const blockingResponseErrors = responseErrors.filter((item) => {
  if (!item.url.startsWith(base)) return false;
  if (item.url.includes("/__nextjs_original-stack-frames")) return false;
  if (item.url.includes("/favicon.ico")) return false;
  return true;
});
const result = {
  generatedAt: new Date().toISOString(),
  base,
  total: checks.length,
  failed,
  consoleErrors,
  responseErrors,
  blockingConsoleErrors,
  blockingResponseErrors,
  checks,
};
fs.writeFileSync(path.join(outDir, "main-ui-smoke-results.json"), JSON.stringify(result, null, 2), "utf8");
console.log(JSON.stringify({ total: checks.length, failed, blockingConsoleErrors, blockingResponseErrors }, null, 2));
if (failed.length || blockingConsoleErrors.length || blockingResponseErrors.length) process.exitCode = 1;
