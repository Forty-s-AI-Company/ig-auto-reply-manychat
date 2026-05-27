import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const outputDir = path.resolve("docs/assets/manychat-account-connection");
const chromePath = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const notes = [];

async function ensureDir() {
  await fs.mkdir(outputDir, { recursive: true });
}

async function shot(page, name, title) {
  const file = path.join(outputDir, name);
  await page.screenshot({ path: file, fullPage: true });
  notes.push({
    title,
    file: `docs/assets/manychat-account-connection/${name}`,
    url: page.url(),
  });
}

async function clickText(page, patterns, timeout = 5000) {
  for (const pattern of patterns) {
    const locator = page.getByText(pattern, { exact: false }).first();
    try {
      await locator.waitFor({ state: "visible", timeout });
      await locator.click();
      return true;
    } catch {
      // Try the next label.
    }
  }
  return false;
}

async function clickRoleButton(page, patterns, timeout = 5000) {
  for (const pattern of patterns) {
    const locator = page.getByRole("button", { name: pattern }).first();
    try {
      await locator.waitFor({ state: "visible", timeout });
      await locator.click();
      return true;
    } catch {
      // Try the next label.
    }
  }
  return false;
}

async function main() {
  await ensureDir();
  const userDataDir = path.resolve(".manychat-browser-profile");
  const context = await chromium.launchPersistentContext(userDataDir, {
    executablePath: chromePath,
    headless: false,
    viewport: { width: 1440, height: 1000 },
    locale: "zh-TW",
  });

  const page = context.pages()[0] || (await context.newPage());
  page.setDefaultTimeout(8000);

  try {
    await page.goto("https://app.manychat.com/", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
    await shot(page, "01-manychat-entry.png", "ManyChat 入口頁");

    const looksLoggedOut =
      /login|signin|sign-in|auth/i.test(page.url()) ||
      (await page.getByText(/Log in|Sign in|登入|登录/i).first().isVisible().catch(() => false));
    if (looksLoggedOut) {
      notes.push({
        title: "登入狀態",
        file: "",
        url: page.url(),
        note: "自動化 Chrome 沒有沿用使用者 in-app browser 的 ManyChat 登入狀態，因此只能記錄到登入牆。",
      });
    }

    await page.mouse.click(96, 44);
    await page.waitForTimeout(1200);
    await shot(page, "02-account-dropdown-attempt.png", "左上角帳號下拉選單");

    const clickedNewAccount = await clickText(page, [
      /\+\s*New Account/i,
      /New Account/i,
      /新增帳號/,
      /新帳號/,
    ]);
    if (clickedNewAccount) {
      await page.waitForLoadState("domcontentloaded", { timeout: 30000 }).catch(() => {});
      await page.waitForTimeout(1500);
    } else {
      await page.goto("https://app.manychat.com/registration/channelConnection", {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
    }
    await shot(page, "03-channel-connection.png", "New Account 頻道連結頁");

    const clickedInstagram = await clickText(page, [/Instagram/i], 5000);
    if (clickedInstagram) {
      await page.waitForLoadState("domcontentloaded", { timeout: 30000 }).catch(() => {});
      await page.waitForTimeout(1500);
    } else {
      await page.goto("https://app.manychat.com/registration/channelConnection/instagram", {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
    }
    await shot(page, "04-instagram-channel.png", "Instagram 頻道連結頁");

    const popupPromise = page.waitForEvent("popup", { timeout: 20000 }).catch(() => null);
    const clickedMeta =
      (await clickRoleButton(page, [/Connect via Meta/i, /Meta/i, /連結.*Meta/, /透過.*Meta/], 5000)) ||
      (await clickText(page, [/Connect via Meta/i, /Meta/i, /連結.*Meta/, /透過.*Meta/], 5000));
    await page.waitForTimeout(2000);
    await shot(page, "05-connect-via-meta-clicked.png", "點擊 Connect via Meta 後");

    const popup = await popupPromise;
    if (popup) {
      await popup.waitForLoadState("domcontentloaded", { timeout: 30000 }).catch(() => {});
      await popup.waitForTimeout(2500);
      await shot(popup, "06-meta-login-popup.png", "Meta 登入視窗");
      const clickedInstagramLogin =
        (await clickRoleButton(popup, [/Instagram/i, /用 Instagram 登入/, /Continue with Instagram/i], 5000)) ||
        (await clickText(popup, [/用 Instagram 登入/, /Log in with Instagram/i, /Continue with Instagram/i, /Instagram/], 5000));
      if (clickedInstagramLogin) {
        await popup.waitForLoadState("domcontentloaded", { timeout: 30000 }).catch(() => {});
        await popup.waitForTimeout(2000);
      }
      await shot(popup, "07-instagram-login-selected.png", "點擊用 Instagram 登入後");
    } else {
      notes.push({
        title: "Meta popup",
        file: "",
        url: page.url(),
        note: clickedMeta
          ? "已點擊 Connect via Meta，但沒有偵測到新視窗，可能被登入狀態、popup blocker 或頁面權限阻擋。"
          : "沒有找到 Connect via Meta 按鈕，可能停在登入牆或 ManyChat UI 已變更。",
      });
    }
  } finally {
    await fs.writeFile(
      path.join(outputDir, "capture-result.json"),
      JSON.stringify({ capturedAt: new Date().toISOString(), notes }, null, 2),
    );
    await context.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
