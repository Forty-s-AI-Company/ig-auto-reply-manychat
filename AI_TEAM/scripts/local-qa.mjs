import net from "node:net";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadProjectEnv } from "../../scripts/load-env.mjs";
import { readFileSafe, runtimeFiles, trackedFiles, writeRuntimeFile } from "./lib/ai-team-paths.mjs";

loadProjectEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..", "..");
const productionSupabaseProjectRef = "lmwvzskffzozuiamjxvc";

const args = new Set(process.argv.slice(2));
const skipBuild = args.has("--skip-build");
const skipTests = args.has("--skip-tests");
const strictTests = args.has("--strict-tests");
const skipBrowserQa = args.has("--skip-browser-qa");
const browserQaOnly = args.has("--browser-qa-only");
const strictBrowserQa = args.has("--strict-browser-qa");

const results = [];
const diagnostics = [];
let hasHardFailure = false;

function pushResult(name, status, details) {
  results.push({ name, status, details });
  if (status === "FAIL") {
    hasHardFailure = true;
  }
}

function print(message) {
  process.stdout.write(`${message}\n`);
}

function recordDiagnostic(title, details) {
  diagnostics.push({ title, details });
}

function run(command, commandArgs, options = {}) {
  return new Promise((resolve) => {
    const child =
      process.platform === "win32" && command === "npm"
        ? spawn("cmd.exe", ["/d", "/s", "/c", `${command} ${commandArgs.join(" ")}`], {
            cwd: root,
            stdio: "inherit",
            env: process.env,
            ...options,
          })
        : spawn(command, commandArgs, {
            cwd: root,
            stdio: "inherit",
            env: process.env,
            ...options,
          });

    child.on("exit", (code) => {
      resolve(code ?? 1);
    });

    child.on("error", () => {
      resolve(1);
    });
  });
}

function runCapture(command, commandArgs, timeoutMs = 8000, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, commandArgs, {
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
      ...options,
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
      stdout += chunk.toString();
    });

    child.stderr?.on("data", (chunk) => {
      stderr += chunk.toString();
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
  });
}

function getTestDatabaseGuard(env = process.env) {
  const testDatabaseUrl = env.TEST_DATABASE_URL?.trim() || "";

  if (!testDatabaseUrl) {
    return {
      shouldSkip: true,
      hardFail: false,
      reason: "未設定 TEST_DATABASE_URL，跳過需要資料庫的測試。",
    };
  }

  const usesProductionDatabase =
    env.INBOXPILOT_DB_ENV === "production" || testDatabaseUrl.includes(productionSupabaseProjectRef);

  if (usesProductionDatabase) {
    return {
      shouldSkip: true,
      hardFail: true,
      reason: "TEST_DATABASE_URL 指向 production database，拒絕執行測試。",
    };
  }

  return {
    shouldSkip: false,
    hardFail: false,
    reason: "TEST_DATABASE_URL 可用，允許測試。",
  };
}

function checkTcpReachable(connectionUrl, timeoutMs = 3000) {
  return new Promise((resolve) => {
    try {
      const url = new URL(connectionUrl);
      const port = Number(url.port || 5432);
      const socket = net.createConnection({
        host: url.hostname,
        port,
      });

      let settled = false;
      const finish = (reachable, reason) => {
        if (settled) return;
        settled = true;
        socket.destroy();
        resolve({ reachable, reason });
      };

      socket.setTimeout(timeoutMs);
      socket.on("connect", () => finish(true, `TCP ${url.hostname}:${port} 可連線。`));
      socket.on("timeout", () => finish(false, `TCP ${url.hostname}:${port} 連線逾時。`));
      socket.on("error", (error) => finish(false, `TCP ${url.hostname}:${port} 無法連線：${error.message}`));
    } catch (error) {
      resolve({
        reachable: false,
        reason: `TEST_DATABASE_URL 格式無法解析：${error instanceof Error ? error.message : String(error)}`,
      });
    }
  });
}

function buildBrowserQaPrompt() {
  const basePrompt = readFileSafe(path.join(root, "AI_TEAM", "scripts", "browser-qa-prompt.md")).trim();
  const currentTask = readFileSafe(trackedFiles.currentTask).trim();
  const backlog = readFileSafe(trackedFiles.backlog).trim();
  const qaReport = readFileSafe(runtimeFiles.qaReport).trim();

  return [
    basePrompt || "請只做 Browser QA，不要修改原始碼。",
    "",
    "補充上下文：",
    `- 專案路徑：${root}`,
    `- 目前任務：${currentTask || "（空）"}`,
    "- 若本機開發站不可用，可退回檢查已部署頁面與目前文件，但必須明確註記哪些流程無法實測。",
    "- 請不要碰 production DB、不要送 Meta App Review、不要切 PayUNI production。",
    "",
    "目前 QA 狀態：",
    qaReport || "（尚未有 QA 報告）",
    "",
    "Backlog 摘要：",
    backlog || "（空）",
    "",
    "請輸出繁體中文 Markdown，至少包含：",
    "1. QA 模式與目標頁面",
    "2. 實際驗證到的流程",
    "3. 發現的問題",
    "4. 建議下一步",
  ].join("\n");
}

async function runBrowserQa() {
  const agyHelp = await runCapture("agy", ["--help"], 10000);
  if (agyHelp.code !== 0) {
    writeRuntimeFile(
      runtimeFiles.browserQaReport,
      [
        "# Browser QA",
        "",
        "- STATUS: WARN",
        "- REASON: 找不到 `agy` 或無法執行 `agy --help`。",
      ].join("\n"),
    );
    return { status: strictBrowserQa ? "FAIL" : "WARN", details: "agy unavailable" };
  }

  const prompt = buildBrowserQaPrompt();
  const preferredModels = [
    process.env.AI_TEAM_BROWSER_QA_MODEL?.trim(),
    "Gemini 3.5 Flash (High)",
    "Gemini 3.5 Flash (Medium)",
  ].filter(Boolean);

  let lastResult = null;

  for (const model of preferredModels) {
    const result = await runCapture(
      "agy",
      [
        "--add-dir",
        root,
        "--dangerously-skip-permissions",
        "--model",
        model,
        "--print",
        prompt,
      ],
      Number(process.env.AI_TEAM_BROWSER_QA_TIMEOUT_MS || 180000),
    );

    lastResult = { ...result, model };
    if (result.code === 0 && result.stdout.trim()) {
      writeRuntimeFile(runtimeFiles.browserQaReport, result.stdout.trim());
      return { status: "PASS", details: `agy ${model}` };
    }
  }

  writeRuntimeFile(
    runtimeFiles.browserQaReport,
    [
      "# Browser QA",
      "",
      `- STATUS: ${strictBrowserQa ? "FAIL" : "WARN"}`,
      `- REASON: agy 未成功產出 Browser QA 報告。`,
      `- LAST_MODEL: ${lastResult?.model || "unknown"}`,
      `- LAST_STDERR: ${(lastResult?.stderr || "").trim() || "（空）"}`,
    ].join("\n"),
  );

  return {
    status: strictBrowserQa ? "FAIL" : "WARN",
    details: `agy failed${lastResult?.model ? ` (${lastResult.model})` : ""}`,
  };
}

function renderReport() {
  const lines = [
    "# QA Report",
    "",
    "## QA 模式",
    "",
    "- QA_MODE=AI_TEAM_LOCAL_QA",
    "",
    "## 驗證範圍",
    "",
    "- AI_TEAM 入口腳本",
    "- lint / test / build gate",
    "- 非 production 測試資料庫 preflight",
    "- Antigravity CLI Browser QA",
    "",
    "## 結果",
    "",
    ...results.map((result) => `- \`${result.name}\`：${result.status}，${result.details}`),
    "",
    "## 阻塞",
    "",
  ];

  const blockers = results.filter((result) => result.status === "FAIL" || result.status === "WARN");
  if (blockers.length === 0) {
    lines.push("- 無。");
  } else {
    for (const blocker of blockers) {
      lines.push(`- \`${blocker.name}\`：${blocker.details}`);
    }
  }

  lines.push("", "## 診斷", "");

  if (diagnostics.length === 0) {
    lines.push("- 無額外診斷。");
  } else {
    for (const diagnostic of diagnostics) {
      lines.push(`- **${diagnostic.title}**：${diagnostic.details}`);
    }
  }

  writeRuntimeFile(runtimeFiles.qaReport, lines.join("\n"));
}

async function diagnoseLocalTestInfra() {
  const supabaseResult = await runCapture("supabase", ["status"], 12000);
  if (supabaseResult.code === 0) {
    recordDiagnostic("Supabase CLI", "`supabase status` 正常，可使用本機 Supabase。");
  } else {
    const summary = [supabaseResult.stderr.trim(), supabaseResult.stdout.trim()]
      .filter(Boolean)
      .join(" | ")
      .slice(0, 500);
    recordDiagnostic(
      "Supabase CLI",
      `\`supabase status\` 失敗。${summary || "無輸出。"} 建議先檢查 Docker Desktop / Supabase local stack。`,
    );
  }

  const dockerResult = await runCapture("docker", ["ps", "--format", "table {{.Names}}\t{{.Status}}"], 12000);
  if (dockerResult.code === 0) {
    const output = dockerResult.stdout.trim().replace(/\r?\n/g, " / ");
    recordDiagnostic("Docker", output || "`docker ps` 成功，但沒有容器。");
  } else {
    const summary = [dockerResult.stderr.trim(), dockerResult.stdout.trim()]
      .filter(Boolean)
      .join(" | ")
      .slice(0, 500);
    recordDiagnostic(
      "Docker",
      `\`docker ps\` 失敗。${summary || "無輸出。"} 建議先確認 Docker Desktop engine 是否正常。`,
    );
  }
}

async function main() {
  print("[AI_TEAM] 檢查 AI_TEAM 文件...");
  const checkExitCode = await run("node", ["AI_TEAM/scripts/ai-team.mjs", "check"]);
  if (checkExitCode !== 0) {
    pushResult("ai-team:check", "FAIL", "AI_TEAM 骨架缺檔。");
    renderReport();
    process.exit(1);
  }
  pushResult("ai-team:check", "PASS", "AI_TEAM 骨架完整。");

  if (!browserQaOnly) {
    print("[AI_TEAM] 執行 lint...");
    const lintExitCode = await run("npm", ["run", "lint"]);
    pushResult("npm run lint", lintExitCode === 0 ? "PASS" : "FAIL", lintExitCode === 0 ? "通過。" : "失敗。");

    if (!skipTests) {
      const guard = getTestDatabaseGuard();
      if (guard.hardFail) {
        pushResult("test-db-guard", "FAIL", guard.reason);
      } else if (guard.shouldSkip) {
        pushResult("test-db-guard", strictTests ? "FAIL" : "WARN", guard.reason);
        await diagnoseLocalTestInfra();
      } else {
        const connectivity = await checkTcpReachable(process.env.TEST_DATABASE_URL);
        if (!connectivity.reachable) {
          pushResult("test-db-connectivity", strictTests ? "FAIL" : "WARN", connectivity.reason);
          await diagnoseLocalTestInfra();
        } else {
          pushResult("test-db-connectivity", "PASS", connectivity.reason);
          print("[AI_TEAM] 執行測試...");
          const testExitCode = await run("npm", ["test"]);
          pushResult("npm test", testExitCode === 0 ? "PASS" : "FAIL", testExitCode === 0 ? "通過。" : "失敗。");
        }
      }
    } else {
      pushResult("npm test", "SKIP", "使用 --skip-tests 略過。");
    }

    if (!skipBuild) {
      print("[AI_TEAM] 執行 build...");
      const buildExitCode = await run("npm", ["run", "build"]);
      pushResult("npm run build", buildExitCode === 0 ? "PASS" : "FAIL", buildExitCode === 0 ? "通過。" : "失敗。");
    } else {
      pushResult("npm run build", "SKIP", "使用 --skip-build 略過。");
    }
  }

  if (!skipBrowserQa) {
    print("[AI_TEAM] 執行 Antigravity Browser QA...");
    const browserQa = await runBrowserQa();
    pushResult("agy browser qa", browserQa.status, browserQa.details);
  } else {
    pushResult("agy browser qa", "SKIP", "使用 --skip-browser-qa 略過。");
  }

  renderReport();

  const warningOnly = results.some((result) => result.status === "WARN");
  if (hasHardFailure) {
    print("[AI_TEAM] QA 完成：有失敗，請看 AI_TEAM/runtime/qa-report.md");
    process.exit(1);
  }

  if (warningOnly) {
    print("[AI_TEAM] QA 完成：有警告，但沒有 code failure。詳見 AI_TEAM/runtime/qa-report.md");
    process.exit(0);
  }

  print("[AI_TEAM] QA 完成：全部通過。");
}

await main();
