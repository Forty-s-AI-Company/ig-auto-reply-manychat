import { execFileSync, spawn } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  extractTopItems,
  readFileSafe,
  readPreferred,
  root,
  runtimeFiles,
  trackedFiles,
  writeRuntimeFile,
} from "./lib/ai-team-paths.mjs";
import { acquireLock, releaseLock } from "./lib/process-lock.mjs";

const intervalArg = process.argv.find((arg) => arg.startsWith("--interval="))?.split("=")[1];
const intervalInput = intervalArg === undefined ? 15 : Number.parseFloat(intervalArg);
const intervalMinutes = Number.isFinite(intervalInput) && intervalInput >= 0 ? intervalInput : 15;
const once = process.argv.includes("--once");
const alwaysRun = process.argv.includes("--always-run");
const noWait = process.argv.includes("--no-wait") || intervalMinutes === 0;
const smoke = process.argv.includes("--smoke") || process.env.AI_TEAM_PIPELINE_SMOKE === "1";
const requestedMode = process.argv.find((arg) => arg.startsWith("--mode="))?.split("=")[1]?.trim().toLowerCase() || "";
const runnerMode = requestedMode === "sleep" ? "sleep" : "general";
const qaLevel = (process.env.AI_TEAM_QA_LEVEL?.trim().toLowerCase() || (runnerMode === "sleep" ? "full" : "lite")) === "full" ? "full" : "lite";
const maxCyclesArg = process.argv.find((arg) => arg.startsWith("--cycles="))?.split("=")[1];
const parsedMaxCycles = maxCyclesArg ? Number.parseInt(maxCyclesArg, 10) : Number.POSITIVE_INFINITY;
const maxCycles = Number.isFinite(parsedMaxCycles) && parsedMaxCycles > 0 ? parsedMaxCycles : Number.POSITIVE_INFINITY;
const quiet = process.argv.includes("--quiet");

const WORKER_ORDER = [
  "planner",
  "codex-dev",
  "local-model-review",
  "qa",
  "browser-qa",
  "reporter",
  "git-delivery",
];

const requestedOnlyWorker = process.argv.find((arg) => arg.startsWith("--only-worker="))?.split("=")[1]?.trim() || process.env.AI_TEAM_ONLY_WORKER?.trim() || "";
const onlyWorker = WORKER_ORDER.includes(requestedOnlyWorker) ? requestedOnlyWorker : "";

const workerTimeoutMs = {
  planner: 30 * 1000,
  "codex-dev": runnerMode === "sleep" ? 2 * 60 * 60 * 1000 : 30 * 60 * 1000,
  "local-model-review": runnerMode === "sleep" ? 20 * 60 * 1000 : 6 * 60 * 1000,
  qa: runnerMode === "sleep" ? 45 * 60 * 1000 : 15 * 60 * 1000,
  "browser-qa": 10 * 60 * 1000,
  reporter: runnerMode === "sleep" ? 20 * 60 * 1000 : 6 * 60 * 1000,
  "git-delivery": 60 * 1000,
};

const filesToWatch = [
  trackedFiles.projectState,
  trackedFiles.launchCriteria,
  trackedFiles.currentTask,
  trackedFiles.backlog,
  trackedFiles.queue,
  runtimeFiles.finalReport,
  runtimeFiles.qaReport,
  runtimeFiles.browserQaReport,
  runtimeFiles.workerResult,
];

function nowIso() {
  return new Date().toISOString();
}

function nowLabel() {
  return new Intl.DateTimeFormat("zh-TW", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date());
}

function hashText(text) {
  return crypto.createHash("sha1").update(text).digest("hex");
}

function buildSnapshot() {
  return filesToWatch
    .map((filePath) => `${filePath}\n${hashText(readFileSafe(filePath))}`)
    .join("\n---\n");
}

function emit(block) {
  if (!quiet) {
    console.log(block);
  }
}

function appendLog(block) {
  const header = `\n\n---\n\n## ${nowLabel()}\n`;
  try {
    fs.appendFileSync(runtimeFiles.runnerLog, `${header}${block.trim()}\n`, "utf8");
  } catch (error) {
    const code = error instanceof Error && "code" in error ? error.code : "";
    if (code === "EBUSY" || code === "EPERM") return;
    throw error;
  }
}

function readJsonSafe(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function runGit(args) {
  try {
    return execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch (error) {
    return `git unavailable: ${error instanceof Error ? error.message : String(error)}`;
  }
}

function getGitHealth() {
  const branch = runGit(["branch", "--show-current"]) || "unknown";
  const status = runGit(["status", "--short"]);
  const dirtyCount = status.startsWith("git unavailable:") || !status ? 0 : status.split(/\r?\n/).filter(Boolean).length;
  const worktrees = runGit(["worktree", "list"]);
  const worktreeCount = worktrees.startsWith("git unavailable:") || !worktrees ? 0 : worktrees.split(/\r?\n/).filter(Boolean).length;

  return { branch, dirtyCount, worktreeCount };
}

function getQaHealth() {
  const qaReport = readPreferred(runtimeFiles.qaReport, trackedFiles.qaReport);
  if (!qaReport) return "unknown";
  if (qaReport.includes("：FAIL") || qaReport.includes(": FAIL")) return "FAIL";
  if (qaReport.includes("：WARN") || qaReport.includes(": WARN")) return "WARN";
  if (qaReport.includes("：PASS") || qaReport.includes(": PASS")) return "PASS";
  return "unknown";
}

function isQaPass(reportText = readPreferred(runtimeFiles.qaReport, trackedFiles.qaReport)) {
  const text = String(reportText || "");
  if (!text.trim()) return false;
  if (text.includes("：FAIL") || text.includes(": FAIL")) return false;
  return text.includes("：PASS") || text.includes(": PASS");
}

function parseGitStatus(output) {
  return String(output || "")
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .map((line) => {
      const code = line.slice(0, 2).trim() || "??";
      let filePath = line.slice(3).trim();
      if (filePath.includes(" -> ")) {
        filePath = filePath.split(" -> ").pop() || filePath;
      }
      return {
        code,
        path: filePath.replace(/\\/g, "/"),
      };
    });
}

function getGitStatusEntries() {
  try {
    const output = execFileSync("git", ["status", "--porcelain=v1", "--untracked-files=all"], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return {
      ok: true,
      entries: parseGitStatus(output),
    };
  } catch (error) {
    return {
      ok: false,
      entries: [],
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}

const excludedGitPathRules = [
  { test: (filePath) => filePath.startsWith("AI_TEAM/runtime/"), label: "runtime" },
  { test: (filePath) => filePath.startsWith("AI_TEAM/reports/"), label: "reports" },
  { test: (filePath) => filePath.startsWith("reports/"), label: "reports" },
  { test: (filePath) => filePath.startsWith("coverage/"), label: "cache" },
  { test: (filePath) => filePath.startsWith("playwright-report/"), label: "reports" },
  { test: (filePath) => filePath.startsWith("test-results/"), label: "reports" },
  { test: (filePath) => filePath.startsWith(".next/"), label: "cache" },
  { test: (filePath) => filePath.startsWith("node_modules/"), label: "cache" },
  { test: (filePath) => filePath.startsWith("supabase/.temp/"), label: "cache" },
  { test: (filePath) => filePath === ".env" || filePath.startsWith(".env."), label: "env" },
  { test: (filePath) => filePath === "__pycache__" || filePath.includes("/__pycache__/"), label: "cache" },
  { test: (filePath) => filePath.endsWith(".log"), label: "logs" },
];

const unsafeDeliveryBranches = new Set(["master", "main", "staging", "production", "prod", "release"]);

function sanitizeBranchSegment(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9/_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-/]+|[-/]+$/g, "")
    || "task";
}

function buildSafeBranchName(task) {
  const taskId = sanitizeBranchSegment(task?.id || "task");
  return `codex/${taskId}`;
}

function evaluateBranchSafety(branch) {
  const normalized = String(branch || "").trim();
  if (!normalized) {
    return {
      safe: false,
      reason: "目前 branch 為空，無法交付。",
    };
  }

  if (normalized === "HEAD") {
    return {
      safe: false,
      reason: "目前處於 detached HEAD，不允許 unattended git delivery。",
    };
  }

  if (unsafeDeliveryBranches.has(normalized)) {
    return {
      safe: false,
      reason: `目前 branch 為 ${normalized}，不允許直接在保護分支上 unattended commit。`,
    };
  }

  return {
    safe: true,
    reason: `branch ${normalized} 可進入交付 gate。`,
  };
}

function evaluateBranchPlan(branch, task, autoBranchEnabled) {
  const branchSafety = evaluateBranchSafety(branch);
  const safeBranchName = buildSafeBranchName(task);

  if (branchSafety.safe) {
    return {
      branchSafety,
      needsBranchSwitch: false,
      targetBranch: branch,
      summary: branchSafety.reason,
    };
  }

  if (!autoBranchEnabled) {
    return {
      branchSafety,
      needsBranchSwitch: false,
      targetBranch: branch,
      summary: `${branchSafety.reason} 且 AI_TEAM_GIT_AUTO_BRANCH 未啟用。`,
    };
  }

  return {
    branchSafety,
    needsBranchSwitch: true,
    targetBranch: safeBranchName,
    summary: `${branchSafety.reason} 將改用安全 branch：${safeBranchName}`,
  };
}

function buildPrMetadata(task, branch, validations = []) {
  const base = process.env.AI_TEAM_GIT_PR_BASE?.trim() || "master";
  const draft = process.env.AI_TEAM_GIT_PR_DRAFT !== "0";
  const title = process.env.AI_TEAM_GIT_PR_TITLE?.trim() || `AI_TEAM: ${task?.title || branch}`;
  const body = process.env.AI_TEAM_GIT_PR_BODY?.trim() || [
    "## Summary",
    `- task: ${task?.id || "unknown"}`,
    `- branch: ${branch}`,
    "",
    "## Validation",
    ...validations.map((item) => `- ${item}`),
    "",
    "## Delivery Notes",
    "- Production deploy 預設維持關閉。",
  ].join("\n");

  return { base, draft, title, body };
}

function classifyGitEntries(entries) {
  const committableFiles = [];
  const excludedFiles = [];

  for (const entry of entries) {
    const match = excludedGitPathRules.find((rule) => rule.test(entry.path));
    if (match) {
      excludedFiles.push({ ...entry, category: match.label });
    } else {
      committableFiles.push(entry);
    }
  }

  return { committableFiles, excludedFiles };
}

function evaluateGitDeliveryPolicy({
  enabled,
  qaPass,
  results,
  gitEntries,
  currentWorkerResult,
  loopState,
  branch,
  branchPlan,
  productionDeployEnabled = false,
}) {
  if (!enabled) {
    return {
      decision: "skipped",
      status: "skipped",
      summary: "Git delivery 未啟用；設定 AI_TEAM_ENABLE_GIT_DELIVERY=1 才會進入交付 gate。",
      validation: ["git-delivery-disabled"],
      committableFiles: [],
      excludedFiles: [],
      blockedReasons: [],
    };
  }

  const blockedReasons = [];
  const { committableFiles, excludedFiles } = classifyGitEntries(gitEntries);
  const failedWorkers = (results || []).filter((item) => ["failed", "blocked"].includes(item.status));
  if (!qaPass) {
    blockedReasons.push("QA report 不是 PASS。");
  }

  if (branchPlan && !branchPlan.branchSafety.safe && !branchPlan.needsBranchSwitch) {
    blockedReasons.push(branchPlan.summary);
  }

  if (failedWorkers.length > 0) {
    blockedReasons.push(`存在失敗或阻塞 worker：${failedWorkers.map((item) => item.worker).join(", ")}`);
  }

  if (currentWorkerResult?.status && ["failed", "blocked"].includes(currentWorkerResult.status)) {
    blockedReasons.push(`上一個 worker-result 為 ${currentWorkerResult.status}。`);
  }

  if (loopState?.status && loopState.status === "failed") {
    blockedReasons.push("loop-state 顯示目前流程失敗。");
  }

  if (productionDeployEnabled) {
    blockedReasons.push("Production deploy 預設關閉，git-delivery 不處理 Production deployment。");
  }

  if (excludedFiles.length > 0) {
    blockedReasons.push(`git dirty files 混入應排除檔案：${excludedFiles.map((item) => item.path).join(", ")}`);
  }

  if (committableFiles.length === 0) {
    blockedReasons.push("沒有可提交檔案。");
  }

  if (blockedReasons.length > 0) {
    return {
      decision: "blocked",
      status: "blocked",
      summary: blockedReasons[0],
      validation: [...blockedReasons, branchPlan?.summary || ""].filter(Boolean),
      committableFiles,
      excludedFiles,
      blockedReasons,
    };
  }

  const effectiveBranch = branchPlan?.targetBranch || branch;
  const prMetadata = buildPrMetadata({ id: loopState?.currentTaskId, title: loopState?.currentTaskTitle }, effectiveBranch, [
    "qa-pass",
    "no-blocked-workers",
    "no-excluded-files",
    `committable=${committableFiles.length}`,
  ]);

  return {
    decision: "ready",
    status: "done",
    summary: `Git delivery policy 通過；可提交檔案 ${committableFiles.length} 個。`,
    validation: [
      "qa-pass",
      "no-blocked-workers",
      "no-excluded-files",
      `committable=${committableFiles.length}`,
      `branch=${effectiveBranch}`,
      `pr-base=${prMetadata.base}`,
      `pr-draft=${prMetadata.draft ? "true" : "false"}`,
    ],
    committableFiles,
    excludedFiles,
    blockedReasons: [],
    prMetadata,
    effectiveBranch,
  };
}

function buildHealthSummary(results = []) {
  const projectState = readFileSafe(trackedFiles.projectState);
  const currentTask = readFileSafe(trackedFiles.currentTask);
  const backlog = readFileSafe(trackedFiles.backlog);
  const finalReport = readPreferred(runtimeFiles.finalReport, trackedFiles.finalReport);
  const git = getGitHealth();
  const qaHealth = getQaHealth();

  return [
    `# AI_TEAM Runner @ ${nowLabel()}`,
    "",
    "## HEALTH",
    `- branch: ${git.branch}`,
    `- dirty files: ${git.dirtyCount}`,
    `- worktrees: ${git.worktreeCount}`,
    `- latest QA: ${qaHealth}`,
    `- local model mode: ${runnerMode}`,
    `- QA level: ${qaLevel}`,
    `- mode: ${once ? "once" : "loop"}`,
    `- smoke: ${smoke ? "true" : "false"}`,
    `- no-wait: ${noWait ? "true" : "false"}`,
    `- interval minutes: ${intervalMinutes}`,
    "",
    "## PROJECT_STATE",
    projectState.trim() || "（空）",
    "",
    "## CURRENT_TASK",
    currentTask.trim() || "（空）",
    "",
    "## BACKLOG",
    extractTopItems(backlog, 6).map((item) => `- ${item}`).join("\n") || "（空）",
    "",
    "## FINAL_REPORT",
    extractTopItems(finalReport, 6).map((item) => `- ${item}`).join("\n") || "（空）",
    "",
    "## WORKER_RESULTS",
    results.map((result) => `- ${result.worker}: ${result.status} - ${result.summary}`).join("\n") || "（空）",
  ].join("\n");
}

function getSpawnSpec(command, commandArgs) {
  if (process.platform === "win32" && (command === "npm" || command === "npx")) {
    return {
      command: "cmd.exe",
      args: ["/d", "/s", "/c", `${command} ${commandArgs.join(" ")}`],
    };
  }

  return { command, args: commandArgs };
}

function runCommand(command, commandArgs, timeoutMs, extraEnv = {}) {
  return new Promise((resolve) => {
    const spec = getSpawnSpec(command, commandArgs);
    const child = spawn(spec.command, spec.args, {
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        ...extraEnv,
        AI_TEAM_MODE: runnerMode,
        AI_TEAM_RUNNER_MODE: runnerMode,
      },
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
  });
}

async function commandExists(command) {
  const checker = process.platform === "win32" ? "where.exe" : "which";
  const result = await runCommand(checker, [command], 15 * 1000);
  return result.code === 0;
}

async function gitMutate(args, timeoutMs = 60 * 1000) {
  return runCommand("git", args, timeoutMs);
}

async function ghMutate(args, timeoutMs = 60 * 1000) {
  return runCommand("gh", args, timeoutMs);
}

async function ensureBranch(targetBranch) {
  const existing = runGit(["branch", "--list", targetBranch]);
  if (existing && !existing.startsWith("git unavailable:") && existing.trim()) {
    return gitMutate(["switch", targetBranch], 60 * 1000);
  }
  return gitMutate(["switch", "-c", targetBranch], 60 * 1000);
}

function summarizeOutput(result, maxChars = 1200) {
  const text = [result.stderr, result.stdout].filter(Boolean).join("\n").trim();
  if (!text) return "";
  return text.length <= maxChars ? text : text.slice(-maxChars);
}

function baseWorkerResult(worker, patch = {}) {
  return {
    status: "done",
    worker,
    summary: "",
    changedFiles: [],
    validation: [],
    next: null,
    startedAt: patch.startedAt || nowIso(),
    finishedAt: nowIso(),
    ...patch,
  };
}

function writeHeartbeat(worker, task, status = "running") {
  writeJson(runtimeFiles.heartbeat, {
    status,
    worker,
    taskId: task?.id || null,
    mode: runnerMode,
    smoke,
    updatedAt: nowIso(),
  });
}

function writeCurrentWorker(worker, task) {
  writeJson(runtimeFiles.currentWorker, {
    worker,
    taskId: task?.id || null,
    taskTitle: task?.title || null,
    mode: runnerMode,
    smoke,
    startedAt: nowIso(),
  });
}

function writeWorkerResult(result) {
  writeJson(runtimeFiles.workerResult, result);
  writeHeartbeat(result.worker, { id: result.taskId }, result.status);
  return result;
}

function writeLoopState(state) {
  writeJson(runtimeFiles.loopState, {
    mode: runnerMode,
    smoke,
    updatedAt: nowIso(),
    ...state,
  });
}

function loadQueue() {
  const fallback = { version: 1, updatedAt: nowIso(), tasks: [] };
  return readJsonSafe(trackedFiles.queue, fallback);
}

function selectTask(queue) {
  if (smoke) {
    return {
      id: "fake-ai-team-pipeline-smoke",
      title: "Fake AI_TEAM pipeline smoke task",
      status: "pending",
      priority: 0,
      lane: "runner-smoke",
      scope: ["AI_TEAM/scripts/ai-team-runner.mjs"],
      safety: ["no-production-db", "no-migration", "no-production-deploy"],
      acceptance: ["完整走過 planner -> codex-dev -> local-model-review -> qa -> browser-qa -> reporter -> git-delivery"],
    };
  }

  return [...(queue.tasks || [])]
    .sort((a, b) => Number(a.priority || 999) - Number(b.priority || 999))
    .find((task) => ["pending", "running"].includes(task.status));
}

async function plannerWorker() {
  const queue = loadQueue();
  const task = selectTask(queue);

  if (!task) {
    return writeWorkerResult(baseWorkerResult("planner", {
      status: "blocked",
      summary: "queue.json 沒有 pending / running task。",
      validation: ["queue checked"],
      next: null,
    }));
  }

  writeLoopState({
    status: "running",
    currentTaskId: task.id,
    currentTaskTitle: task.title,
    workerOrder: WORKER_ORDER,
  });

  return writeWorkerResult(baseWorkerResult("planner", {
    summary: `選定任務：${task.title}`,
    taskId: task.id,
    validation: [`queue task ${task.id}`],
    next: "codex-dev",
  }));
}

async function codexWorker(task) {
  const env = smoke ? { AI_TEAM_CODEX_SMOKE: "1" } : {};
  const result = await runCommand("node", ["AI_TEAM/scripts/codex-dev.mjs"], workerTimeoutMs["codex-dev"], env);
  const status = result.code === 0 ? "done" : result.code === 124 ? "failed" : "failed";

  return writeWorkerResult(baseWorkerResult("codex-dev", {
    status,
    taskId: task.id,
    summary: result.code === 0 ? "Codex dev worker 完成。" : `Codex dev worker 失敗：${summarizeOutput(result) || `exit ${result.code}`}`,
    validation: [`exit=${result.code}`],
    next: result.code === 0 ? "local-model-review" : "planner",
  }));
}

async function localModelReviewWorker(task) {
  if (smoke) {
    return writeWorkerResult(baseWorkerResult("local-model-review", {
      taskId: task.id,
      summary: "Smoke mode 略過實際 Ollama review，但確認 worker result schema。",
      validation: ["smoke-skip"],
      next: "qa",
    }));
  }

  const result = await runCommand(
    "node",
    ["AI_TEAM/scripts/local-models.mjs", `--mode=${runnerMode}`, "--only=error-summary,static-qa,code-review"],
    workerTimeoutMs["local-model-review"],
  );

  return writeWorkerResult(baseWorkerResult("local-model-review", {
    status: result.code === 0 ? "done" : "failed",
    taskId: task.id,
    summary: result.code === 0 ? "本地模型 review 完成。" : `本地模型 review 失敗：${summarizeOutput(result) || `exit ${result.code}`}`,
    validation: [`exit=${result.code}`],
    next: result.code === 0 ? "qa" : "planner",
  }));
}

async function qaWorker(task) {
  const args = ["AI_TEAM/scripts/local-qa.mjs", `--level=${qaLevel}`];
  if (smoke) {
    args.push("--skip-tests", "--skip-build", "--skip-browser-qa");
  }

  const result = await runCommand("node", args, workerTimeoutMs.qa);

  return writeWorkerResult(baseWorkerResult("qa", {
    status: result.code === 0 ? "done" : "failed",
    taskId: task.id,
    summary: result.code === 0 ? "QA worker 完成。" : `QA worker 失敗：${summarizeOutput(result) || `exit ${result.code}`}`,
    validation: [`exit=${result.code}`, smoke ? "smoke-skip-heavy-qa" : `qa-level=${qaLevel}`],
    next: result.code === 0 ? "browser-qa" : "planner",
  }));
}

async function browserQaWorker(task) {
  if (runnerMode === "general" || smoke) {
    return writeWorkerResult(baseWorkerResult("browser-qa", {
      status: smoke ? "done" : "skipped",
      taskId: task.id,
      summary: smoke
        ? "Smoke mode 確認 browser-qa worker 可產出 structured result。"
        : "一般模式先略過 browser QA；大功能完成或睡覺模式再跑。",
      validation: [smoke ? "smoke-skip" : "general-mode-skip"],
      next: "reporter",
    }));
  }

  const result = await runCommand("node", ["AI_TEAM/scripts/playwright-browser-qa.mjs"], workerTimeoutMs["browser-qa"]);

  return writeWorkerResult(baseWorkerResult("browser-qa", {
    status: result.code === 0 ? "done" : "failed",
    taskId: task.id,
    summary: result.code === 0 ? "Browser QA 完成。" : `Browser QA 失敗：${summarizeOutput(result) || `exit ${result.code}`}`,
    validation: [`exit=${result.code}`],
    next: result.code === 0 ? "reporter" : "planner",
  }));
}

async function reporterWorker(task) {
  if (smoke) {
    writeRuntimeFile(runtimeFiles.finalReport, "# Final Report\n\n- STATUS: PASS\n- Smoke worker pipeline completed.");
    writeRuntimeFile(runtimeFiles.nextPrompt, "請接續 AI_TEAM queue 的下一個 pending task。");
    return writeWorkerResult(baseWorkerResult("reporter", {
      taskId: task.id,
      summary: "Smoke reporter 已寫入 runtime final report / next prompt。",
      validation: ["runtime-final-report", "runtime-next-prompt"],
      next: "git-delivery",
    }));
  }

  const result = await runCommand(
    "node",
    ["AI_TEAM/scripts/local-models.mjs", `--mode=${runnerMode}`, "--only=next-prompt,final-report"],
    workerTimeoutMs.reporter,
  );

  return writeWorkerResult(baseWorkerResult("reporter", {
    status: result.code === 0 ? "done" : "failed",
    taskId: task.id,
    summary: result.code === 0 ? "Reporter worker 完成。" : `Reporter worker 失敗：${summarizeOutput(result) || `exit ${result.code}`}`,
    validation: [`exit=${result.code}`],
    next: result.code === 0 ? "git-delivery" : "planner",
  }));
}

async function gitDeliveryWorker(task) {
  if (smoke) {
    const smokeResults = [
      evaluateGitDeliveryPolicy({
        enabled: false,
        qaPass: true,
        results: [],
        gitEntries: [],
        currentWorkerResult: { status: "done" },
        loopState: { status: "running" },
        branch: "codex/smoke",
        branchPlan: evaluateBranchPlan("codex/smoke", task, true),
      }),
      evaluateGitDeliveryPolicy({
        enabled: true,
        qaPass: true,
        results: [{ worker: "reporter", status: "done" }],
        gitEntries: [{ code: "M", path: "AI_TEAM/scripts/ai-team-runner.mjs" }],
        currentWorkerResult: { status: "done" },
        loopState: { status: "running", currentTaskId: "fake-ai-team-pipeline-smoke", currentTaskTitle: "Fake AI_TEAM pipeline smoke task" },
        branch: "master",
        branchPlan: evaluateBranchPlan("master", task, true),
      }),
      evaluateGitDeliveryPolicy({
        enabled: true,
        qaPass: true,
        results: [{ worker: "reporter", status: "done" }],
        gitEntries: [{ code: "M", path: "AI_TEAM/scripts/ai-team-runner.mjs" }],
        currentWorkerResult: { status: "done" },
        loopState: { status: "running", currentTaskId: "fake-ai-team-pipeline-smoke", currentTaskTitle: "Fake AI_TEAM pipeline smoke task" },
        branch: "codex/smoke-ready",
        branchPlan: evaluateBranchPlan("codex/smoke-ready", task, true),
      }),
      {
        ...evaluateGitDeliveryPolicy({
          enabled: true,
          qaPass: true,
          results: [{ worker: "reporter", status: "done" }],
          gitEntries: [{ code: "M", path: "AI_TEAM/scripts/ai-team-runner.mjs" }],
          currentWorkerResult: { status: "done" },
          loopState: { status: "running", currentTaskId: "fake-ai-team-pipeline-smoke", currentTaskTitle: "Fake AI_TEAM pipeline smoke task" },
          branch: "codex/smoke-commit",
          branchPlan: evaluateBranchPlan("codex/smoke-commit", task, true),
        }),
        decision: "ready-commit-enabled-push-disabled",
      },
      {
        ...evaluateGitDeliveryPolicy({
          enabled: true,
          qaPass: true,
          results: [{ worker: "reporter", status: "done" }],
          gitEntries: [{ code: "M", path: "AI_TEAM/scripts/ai-team-runner.mjs" }],
          currentWorkerResult: { status: "done" },
          loopState: { status: "running", currentTaskId: "fake-ai-team-pipeline-smoke", currentTaskTitle: "Fake AI_TEAM pipeline smoke task" },
          branch: "codex/smoke-pr",
          branchPlan: evaluateBranchPlan("codex/smoke-pr", task, true),
        }),
        decision: "push-enabled-gh-missing",
        status: "failed",
      },
    ];

    return writeWorkerResult(baseWorkerResult("git-delivery", {
      status: "done",
      taskId: task.id,
      summary: "Smoke 已覆蓋 git-delivery branch unsafe / ready but commit disabled / commit enabled but push disabled / push enabled but gh missing。",
      validation: smokeResults.map((result) => `smoke-${result.decision}=${result.status}`),
      next: null,
    }));
  }

  const enabled = process.env.AI_TEAM_ENABLE_GIT_DELIVERY === "1";
  const dryRun = process.env.AI_TEAM_GIT_DRY_RUN !== "0";
  const autoBranchEnabled = process.env.AI_TEAM_GIT_AUTO_BRANCH !== "0";
  const loopState = readJsonSafe(runtimeFiles.loopState, {});
  const currentWorkerResult = readJsonSafe(runtimeFiles.workerResult, {});
  const branch = runGit(["branch", "--show-current"]) || "unknown";
  const branchPlan = evaluateBranchPlan(branch, task, autoBranchEnabled);
  const gitStatus = getGitStatusEntries();
  if (!gitStatus.ok) {
    return writeWorkerResult(baseWorkerResult("git-delivery", {
      status: "failed",
      taskId: task.id,
      summary: `無法讀取 git status：${gitStatus.reason}`,
      validation: ["git-status-unavailable"],
      next: "planner",
    }));
  }

  const policy = evaluateGitDeliveryPolicy({
    enabled,
    qaPass: isQaPass(),
    results: Array.isArray(loopState.results) ? loopState.results : [],
    gitEntries: gitStatus.entries,
    currentWorkerResult,
    loopState,
    branch,
    branchPlan,
    productionDeployEnabled: process.env.AI_TEAM_ENABLE_PRODUCTION_DEPLOY === "1",
  });

  if (policy.decision === "skipped") {
    return writeWorkerResult(baseWorkerResult("git-delivery", {
      status: "skipped",
      taskId: task.id,
      summary: policy.summary,
      changedFiles: policy.committableFiles.map((item) => item.path),
      validation: policy.validation,
      next: null,
    }));
  }

  if (policy.decision === "blocked") {
    return writeWorkerResult(baseWorkerResult("git-delivery", {
      status: "blocked",
      taskId: task.id,
      summary: policy.summary,
      changedFiles: policy.committableFiles.map((item) => item.path),
      validation: policy.validation,
      next: "planner",
    }));
  }

  const commitEnabled = process.env.AI_TEAM_GIT_COMMIT === "1";
  const pushEnabled = process.env.AI_TEAM_GIT_PUSH === "1";
  const prEnabled = process.env.AI_TEAM_GIT_PR === "1";
  const validations = [...policy.validation];
  const effectiveBranch = policy.effectiveBranch || branchPlan.targetBranch || branch;
  const prMetadata = policy.prMetadata || buildPrMetadata(task, effectiveBranch, validations);

  if (prEnabled && !pushEnabled) {
    return writeWorkerResult(baseWorkerResult("git-delivery", {
      status: "blocked",
      taskId: task.id,
      summary: "啟用了 AI_TEAM_GIT_PR=1，但 AI_TEAM_GIT_PUSH 未啟用；建立 PR 前必須先 push branch。",
      changedFiles: policy.committableFiles.map((item) => item.path),
      validation: [...validations, "pr-requires-push"],
      next: "planner",
    }));
  }

  const plannedActions = [];
  if (branchPlan.needsBranchSwitch) {
    plannedActions.push(`switch-branch:${effectiveBranch}`);
  }
  if (commitEnabled) {
    plannedActions.push(`git-add:${policy.committableFiles.length}`);
    plannedActions.push("git-commit");
  }
  if (pushEnabled) {
    plannedActions.push(`git-push:${effectiveBranch}`);
  }
  if (prEnabled) {
    plannedActions.push(`gh-pr:${prMetadata.base}${prMetadata.draft ? ":draft" : ""}`);
  }

  const plannedActionText = plannedActions.length > 0 ? plannedActions.join(", ") : "no-op";

  if (dryRun) {
    return writeWorkerResult(baseWorkerResult("git-delivery", {
      status: "done",
      taskId: task.id,
      summary: branchPlan.needsBranchSwitch
        ? `Dry-run：目前 branch 不安全，將切到 ${effectiveBranch}，再執行 ${plannedActionText}。`
        : `Dry-run：將執行 ${plannedActionText}。`,
      changedFiles: policy.committableFiles.map((item) => item.path),
      validation: [...validations, "dry-run", ...plannedActions, `pr-base=${prMetadata.base}`, `pr-draft=${prMetadata.draft ? "true" : "false"}`],
      next: null,
    }));
  }

  if (!commitEnabled) {
    validations.push("delivery-ready");
    return writeWorkerResult(baseWorkerResult("git-delivery", {
      status: "done",
      taskId: task.id,
      summary: "Git delivery policy 通過，已達 ready 狀態；設定 AI_TEAM_GIT_COMMIT=1 後才會真的 commit / push / PR。",
      changedFiles: policy.committableFiles.map((item) => item.path),
      validation: [...validations, `pr-base=${prMetadata.base}`, `pr-draft=${prMetadata.draft ? "true" : "false"}`],
      next: null,
    }));
  }

  if (branchPlan.needsBranchSwitch) {
    const branchResult = await ensureBranch(effectiveBranch);
    if (branchResult.code !== 0) {
      return writeWorkerResult(baseWorkerResult("git-delivery", {
        status: "failed",
        taskId: task.id,
        summary: `切換安全 branch 失敗：${summarizeOutput(branchResult) || `exit ${branchResult.code}`}`,
        changedFiles: policy.committableFiles.map((item) => item.path),
        validation: [...validations, "branch-switch-failed"],
        next: "planner",
      }));
    }
    validations.push(`branch-switched:${effectiveBranch}`);
  }

  const addResult = await gitMutate(["add", "--", ...policy.committableFiles.map((item) => item.path)]);
  if (addResult.code !== 0) {
    return writeWorkerResult(baseWorkerResult("git-delivery", {
      status: "failed",
      taskId: task.id,
      summary: `git add 失敗：${summarizeOutput(addResult) || `exit ${addResult.code}`}`,
      changedFiles: policy.committableFiles.map((item) => item.path),
      validation: [...validations, "git-add-failed"],
      next: "planner",
    }));
  }

  const commitMessage = process.env.AI_TEAM_GIT_COMMIT_MESSAGE?.trim() || `chore(ai-team): deliver ${task.id}`;
  const commitResult = await gitMutate(["commit", "-m", commitMessage]);
  if (commitResult.code !== 0) {
    return writeWorkerResult(baseWorkerResult("git-delivery", {
      status: "failed",
      taskId: task.id,
      summary: `git commit 失敗：${summarizeOutput(commitResult) || `exit ${commitResult.code}`}`,
      changedFiles: policy.committableFiles.map((item) => item.path),
      validation: [...validations, "git-commit-failed"],
      next: "planner",
    }));
  }

  validations.push(`commit:${commitMessage}`);

  if (pushEnabled) {
    const pushResult = await gitMutate(["push", "-u", "origin", effectiveBranch], 5 * 60 * 1000);
    if (pushResult.code !== 0) {
      return writeWorkerResult(baseWorkerResult("git-delivery", {
        status: "failed",
        taskId: task.id,
        summary: `git push 失敗：${summarizeOutput(pushResult) || `exit ${pushResult.code}`}`,
        changedFiles: policy.committableFiles.map((item) => item.path),
        validation: [...validations, "git-push-failed"],
        next: "planner",
      }));
    }
    validations.push(`push:${effectiveBranch}`);
  }

  if (prEnabled) {
    if (!(await commandExists("gh"))) {
      return writeWorkerResult(baseWorkerResult("git-delivery", {
        status: "failed",
        taskId: task.id,
        summary: "要求建立 PR，但本機找不到 gh CLI。",
        changedFiles: policy.committableFiles.map((item) => item.path),
        validation: [...validations, "gh-missing"],
        next: "planner",
      }));
    }

    const prArgs = ["pr", "create", "--base", prMetadata.base, "--head", effectiveBranch, "--title", prMetadata.title, "--body", prMetadata.body];
    if (prMetadata.draft) {
      prArgs.push("--draft");
    }

    const prResult = await ghMutate(prArgs, 5 * 60 * 1000);
    if (prResult.code !== 0) {
      return writeWorkerResult(baseWorkerResult("git-delivery", {
        status: "failed",
        taskId: task.id,
        summary: `gh pr create 失敗：${summarizeOutput(prResult) || `exit ${prResult.code}`}`,
        changedFiles: policy.committableFiles.map((item) => item.path),
        validation: [...validations, "gh-pr-failed"],
        next: "planner",
      }));
    }
    validations.push("pr-created");
  }

  validations.push("delivery-ready");
  return writeWorkerResult(baseWorkerResult("git-delivery", {
    status: "done",
    taskId: task.id,
    summary: "Git delivery 完成。",
    changedFiles: policy.committableFiles.map((item) => item.path),
    validation: validations,
    next: null,
  }));
}

async function runWorker(worker, task, resultsSoFar = []) {
  writeCurrentWorker(worker, task);
  writeHeartbeat(worker, task);
  writeLoopState({
    status: "running",
    currentTaskId: task?.id || null,
    currentTaskTitle: task?.title || null,
    currentWorker: worker,
    results: resultsSoFar,
  });

  switch (worker) {
    case "planner":
      return plannerWorker();
    case "codex-dev":
      return codexWorker(task);
    case "local-model-review":
      return localModelReviewWorker(task);
    case "qa":
      return qaWorker(task);
    case "browser-qa":
      return browserQaWorker(task);
    case "reporter":
      return reporterWorker(task);
    case "git-delivery":
      return gitDeliveryWorker(task);
    default:
      return writeWorkerResult(baseWorkerResult(worker, {
        status: "failed",
        taskId: task?.id || null,
        summary: `未知 worker：${worker}`,
        next: "planner",
      }));
  }
}

async function runPipeline() {
  const queue = loadQueue();
  let task = selectTask(queue);
  const results = [];

  for (const worker of WORKER_ORDER) {
    const result = await runWorker(worker, task, results);
    results.push(result);

    if (worker === "planner") {
      if (result.status !== "done") break;
      task = selectTask(queue);
    }

    if (["failed", "blocked"].includes(result.status)) {
      writeLoopState({
        status: result.status,
        currentTaskId: task?.id || null,
        failedWorker: worker,
        lastResult: result,
      });
      break;
    }
  }

  const finalStatus = results.some((result) => result.status === "failed")
    ? "failed"
    : results.some((result) => result.status === "blocked")
      ? "blocked"
      : "done";

  writeLoopState({
    status: finalStatus,
    currentTaskId: task?.id || null,
    results,
  });

  return results;
}

async function runSingleWorkerPipeline() {
  const queue = loadQueue();
  const task = selectTask(queue);
  const existingLoopState = readJsonSafe(runtimeFiles.loopState, {});
  const existingResults = Array.isArray(existingLoopState.results) ? existingLoopState.results : [];
  const result = await runWorker(onlyWorker, task, existingResults);
  const results = [...existingResults, result];

  writeLoopState({
    status: result.status,
    currentTaskId: task?.id || existingLoopState.currentTaskId || null,
    currentTaskTitle: task?.title || existingLoopState.currentTaskTitle || null,
    currentWorker: onlyWorker,
    results,
    lastResult: result,
  });

  return [result];
}

function buildPipelineSummary(results) {
  return [
    "## PIPELINE",
    ...results.map((result) => `- ${result.worker}: ${result.status}${result.summary ? ` - ${result.summary}` : ""}`),
  ].join("\n");
}

async function main() {
  const lock = acquireLock(runtimeFiles.runnerLock, { mode: runnerMode, qaLevel, smoke }, 12 * 60 * 60 * 1000);
  if (!lock.ok) {
    const reason = `${lock.reason}${lock.existing?.pid ? ` pid=${lock.existing.pid}` : ""}`;
    const message = `AI_TEAM runner 略過：${reason}`;
    emit(message);
    appendLog(message);
    return;
  }

  try {
    let previous = "";
    let cycles = 0;
    let firstRun = true;

    while (cycles < maxCycles) {
      cycles += 1;
      const snapshot = buildSnapshot();
      const shouldRunPipeline = firstRun || alwaysRun || snapshot !== previous;
      firstRun = false;

      if (shouldRunPipeline) {
        previous = snapshot;
        const results = onlyWorker ? await runSingleWorkerPipeline() : await runPipeline();
        const healthSummary = buildHealthSummary(results);
        const pipelineSummary = buildPipelineSummary(results);
        const output = [healthSummary, "", pipelineSummary].join("\n");

        writeRuntimeFile(runtimeFiles.healthSummary, output);
        emit(output);
        appendLog(output);
      } else {
        const msg = noWait ? "AI_TEAM 無變更，立即進入下一輪檢查。" : `AI_TEAM 無變更，${intervalMinutes} 分鐘後再檢查。`;
        emit(msg);
        appendLog(msg);
      }

      if (once) break;
      if (!noWait) {
        await new Promise((resolve) => setTimeout(resolve, intervalMinutes * 60 * 1000));
      }
    }
  } finally {
    releaseLock(runtimeFiles.runnerLock);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
