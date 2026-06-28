import net from "node:net";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { loadProjectEnv } from "../../scripts/load-env.mjs";

loadProjectEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..", "..");
const qaReportPath = path.join(root, "AI_TEAM", "reports", "qa-report.md");
const productionSupabaseProjectRef = "lmwvzskffzozuiamjxvc";

const args = new Set(process.argv.slice(2));
const skipBuild = args.has("--skip-build");
const skipTests = args.has("--skip-tests");
const strictTests = args.has("--strict-tests");

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

function run(command, commandArgs) {
  return new Promise((resolve) => {
    const child =
      process.platform === "win32" && command === "npm"
        ? spawn("cmd.exe", ["/d", "/s", "/c", `${command} ${commandArgs.join(" ")}`], {
            cwd: root,
            stdio: "inherit",
            env: process.env,
          })
        : spawn(command, commandArgs, {
            cwd: root,
            stdio: "inherit",
            env: process.env,
          });

    child.on("exit", (code) => {
      resolve(code ?? 1);
    });

    child.on("error", () => {
      resolve(1);
    });
  });
}

function runCapture(command, commandArgs, timeoutMs = 8000) {
  return new Promise((resolve) => {
    const child =
      process.platform === "win32" && command === "npm"
        ? spawn("cmd.exe", ["/d", "/s", "/c", `${command} ${commandArgs.join(" ")}`], {
            cwd: root,
            stdio: ["ignore", "pipe", "pipe"],
            env: process.env,
          })
        : spawn(command, commandArgs, {
            cwd: root,
            stdio: ["ignore", "pipe", "pipe"],
            env: process.env,
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

  fs.writeFileSync(qaReportPath, `${lines.join("\n")}\n`, "utf8");
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

  renderReport();

  const warningOnly = results.some((result) => result.status === "WARN");
  if (hasHardFailure) {
    print("[AI_TEAM] QA 完成：有失敗，請看 AI_TEAM/reports/qa-report.md");
    process.exit(1);
  }

  if (warningOnly) {
    print("[AI_TEAM] QA 完成：有警告，但沒有 code failure。詳見 AI_TEAM/reports/qa-report.md");
    process.exit(0);
  }

  print("[AI_TEAM] QA 完成：全部通過。");
}

await main();
