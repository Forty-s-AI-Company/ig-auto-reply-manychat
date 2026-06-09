import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
import { loadProjectEnv } from "./load-env.mjs";

loadProjectEnv();
const base = "http://localhost:3041";
const outDir = path.resolve("docs/assets");
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
fs.mkdirSync(outDir, { recursive: true });

if (!adminEmail || !adminPassword) {
  throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required for UI smoke tests.");
}

async function ensureInboxFixture() {
  const prisma = new PrismaClient();
  try {
    const workspace = await prisma.workspace.upsert({
      where: { id: "default-workspace" },
      update: {},
      create: { id: "default-workspace", name: "Default Workspace", slug: "default" },
    });
    const channel = await prisma.channel.upsert({
      where: { workspaceId_type_name: { workspaceId: workspace.id, type: "instagram", name: "Inbox 測試 Instagram" } },
      update: { enabled: true },
      create: {
        workspaceId: workspace.id,
        type: "instagram",
        name: "Inbox 測試 Instagram",
        enabled: true,
        configJson: {},
      },
    });
    const contact = await prisma.contact.upsert({
      where: { channelId_externalId: { channelId: channel.id, externalId: "inbox-ui-fixture" } },
      update: { displayName: "lin.s.luo", username: "lin.s.luo", consentStatus: "opted_in" },
      create: {
        channelId: channel.id,
        externalId: "inbox-ui-fixture",
        displayName: "lin.s.luo",
        username: "lin.s.luo",
        consentStatus: "opted_in",
        metadataJson: {},
      },
    });
    const conversation = await prisma.conversation.upsert({
      where: { id: "inbox-ui-fixture-conversation" },
      update: {
        contactId: contact.id,
        channelId: channel.id,
        status: "open",
        assignedToId: null,
        reminderAt: null,
        isFavorite: false,
        lastMessageAt: new Date(),
      },
      create: {
        id: "inbox-ui-fixture-conversation",
        contactId: contact.id,
        channelId: channel.id,
        status: "open",
        lastMessageAt: new Date(),
      },
    });
    await prisma.contactTag.deleteMany({ where: { contactId: contact.id } });
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        contactId: contact.id,
        channelId: channel.id,
        direction: "inbound",
        messageType: "text",
        text: `Inbox UI 測試 ${Date.now()}`,
        payloadJson: {},
      },
    });
    for (const item of [
      { name: "熱門名單", color: "#f97316" },
      { name: "合作夥伴", color: "#eab308" },
    ]) {
      await prisma.tag.upsert({
        where: { workspaceId_name: { workspaceId: workspace.id, name: item.name } },
        update: {},
        create: { workspaceId: workspace.id, name: item.name, color: item.color },
      });
    }
  } finally {
    await prisma.$disconnect();
  }
}

await ensureInboxFixture();

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1600, height: 900 },
  locale: "zh-TW",
});

const login = await fetch(`${base}/api/auth/login`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ email: adminEmail, password: adminPassword }),
});
const setCookie = login.headers.get("set-cookie") || "";
const match = setCookie.match(/pca_session=([^;]+)/);
if (match) {
  await context.addCookies([
    {
      name: "pca_session",
      value: match[1],
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}

const page = await context.newPage();
const consoleErrors = [];
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", (error) => consoleErrors.push(error.message));

await page.goto(`${base}/inbox`, { waitUntil: "networkidle" });
await page.screenshot({ path: path.join(outDir, "manychat-inbox-zh-layout.png"), fullPage: true });

const checks = [];
async function visible(label, selector) {
  const ok = await page.locator(selector).first().isVisible().catch(() => false);
  checks.push({ label, ok });
  return ok;
}

await visible("頁面標題：收件匣", "text=收件匣");
await visible("搜尋欄：搜尋收件匣對話", 'input[placeholder="搜尋收件匣對話"]');
await visible("左側 aside：全部對話", 'button:has-text("全部對話")');
await visible("左側 aside：未指派", 'button:has-text("未指派")');
await visible("左側 aside：指派給我", 'button:has-text("指派給我")');
await visible("左側 aside：提醒", 'button:has-text("提醒")');
await visible("工具列：開啟對話", 'button:has-text("開啟對話")');
await visible("工具列：未讀", 'button:has-text("未讀")');
await visible("工具列：最新排序", 'button:has-text("最新排序")');
await visible("工具列：所有渠道", 'button:has-text("所有渠道")');
await visible("工具列：篩選", 'button:has-text("篩選")');
await visible("回覆分頁", 'button:has-text("回覆")');
await visible("備註分頁", 'button:has-text("備註")');
await visible("右側：自動化", "text=自動化");
await visible("右側：聯絡人標籤", "text=聯絡人標籤");
await visible("右側：系統欄位", "text=系統欄位");

await page.locator('button:has-text("篩選")').click();
await visible("篩選說明浮層", "text=目前支援狀態、未讀、排序、渠道、指派、提醒與標籤篩選。");
await page.locator('button:has-text("最新排序")').click();
await visible("排序切換：最舊排序", 'button:has-text("最舊排序")');
await page.getByRole("button", { name: "所有渠道", exact: true }).click();
await visible("渠道切換：Instagram", 'button:has-text("Instagram")');
await page.locator('button:has-text("未讀")').click();
await visible("未讀篩選可點擊", 'button:has-text("未讀")');
await page.locator('button:has-text("未讀")').click();
await page.locator('button:has-text("提醒")').first().click();
await visible("提醒分類可點擊", 'button:has-text("提醒")');
await page.locator('button:has-text("全部對話")').click();
await visible("全部對話可返回", 'button:has-text("全部對話")');
await page.locator('button[title="提醒"]').click();
await visible("提醒選單：20 分鐘", 'button:has-text("20 分鐘")');
await page.locator('button:has-text("20 分鐘")').click();
await visible("建立提醒後左側提醒", 'button:has-text("提醒")');
await page.locator('button:has-text("全部對話")').click();
await page.getByTitle("收藏").click();
await visible("收藏功能可寫入並顯示", 'button:has-text("收藏")');
await page.locator('button:has-text("收藏")').click();
await visible("收藏分類可篩選", 'button:has-text("收藏")');
await page.locator('button:has-text("全部對話")').click();
await page.locator('button:has-text("加入熱門")').click();
await visible("熱門名單可加入", 'button:has-text("熱門名單")');
await page.locator('button:has-text("熱門名單")').click();
await visible("熱門名單分類可篩選", 'button:has-text("熱門名單")');
await page.locator('button:has-text("全部對話")').click();
await page.locator('button:has-text("加入夥伴")').click();
await visible("合作夥伴可加入", 'button:has-text("合作夥伴")');
await page.locator('button:has-text("合作夥伴")').click();
await visible("合作夥伴分類可篩選", 'button:has-text("合作夥伴")');
await page.locator('button:has-text("全部對話")').click();
const assignSelect = page.locator('select[aria-label="指派對象"]');
const optionCount = await assignSelect.locator("option").count();
checks.push({ label: "團隊指派選單有成員", ok: optionCount > 1 });
if (optionCount > 1) {
  const memberValue = await assignSelect.locator("option").nth(1).getAttribute("value");
  await assignSelect.selectOption(memberValue || "");
  await visible("指派給我分類可顯示", 'button:has-text("指派給我")');
  await page.locator('button:has-text("指派給我")').click();
}
await page.locator('button:has-text("備註")').click();
await page.locator("textarea").fill("內部測試備註");
const noteDisabled = await page.locator('button:has-text("傳送到 Instagram")').isDisabled();
checks.push({ label: "備註分頁會停用 Instagram 傳送", ok: noteDisabled });
await page.locator('button:has-text("回覆")').click();
await page.locator("textarea").fill("Inbox UI 測試訊息");
const replyEnabled = !(await page.locator('button:has-text("傳送到 Instagram")').isDisabled());
checks.push({ label: "回覆分頁輸入文字後可按傳送", ok: replyEnabled });

const bodyText = await page.locator("body").innerText();
const forbidden = ["All chats", "Open Chats", "Send To Instagram", "Contact Tags", "System Fields", "Reply here"].filter((text) =>
  bodyText.includes(text),
);
checks.push({ label: "Inbox 主要 UI 無指定英文殘留", ok: forbidden.length === 0, details: forbidden });

await page.screenshot({ path: path.join(outDir, "manychat-inbox-zh-interactions.png"), fullPage: true });
fs.writeFileSync(
  path.join(outDir, "manychat-inbox-zh-test-results.json"),
  JSON.stringify({ url: page.url(), checks, consoleErrors }, null, 2),
  "utf8",
);

await browser.close();

const failed = checks.filter((item) => !item.ok);
console.log(JSON.stringify({ failed, total: checks.length, consoleErrors }, null, 2));
if (failed.length) process.exitCode = 1;
