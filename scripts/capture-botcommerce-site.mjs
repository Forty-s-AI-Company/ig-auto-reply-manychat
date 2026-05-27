import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const assetsDir = path.join(root, "docs", "assets", "botcommerce");
const screenshotDir = path.join(assetsDir, "screenshots");
const videoDir = path.join(assetsDir, "videos");
const docPath = path.join(root, "docs", "botcommerce-site-notes.md");
const targetUrl =
  "https://botcommerce.app/lifetime-deal/?fbclid=IwYW9leASBwHJleHRuA2FlbQEwAGFkaWQBqzfNoApq8HNydGMGYXBwX2lkCjY2Mjg1NjgzNzkAAR6GBts6o9KBjJUa7wptpqwRfqAgrqEhUjBvABXx2PCfl1mlwPlqP-AXfLuvTw_aem_uoa8Kbl8yBFVuKVfCApVLw&utm_medium=paid&utm_source=fb&utm_id=120246387805590768&utm_content=120246432334920768&utm_term=120246432334940768&utm_campaign=120246387805590768";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function assertInside(parent, child) {
  const rel = path.relative(parent, child);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error(`Refusing to write outside ${parent}: ${child}`);
  }
}

function slugify(input) {
  return (
    String(input)
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 70) || "item"
  );
}

function trimText(input, limit = 900) {
  const text = String(input || "").replace(/\s+/g, " ").trim();
  return text.length <= limit ? text : `${text.slice(0, limit - 1)}…`;
}

function mdEscape(input) {
  return String(input || "").replace(/\|/g, "\\|").replace(/\n/g, "<br>");
}

async function getJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.json();
}

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let nextId = 1;
    const pending = new Map();

    ws.addEventListener("open", () => {
      resolve({
        send(method, params = {}) {
          const id = nextId++;
          return new Promise((res, rej) => {
            pending.set(id, { res, rej, method });
            ws.send(JSON.stringify({ id, method, params }));
          });
        },
        close() {
          ws.close();
        },
      });
    });

    ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (!message.id || !pending.has(message.id)) return;
      const call = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) call.rej(new Error(`${call.method}: ${message.error.message}`));
      else call.res(message.result);
    });

    ws.addEventListener("error", reject);
  });
}

async function findOrOpenBotCommerceTab() {
  const list = await getJson("http://127.0.0.1:9222/json/list");
  const current = list.find((tab) => tab.type === "page" && /botcommerce/i.test(`${tab.title} ${tab.url}`));
  if (current) return current;

  const created = await getJson(`http://127.0.0.1:9222/json/new?${encodeURIComponent(targetUrl)}`, {
    method: "PUT",
  });
  return created;
}

async function main() {
  fs.mkdirSync(path.join(root, "docs"), { recursive: true });
  assertInside(path.join(root, "docs"), assetsDir);
  fs.rmSync(assetsDir, { recursive: true, force: true });
  fs.mkdirSync(screenshotDir, { recursive: true });
  fs.mkdirSync(videoDir, { recursive: true });

  const tab = await findOrOpenBotCommerceTab();
  const cdp = await connect(tab.webSocketDebuggerUrl);
  const send = cdp.send;
  const screenshots = [];

  async function evaluate(expression) {
    const result = await send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails) {
      const description = result.exceptionDetails.exception?.description || JSON.stringify(result.exceptionDetails);
      throw new Error(description);
    }
    return result.result.value;
  }

  async function screenshot(name, description) {
    await sleep(550);
    const result = await send("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
      captureBeyondViewport: false,
    });
    const filename = `${String(screenshots.length + 1).padStart(2, "0")}-${slugify(name)}.png`;
    const filePath = path.join(screenshotDir, filename);
    fs.writeFileSync(filePath, Buffer.from(result.data, "base64"));
    screenshots.push({ filename, description });
    return filename;
  }

  await send("Page.enable");
  await send("Runtime.enable");
  await send("DOM.enable");
  await send("Page.bringToFront");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await evaluate(`location.href.includes("botcommerce.app/lifetime-deal") ? true : (location.href = ${JSON.stringify(targetUrl)}, true)`);
  await sleep(2500);
  await evaluate(`window.scrollTo(0, 0)`);
  await sleep(1000);

  const base = await evaluate(`(() => {
    const norm = (value) => String(value || "").replace(/\\s+/g, " ").trim();
    return {
      title: document.title,
      url: location.href,
      scrollHeight: document.documentElement.scrollHeight,
      viewport: { width: innerWidth, height: innerHeight },
      headings: Array.from(document.querySelectorAll("h1,h2,h3")).map((el, index) => ({
        index,
        tag: el.tagName,
        text: norm(el.innerText),
        top: Math.round(el.getBoundingClientRect().top + scrollY),
      })).filter((item) => item.text),
      videos: Array.from(document.querySelectorAll("video")).map((video, index) => {
        const rect = video.getBoundingClientRect();
        const section = video.closest("section") || video.closest(".elementor-section") || video.parentElement;
        const heading = section?.querySelector("h1,h2,h3,h4,h5")?.innerText;
        return {
          index,
          src: video.currentSrc || video.src || "",
          duration: Number.isFinite(video.duration) ? Number(video.duration.toFixed(3)) : null,
          top: Math.round(rect.top + scrollY),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          sectionTitle: norm(heading),
          sectionText: norm(section?.innerText).slice(0, 900),
        };
      }),
      tabButtons: Array.from(document.querySelectorAll("button"))
        .map((el) => norm(el.innerText))
        .filter((text) => text && /Works|Burnout|Human|Learns|Infinite|Teamwork|Reengaging|Managing|Booking|Collecting|Replying|Support|Ecommerce|B2B|Automate|Agencies|Solopreneurs|High-Ticket/i.test(text)),
      faqTitles: Array.from(document.querySelectorAll(".pp-accordion-tab-title,[role='tab']"))
        .map((el) => norm(el.innerText))
        .filter((text) => text.endsWith("?")),
    };
  })()`);

  await screenshot("top-hero", "頁首 Hero、主 CTA、品牌與首屏版面");

  const scrollStep = Math.max(760, base.viewport.height - 180);
  const scrollPoints = [];
  for (let y = 0; y < base.scrollHeight; y += scrollStep) scrollPoints.push(y);
  scrollPoints.push(Math.max(0, base.scrollHeight - base.viewport.height));
  const uniqueScrollPoints = [...new Set(scrollPoints.map((point) => Math.round(point)))];
  for (const [index, y] of uniqueScrollPoints.entries()) {
    if (index % 2 !== 0 && index !== uniqueScrollPoints.length - 1) continue;
    await evaluate(`window.scrollTo(0, ${y})`);
    await sleep(900);
    await screenshot(`scroll-${index + 1}-${y}`, `逐段瀏覽截圖，scrollY=${y}`);
  }

  const playButtonRect = await evaluate(`(() => {
    const norm = (value) => String(value || "").replace(/\\s+/g, " ").trim();
    const el = Array.from(document.querySelectorAll("button,[role='button'],div,a,span"))
      .find((node) => norm(node.innerText || node.getAttribute("aria-label")) === "Play Video");
    if (!el) return null;
    el.scrollIntoView({ block: "center", inline: "center" });
    const rect = el.getBoundingClientRect();
    return { x: rect.x, y: rect.y, w: rect.width, h: rect.height };
  })()`);
  if (playButtonRect) {
    await screenshot("hero-play-video-before", "主視覺 Play Video 按鈕點擊前");
    await send("Input.dispatchMouseEvent", {
      type: "mousePressed",
      x: Math.round(playButtonRect.x + playButtonRect.w / 2),
      y: Math.round(playButtonRect.y + playButtonRect.h / 2),
      button: "left",
      clickCount: 1,
    });
    await send("Input.dispatchMouseEvent", {
      type: "mouseReleased",
      x: Math.round(playButtonRect.x + playButtonRect.w / 2),
      y: Math.round(playButtonRect.y + playButtonRect.h / 2),
      button: "left",
      clickCount: 1,
    });
    await sleep(1600);
    await screenshot("hero-play-video-after", "主視覺 Play Video 按鈕點擊後");
  }

  const videoRecords = [];
  for (const video of base.videos) {
    const fileName = `${String(video.index + 1).padStart(2, "0")}-${path.basename(new URL(video.src).pathname)}`;
    const localPath = path.join(videoDir, fileName);
    try {
      const response = await fetch(video.src);
      const arrayBuffer = await response.arrayBuffer();
      fs.writeFileSync(localPath, Buffer.from(arrayBuffer));
    } catch {
      // Keep going; the screenshot/frame records are still useful even if download fails.
    }

    await evaluate(`(() => {
      const video = document.querySelectorAll("video")[${video.index}];
      if (!video) return;
      video.scrollIntoView({ block: "center", inline: "center" });
    })()`);
    await sleep(750);

    const frameShots = [];
    const marks = [
      ["start", 0],
      ["middle", video.duration ? Math.max(0, video.duration / 2) : 1],
      ["end", video.duration ? Math.max(0, video.duration - 0.35) : 2],
    ];

    for (const [label, second] of marks) {
      await evaluate(`(async () => {
        const video = document.querySelectorAll("video")[${video.index}];
        if (!video) return;
        video.muted = true;
        const target = Math.min(Math.max(0, ${Number(second).toFixed(3)}), Number.isFinite(video.duration) ? Math.max(0, video.duration - 0.1) : ${Number(second).toFixed(3)});
        await new Promise((resolve) => {
          const done = () => {
            video.removeEventListener("seeked", done);
            resolve();
          };
          video.addEventListener("seeked", done, { once: true });
          video.currentTime = target;
          setTimeout(done, 1200);
        });
      })()`);
      frameShots.push(await screenshot(`video-${video.index + 1}-${label}`, `影片 ${video.index + 1} ${label} frame`));
    }

    const playState = await evaluate(`(async () => {
      const video = document.querySelectorAll("video")[${video.index}];
      if (!video) return { ok: false, reason: "missing" };
      video.muted = true;
      video.currentTime = 0;
      try {
        await video.play();
        return { ok: true, duration: Number.isFinite(video.duration) ? Number(video.duration.toFixed(3)) : null };
      } catch (error) {
        return { ok: false, reason: error.message };
      }
    })()`);
    await sleep(Math.min(26000, Math.max(2500, ((playState.duration || video.duration || 4) + 0.6) * 1000)));
    const afterPlay = await screenshot(`video-${video.index + 1}-played`, `影片 ${video.index + 1} 播放完成停留畫面`);

    videoRecords.push({
      ...video,
      localFile: fs.existsSync(localPath) ? `./assets/botcommerce/videos/${fileName}` : "",
      frameShots,
      afterPlay,
      playState,
    });
  }

  const tabRecords = [];
  for (const title of base.tabButtons) {
    await evaluate(`(() => {
      const norm = (value) => String(value || "").replace(/\\s+/g, " ").trim();
      const button = Array.from(document.querySelectorAll("button")).find((el) => norm(el.innerText) === ${JSON.stringify(title)});
      if (!button) return;
      button.scrollIntoView({ block: "center", inline: "center" });
      button.click();
    })()`);
    await sleep(700);
    const context = await evaluate(`(() => {
      const norm = (value) => String(value || "").replace(/\\s+/g, " ").trim();
      const button = Array.from(document.querySelectorAll("button")).find((el) => norm(el.innerText) === ${JSON.stringify(title)});
      const section = button?.closest("section") || button?.closest(".elementor-section") || button?.parentElement;
      return norm(section?.innerText).slice(0, 1400);
    })()`);
    const shot = await screenshot(`tab-${title}`, `功能 tab 點擊：${title}`);
    tabRecords.push({ title, context, shot });
  }

  const faqRecords = [];
  for (const question of base.faqTitles) {
    const faq = await evaluate(`(() => {
      const norm = (value) => String(value || "").replace(/\\s+/g, " ").trim();
      const title = Array.from(document.querySelectorAll(".pp-accordion-tab-title,[role='tab']"))
        .find((el) => norm(el.innerText) === ${JSON.stringify(question)});
      if (!title) return null;
      title.scrollIntoView({ block: "center", inline: "center" });
      title.click();
      const content = title.nextElementSibling || title.parentElement?.querySelector(".pp-accordion-tab-content,[role='tabpanel']");
      return {
        question: ${JSON.stringify(question)},
        answer: norm(content?.innerText),
      };
    })()`);
    await sleep(650);
    const shot = await screenshot(`faq-${question}`, `FAQ 展開：${question}`);
    if (faq) faqRecords.push({ ...faq, shot });
  }

  const finalData = await evaluate(`(() => {
    const norm = (value) => String(value || "").replace(/\\s+/g, " ").trim();
    const headings = Array.from(document.querySelectorAll("h1,h2,h3"));
    return {
      title: document.title,
      url: location.href,
      sections: headings.map((heading, index) => {
        const top = heading.getBoundingClientRect().top + scrollY;
        const next = headings[index + 1];
        const nextTop = next ? next.getBoundingClientRect().top + scrollY : document.documentElement.scrollHeight;
        const parts = Array.from(document.querySelectorAll("p,li,h4,h5,h6,span,a,td,th"))
          .filter((el) => {
            const text = norm(el.innerText || el.textContent);
            if (!text) return false;
            const y = el.getBoundingClientRect().top + scrollY;
            return y >= top && y < nextTop;
          })
          .map((el) => norm(el.innerText || el.textContent))
          .filter(Boolean);
        return {
          title: norm(heading.innerText),
          text: Array.from(new Set(parts)).join(" | ").slice(0, 2200),
        };
      }),
      bodyText: document.body.innerText,
      links: Array.from(document.querySelectorAll("a[href]")).map((a) => ({
        text: norm(a.innerText),
        href: a.href,
      })).filter((item) => item.text || item.href).slice(0, 120),
    };
  })()`);

  await evaluate(`window.scrollTo(0, document.documentElement.scrollHeight)`);
  await screenshot("bottom-final-cta", "頁尾與最後 CTA");

  const importantSections = finalData.sections
    .filter((section) =>
      /Turn|See BotCommerce|Start Automating|Trusted|Powerful|Connect|Extra|Everything|Why|ManyChat|Pricing|Frequently/i.test(
        section.title,
      ),
    )
    .map((section) => `### ${section.title}\n${trimText(section.text, 1100) || "_此區主要為視覺或 CTA。_"}\n`)
    .join("\n");

  const videoRows = videoRecords
    .map(
      (video) =>
        `| ${video.index + 1} | ${mdEscape(path.basename(video.src))} | ${video.duration ?? "未知"} | ${mdEscape(video.sectionTitle || "未命名區塊")} | ${video.localFile ? `[影片檔](${video.localFile})` : "下載失敗"} | ${video.frameShots.map((file) => `[${file}](./assets/botcommerce/screenshots/${file})`).join("<br>")} |`,
    )
    .join("\n");
  const tabRows = tabRecords
    .map((tab) => `| ${mdEscape(tab.title)} | ${mdEscape(trimText(tab.context, 420))} | [截圖](./assets/botcommerce/screenshots/${tab.shot}) |`)
    .join("\n");
  const faqRows = faqRecords
    .map((faq) => `| ${mdEscape(faq.question)} | ${mdEscape(trimText(faq.answer, 520))} | [截圖](./assets/botcommerce/screenshots/${faq.shot}) |`)
    .join("\n");
  const screenshotList = screenshots
    .map((shot) => `- ${shot.description}: [${shot.filename}](./assets/botcommerce/screenshots/${shot.filename})`)
    .join("\n");

  const doc = `# BotCommerce Lifetime Deal 重新紀錄

紀錄時間：${new Date().toISOString()}
來源頁面：${finalData.url}
頁面標題：${finalData.title}

## 這次重新紀錄的範圍

這份文件已覆寫舊版 BotCommerce 紀錄。這次直接接上使用者已開啟且已連線 Codex 的 Chrome 分頁，重新從頁首到頁尾手動式瀏覽：逐段滾動、截圖、點擊主視覺 Play Video、讀取頁面所有原生 WebM 影片、下載影片檔、擷取影片起始/中段/結尾畫面、逐一點擊功能 tab、逐一展開 FAQ。購買與付款 CTA 只記錄文案與畫面，不進入付款。

## 對目前 InboxPilot /official/v2 的坦白比較

目前 v2 只有「頁面結構順序」像 BotCommerce：都有 Hero、Demo、功能區、整合 icon、使用情境 tab、ManyChat 對比、價格 CTA、FAQ。  
但還不像的地方很明顯：BotCommerce 是大量實際產品影片和強銷售長頁堆疊，幾乎每一段都用影片或功能畫面證明；目前 v2 多數仍是手刻 UI mock，影片素材不足、方案卡不夠強、功能展示密度也不夠。下一步重構 v2 時應優先補實際畫面影片與更接近 BotCommerce 的長頁銷售節奏。

## 頁面結構與重點內容

${importantSections}
## 影片內容紀錄

頁面共偵測到 ${videoRecords.length} 個原生 WebM 影片，已下載影片檔並擷取起始、中段、結尾畫面。下表的「所在區塊」是影片附近的頁面區塊文字，用來判斷影片在說明哪個功能。

| # | 原始檔名 | 秒數 | 所在區塊 | 影片檔 | 影片畫面截圖 |
|---:|---|---:|---|---|---|
${videoRows}

## 功能 Tab 內容

| Tab | 點擊後區塊內容摘要 | 截圖 |
|---|---|---|
${tabRows}

## FAQ 內容

| 問題 | 回答摘要 | 截圖 |
|---|---|---|
${faqRows}

## BotCommerce 頁面設計拆解

- 版型是高密度長銷售頁，不是一般 SaaS 短首頁。
- 首屏直接用一次性優惠、倒數壓迫感、主 CTA 和影片引導。
- 中段大量放產品影片與功能說明，讓使用者一直看到「這不是空殼」。
- tab 區把「AI 能做什麼」、「適合哪些情境」、「適合哪些客群」拆成可互動內容。
- 方案卡與 ManyChat 比較非常直接，核心說服點是「不要為 contacts 持續加價」。
- FAQ 補足使用者付款前會擔心的限制：message credits、WhatsApp/AI 成本、是否 one-time、能否多帳號。

## 重構 InboxPilot v2 的方向

- v2 不能只像版型，要像 BotCommerce 那樣用影片證明功能。至少要有：新增 IG 帳號、留言關鍵字、Flow Builder、Inbox 接手、AI 設定 5 段短影片。
- Hero 應該有更強的產品畫面，不只文字與 mock card。
- Demo 區要從靜態卡片改成影片或動態 product walkthrough。
- Pricing CTA 要更像銷售頁：方案價值、包含項目、立即行動、風險消除。
- ManyChat 比較表要保留，但要補「我們已完成 / 開發中」避免過度承諾。
- FAQ 要明確寫 Instagram/Meta 限制，這是 InboxPilot 比 BotCommerce 更應該專業的地方。

## 截圖清單

${screenshotList}

## 連結摘要

${finalData.links
  .slice(0, 50)
  .map((link) => `- ${trimText(link.text || "(no text)", 100)}: ${link.href}`)
  .join("\n")}
`;

  fs.writeFileSync(docPath, doc, "utf8");
  cdp.close();

  console.log(
    JSON.stringify(
      {
        docPath,
        screenshots: screenshots.length,
        videos: videoRecords.length,
        tabs: tabRecords.length,
        faqs: faqRecords.length,
        videoDir,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
