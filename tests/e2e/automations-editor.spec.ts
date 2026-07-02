import { expect, test, type Page, type TestInfo } from "@playwright/test";
import dotenv from "dotenv";
import { getAuthenticatedRouteSmokeGuard } from "./authenticated-route-smoke-guard";

dotenv.config({ path: ".env", quiet: true });
dotenv.config({ path: ".env.local", override: true, quiet: true });

const loginRunId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

async function login(page: Page, testInfo: TestInfo, email: string, password: string) {
  const response = await page.request.post("/api/auth/login", {
    data: { email, password },
    headers: {
      origin: "http://127.0.0.1:3041",
      "x-forwarded-for": `automations-editor-smoke-${loginRunId}-${testInfo.project.name}-${testInfo.workerIndex}-${testInfo.retry}-${testInfo.testId}`,
    },
  });

  expect(response.ok(), `login failed with ${response.status()}: ${await response.text()}`).toBeTruthy();
}

test.describe("automations editor polish", () => {
  test.setTimeout(45_000);

  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD;
  const guard = getAuthenticatedRouteSmokeGuard();

  test.skip(!adminEmail || !adminPassword, "ADMIN_EMAIL and ADMIN_PASSWORD are required for automations editor smoke.");
  test.skip(guard.shouldSkip, guard.reason);

  test("loads the React Flow editor without style warnings", async ({ page }, testInfo) => {
    const consoleWarnings: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "warning") {
        consoleWarnings.push(message.text());
      }
    });

    await page.setViewportSize({ width: 1366, height: 768 });
    await login(page, testInfo, adminEmail, adminPassword);
    await page.goto("/automations", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "新增自動化" }).click();
    await page.getByRole("button", { name: "從空白開始" }).click();

    const canvas = page.getByTestId("automation-flow-canvas");
    await expect(canvas).toBeVisible();
    await expect(page.getByTestId("automation-canvas-editor-hint")).toBeVisible();
    await expect(page.getByTestId("flow-auto-arrange")).toBeVisible();

    const paneZIndex = await page.locator(".react-flow__pane").evaluate((element) => window.getComputedStyle(element).zIndex);
    expect(paneZIndex).toBe("1");

    const box = await canvas.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(320);
    expect(box?.height ?? 0).toBeGreaterThan(420);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);

    const styleWarnings = consoleWarnings.filter((warning) => warning.includes("haven't loaded the styles"));
    expect(styleWarnings).toEqual([]);
  });
});
