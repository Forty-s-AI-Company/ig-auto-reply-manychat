import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { loadProjectEnv } from "./load-env.mjs";

loadProjectEnv();

const base = "http://localhost:3041";
const outDir = path.resolve("docs/assets/account-connection-flow");
fs.mkdirSync(outDir, { recursive: true });

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

const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const context = await browser.newContext({ viewport: { width: 1920, height: 960 }, locale: "zh-TW" });
const login = await fetch(`${base}/api/auth/login`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ email: "admin@example.com", password: "admin123456" }),
});
if (!login.ok) throw new Error(`登入失敗：${login.status}`);
await context.addCookies([cookieFromSetCookie(login.headers.get("set-cookie"))]);

const page = await context.newPage();
const checks = [];

async function expectText(label, text) {
  const body = await page.locator("body").innerText();
  checks.push({ label, ok: body.includes(text), text });
}

await page.goto(`${base}/dashboard`, { waitUntil: "networkidle" });
await page.locator('button[aria-expanded]').first().click();
await expectText("左上角下拉顯示新增平台帳號", "新增平台帳號");
await expectText("左上角下拉顯示 PRO", "PRO");
await page.screenshot({ path: path.join(outDir, "01-account-dropdown.png"), fullPage: true });

await page.getByRole("button", { name: /新增平台帳號/ }).click();
await page.waitForURL("**/channels/connect", { timeout: 10000 });
await expectText("Channel Connection 標題", "你想從哪個平台開始？");
await expectText("Channel Connection 有 Instagram", "Instagram");
await expectText("Channel Connection 有 Facebook Messenger", "Facebook Messenger");
await page.screenshot({ path: path.join(outDir, "02-channel-connection.png"), fullPage: true });

await page.getByRole("link", { name: /Instagram/i }).click();
await page.waitForURL("**/channels/connect/instagram", { timeout: 10000 });
await expectText("Instagram 連線頁標題", "連接 Instagram");
await expectText("Instagram 連線頁主按鈕", "透過 Meta 連接");
await expectText("Instagram 連線頁更多選項", "查看更多選項");
await page.screenshot({ path: path.join(outDir, "03-instagram-connect.png"), fullPage: true });

await page.getByRole("button", { name: /查看更多選項/ }).click();
await expectText("更多選項有透過 Instagram 連接", "透過 Instagram 連接");
await expectText("更多選項有 Meta Business Suite", "Meta Business Suite");
await page.screenshot({ path: path.join(outDir, "04-instagram-more-options.png"), fullPage: true });

await page.goto(`${base}/channels/connect/success?connected=1&mode=instagram`, { waitUntil: "networkidle" });
await expectText("成功頁顯示已成功連接", "已成功連接");
await expectText("成功頁顯示前往帳號管理", "前往帳號管理");
await page.screenshot({ path: path.join(outDir, "05-connected-success.png"), fullPage: true });

await browser.close();

const failed = checks.filter((item) => !item.ok);
fs.writeFileSync(path.join(outDir, "results.json"), JSON.stringify({ checks, failed }, null, 2), "utf8");
console.log(JSON.stringify({ total: checks.length, failed }, null, 2));
if (failed.length) process.exitCode = 1;
