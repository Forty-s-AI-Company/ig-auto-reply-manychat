import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const outputDir = path.resolve("docs/assets/manychat-account-connection");
const chromePath = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const userDataDir = path.resolve(".manychat-browser-profile");

async function shot(page, name) {
  await page.screenshot({ path: path.join(outputDir, name), fullPage: true });
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  const context = await chromium.launchPersistentContext(userDataDir, {
    executablePath: chromePath,
    headless: false,
    viewport: { width: 1440, height: 1000 },
    locale: "zh-TW",
  });
  const page = context.pages()[0] || (await context.newPage());
  page.setDefaultTimeout(12000);

  try {
    await page.goto("https://app.manychat.com/registration/channelConnection/instagram", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await page.waitForTimeout(2500);
    await shot(page, "04a-human-check-before-start.png");

    const startButton = page.getByText(/開始|Start/i).first();
    await startButton.click().catch(async () => {
      await page.mouse.click(720, 292);
    });
    await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(5000);
    await shot(page, "04b-human-check-after-start.png");

    const popupPromise = page.waitForEvent("popup", { timeout: 15000 }).catch(() => null);
    const connectButton = page.getByText(/Connect via Meta|Meta|連結.*Meta|透過.*Meta/i).first();
    await connectButton.click().catch(() => {});
    await page.waitForTimeout(2500);
    await shot(page, "05a-after-connect-meta-retry.png");

    const popup = await popupPromise;
    if (popup) {
      await popup.waitForLoadState("domcontentloaded", { timeout: 30000 }).catch(() => {});
      await popup.waitForTimeout(2500);
      await shot(popup, "06a-meta-popup-retry.png");
      await popup.getByText(/用 Instagram 登入|Log in with Instagram|Continue with Instagram|Instagram/i).first().click().catch(() => {});
      await popup.waitForTimeout(2500);
      await shot(popup, "07a-instagram-login-retry.png");
    }

    await fs.writeFile(
      path.join(outputDir, "continue-result.json"),
      JSON.stringify({ url: page.url(), capturedAt: new Date().toISOString() }, null, 2),
    );
  } finally {
    await context.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
