import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadProjectEnv } from "../../scripts/load-env.mjs";
import { buildSkillSummary, readFileSafe, readPreferred, root, runtimeFiles, trackedFiles, writeRuntimeFile } from "./lib/ai-team-paths.mjs";
import { acquireLock, releaseLock } from "./lib/process-lock.mjs";

loadProjectEnv();

const __filename = fileURLToPath(import.meta.url);
const CODEX_MODEL = process.env.AI_TEAM_CODEX_MODEL?.trim() || "gpt-5.4-mini";
const runnerMode = (process.env.AI_TEAM_MODE || process.env.AI_TEAM_RUNNER_MODE || "general").trim().toLowerCase();
const defaultCodexTimeoutMs = runnerMode === "sleep" ? 2 * 60 * 60 * 1000 : runnerMode === "advanced" ? 60 * 60 * 1000 : 30 * 60 * 1000;
const CODEX_TIMEOUT_MS = Number(process.env.AI_TEAM_CODEX_TIMEOUT_MS || defaultCodexTimeoutMs);
const PROMPT_ONLY = process.argv.includes("--prompt-only");
const SMOKE_ONLY = process.env.AI_TEAM_CODEX_SMOKE === "1";

const resolvedCodexCommand = process.env.AI_TEAM_CODEX_COMMAND?.trim() || "codex";
const MAX_CAPTURE_CHARS = Number(process.env.AI_TEAM_CODEX_CAPTURE_CHARS || 16000);

function quoteWindowsShellArg(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function buildSpawnSpec(command, args) {
  if (process.platform === "win32") {
    return {
      command: [command, ...args.map(quoteWindowsShellArg)].join(" "),
      args: [],
      shell: true,
    };
  }

  return { command, args, shell: false };
}

function runCapture(command, args, input, timeoutMs = CODEX_TIMEOUT_MS) {
  return new Promise((resolve) => {
    const spec = buildSpawnSpec(command, args);
    const child = spawn(spec.command, spec.args, {
      cwd: root,
      stdio: ["pipe", "pipe", "pipe"],
      env: process.env,
      shell: spec.shell,
    });

    let stdout = "";
    let stderr = "";
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill();
      resolve({
        code: 124,
        stdout,
        stderr: `${stderr}${stderr ? "\n" : ""}timeout after ${timeoutMs}ms`,
      });
    }, timeoutMs);

    child.stdout?.on("data", (chunk) => {
      const text = chunk.toString();
      stdout += text;
      process.stdout.write(text);
    });

    child.stderr?.on("data", (chunk) => {
      const text = chunk.toString();
      stderr += text;
      process.stderr.write(text);
    });

    child.on("error", (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({
        code: 1,
        stdout,
        stderr: `${stderr}${stderr ? "\n" : ""}${error.message}`,
      });
    });

    child.on("exit", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ code: code ?? 1, stdout, stderr });
    });

    if (input) {
      child.stdin?.write(input);
    }
    child.stdin?.end();
  });
}

function truncateMiddle(value, maxChars = MAX_CAPTURE_CHARS) {
  const text = String(value || "").trim();
  if (text.length <= maxChars) return text || "（空）";
  const half = Math.floor(maxChars / 2);
  return [
    text.slice(0, half),
    "",
    `...（中間已省略 ${text.length - maxChars} 個字元，避免 runtime report 爆量）...`,
    "",
    text.slice(-half),
  ].join("\n");
}

function buildFailureReport(result) {
  const isTimeout = result.code === 124;
  return [
    "# Codex Dev",
    "",
    `- STATUS: ${isTimeout ? "TIMEOUT" : "FAIL"}`,
    `- COMMAND: ${resolvedCodexCommand}`,
    `- MODEL: ${CODEX_MODEL}`,
    `- MODE: ${runnerMode}`,
    `- TIMEOUT_MS: ${CODEX_TIMEOUT_MS}`,
    `- EXIT_CODE: ${result.code}`,
    "",
    "## SUMMARY",
    isTimeout
      ? "Codex CLI 已成功啟動，但超過 AI_TEAM_CODEX_TIMEOUT_MS。請調高 timeout、縮小 current task，或改用 sleep mode 長跑。"
      : "Codex CLI 已啟動但回傳非 0 exit code。請優先看 STDERR 摘要。",
    "",
    "## STDERR_SUMMARY",
    "```text",
    truncateMiddle(result.stderr),
    "```",
    "",
    "## STDOUT_SUMMARY",
    "```text",
    truncateMiddle(result.stdout),
    "```",
  ].join("\n");
}

function buildPrompt() {
  const currentTask = readFileSafe(trackedFiles.currentTask).trim();
  const backlog = readFileSafe(trackedFiles.backlog).trim();
  const projectState = readFileSafe(trackedFiles.projectState).trim();
  const launchCriteria = readFileSafe(trackedFiles.launchCriteria).trim();
  const qaReport = readPreferred(runtimeFiles.qaReport, trackedFiles.qaReport);
  const browserQaReport = readPreferred(runtimeFiles.browserQaReport, trackedFiles.browserQaReport);
  const errorSummary = readFileSafe(runtimeFiles.errorSummary).trim();
  const staticQa = readFileSafe(runtimeFiles.staticQa).trim();
  const codeReview = readFileSafe(runtimeFiles.codeReview).trim();
  const skillSummary = buildSkillSummary(3);

  return [
    "請接續 InboxPilot / ReplyPilot 專案，直接執行當前最高優先且可安全處理的產品任務。",
    "",
    "執行規則：",
    "- 你是主開發代理，直接讀碼、修改、驗證、更新文件，並把這一輪收斂到可提交狀態。",
    "- 不要只寫下一步建議；若沒有人工阻塞，就直接完成一輪實作，並把成果一路送到 commit / push / PR / merge / deploy。",
    "- 優先修 visible-but-unusable 的產品功能，不要先做 deployment、migration、Vercel、CI 優化。",
    "- 小範圍修改，沿用既有架構，不做大重構。",
    "- 一般模式下，小功能只跑最小必要驗證；大功能或整組任務完成後再跑完整 QA。",
    "- 若暫時不能安全支援某功能，改成清楚 disabled UX，不要留下假按鈕。",
    "- 這是 AI_TEAM 的開發閉環，請真的動手改碼，不要停在報告層。",
    "- 當 lint / test / build / Browser QA 與 diff check 都通過，且沒有人工阻塞時，請自動完成 git add / commit / push / PR / merge，然後依目前部署規則推進 deployment。",
    "",
    "高級模式模型與 QA 分工：",
    "- 若本輪是大型功能重構、多檔案聯動修復、API / auth / tenant / data flow，建議 Codex CLI 使用 GPT-5.5，reasoning high。",
    "- 若本輪是一般產品修復或稍大功能閉環，建議 Codex CLI 使用 GPT-5.4，reasoning medium 到 high。",
    "- 若本輪只是文件、摘要、prompt 或 backlog 整理，建議 Codex CLI 使用 GPT-5.4 mini，reasoning medium。",
    "- 本地模型只負責摘要、review、錯誤分類、低風險建議與 deferred queue；不得主導高風險產品修改。",
    "- Antigravity CLI 只做 Browser QA；預設 Gemini 3.5 Flash，必要時才用 Gemini 3.5 Pro，不允許直接修改 source code。",
    "",
    "本地 skills：",
    "- 先依主題套用對應的 in-repo skills，不要跳過。",
    "- 產品決策用 `ui-ux-pro-max`。",
    "- 設計語言用 `design-md`。",
    "- UI 細修與完成度檢查用 `impeccable`。",
    "- 元件實作用 `shadcn`。",
    "- 上線前 UI 審查用 `web-design-guidelines`。",
    "- OAuth / billing / tenant / admin 等高風險區先過 `security-best-practices`。",
    "",
    "安全限制：",
    "- 不碰 production DB",
    "- 不跑 migration / db push",
    "- 不送 Meta App Review",
    "- 不切 PayUNI production",
    "- 不輸出 secret",
    "",
    "完成這一輪後必須更新：",
    "- AI_TEAM/tasks/current-task.md",
    "- AI_TEAM/tasks/backlog.md",
    "- AI_TEAM/reports/dev-report.md",
    "- AI_TEAM/reports/final-report.md",
    "- docs/codex-session-log.md",
    "- docs/fix-roadmap.md",
    "",
    "若本輪屬於大功能階段完成，也要補：",
    "- docs/project-launch-checklist.md",
    "- docs/product-readiness-review.md",
    "",
    "如果這輪已經安全可交付，請直接執行：",
    "- git add / commit",
    "- push",
    "- 開 PR",
    "- 若 CI 與 diff check 通過且沒有 review blocker，直接 merge",
    "- 若已經符合部署條件，直接推進 deployment",
    "",
    "目前上下文：",
    "",
    "## PROJECT_STATE",
    projectState || "（空）",
    "",
    "## LAUNCH_CRITERIA",
    launchCriteria || "（空）",
    "",
    "## CURRENT_TASK",
    currentTask || "（空）",
    "",
    "## BACKLOG",
    backlog || "（空）",
    "",
    "## QA_REPORT",
    qaReport || "（空）",
    "",
    "## BROWSER_QA_REPORT",
    browserQaReport || "（空）",
    "",
    "## ERROR_SUMMARY",
    errorSummary || "（空）",
    "",
    "## STATIC_QA",
    staticQa || "（空）",
    "",
    "## CODE_REVIEW",
    codeReview || "（空）",
    "",
    "## LOCAL_SKILLS",
    skillSummary || "（空）",
  ].join("\n");
}

export async function main() {
  const prompt = buildPrompt();
  writeRuntimeFile(runtimeFiles.codexPrompt, prompt);

  if (PROMPT_ONLY) {
    process.stdout.write(`${prompt}\n`);
    return 0;
  }

  if (SMOKE_ONLY) {
    const result = await runCapture(resolvedCodexCommand, ["--version"], "", 30 * 1000);
    writeRuntimeFile(
      runtimeFiles.codexLastMessage,
      [
        "# Codex Dev",
        "",
        `- STATUS: ${result.code === 0 ? "PASS" : "FAIL"}`,
        "- MODE: smoke",
        `- COMMAND: ${resolvedCodexCommand}`,
        `- EXIT_CODE: ${result.code}`,
        "",
        "## STDOUT",
        "```text",
        truncateMiddle(result.stdout, 4000),
        "```",
        "",
        "## STDERR",
        "```text",
        truncateMiddle(result.stderr, 4000),
        "```",
      ].join("\n"),
    );
    return result.code;
  }

  const lock = acquireLock(runtimeFiles.codexLock, { command: resolvedCodexCommand, model: CODEX_MODEL, mode: runnerMode }, CODEX_TIMEOUT_MS + 5 * 60 * 1000);
  if (!lock.ok) {
    const reason = `${lock.reason}${lock.existing?.pid ? ` pid=${lock.existing.pid}` : ""}`;
    writeRuntimeFile(
      runtimeFiles.codexLastMessage,
      [
        "# Codex Dev",
        "",
        "- STATUS: SKIP",
        `- REASON: ${reason}`,
      ].join("\n"),
    );
    process.stdout.write(`[AI_TEAM] Codex 開發步驟略過：${reason}\n`);
    return 0;
  }

  try {
  const result = await runCapture(
      resolvedCodexCommand,
      [
        "exec",
        "-C",
        root,
        "-m",
        CODEX_MODEL,
        "-s",
        "danger-full-access",
        "--dangerously-bypass-approvals-and-sandbox",
        "--color",
        "never",
        "--output-last-message",
        runtimeFiles.codexLastMessage,
        "-",
      ],
      prompt,
    );

    if (result.code !== 0) {
      writeRuntimeFile(runtimeFiles.codexLastMessage, buildFailureReport(result));
    }

    return result.code;
  } finally {
    releaseLock(runtimeFiles.codexLock);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  const code = await main();
  process.exit(code);
}
