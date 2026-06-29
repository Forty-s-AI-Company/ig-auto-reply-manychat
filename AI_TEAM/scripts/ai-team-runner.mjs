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
const requestedOnlyWorker = process.argv.find((arg) => arg.startsWith("--only-worker="))?.split("=")[1]?.trim() || process.env.AI_TEAM_ONLY_WORKER?.trim() || "";

const WORKER_ORDER = [
  "planner",
  "codex-dev",
  "local-model-review",
  "qa",
  "browser-qa",
  "reporter",
  "git-delivery",
  "merge-delivery",
  "deploy",
];
const onlyWorker = WORKER_ORDER.includes(requestedOnlyWorker) ? requestedOnlyWorker : "";

const PRODUCT_AUTOFILL_TASKS = [
  {
    id: "inbox-visible-but-unusable-autofill",
    title: "Inbox visible-but-unusable product sweep",
    priority: 1,
    lane: "product",
    scope: [
      "src/app/inbox/page.tsx",
      "src/components/InboxClient.tsx",
      "src/app/api/conversations",
      "tests/e2e/inbox-auth.spec.ts",
      "docs/codex-session-log.md",
      "docs/fix-roadmap.md",
      "docs/project-launch-checklist.md",
      "docs/product-readiness-review.md",
      "AI_TEAM/tasks/current-task.md",
      "AI_TEAM/tasks/backlog.md",
      "AI_TEAM/tasks/queue.json",
      "AI_TEAM/reports/dev-report.md",
      "AI_TEAM/reports/final-report.md",
    ],
    acceptance: [
      "盤點 Inbox 還有哪些看得到但不能用或容易誤導的控制項",
      "能安全支援的補成最小可用版本",
      "不能安全支援的改成清楚 disabled UX",
      "補 focused tests 或 authenticated Playwright smoke",
    ],
  },
  {
    id: "channels-connect-visible-but-unusable-autofill",
    title: "Channels / Connect visible-but-unusable product sweep",
    priority: 2,
    lane: "product",
    scope: [
      "src/app/channels/page.tsx",
      "src/app/channels/connect/page.tsx",
      "src/app/channels/connect/social/page.tsx",
      "src/components/InstagramChannelActions.tsx",
      "src/components/RefreshInstagramProfileButton.tsx",
      "src/components/InboxPilotAccountDropdown.tsx",
      "tests/channels-connect-visibility.test.ts",
      "tests/instagram-profile-refresh-route.test.ts",
      "tests/account-channel-list.test.ts",
      "docs/codex-session-log.md",
      "docs/fix-roadmap.md",
      "docs/project-launch-checklist.md",
      "docs/product-readiness-review.md",
      "AI_TEAM/tasks/current-task.md",
      "AI_TEAM/tasks/backlog.md",
      "AI_TEAM/tasks/queue.json",
      "AI_TEAM/reports/dev-report.md",
      "AI_TEAM/reports/final-report.md",
    ],
    acceptance: [
      "Channels / Connect / Social connect 入口不再有假按鈕或模糊狀態",
      "IG metadata refresh / token / permission 類錯誤必須是使用者可讀訊息",
      "simple release 與 full release 入口分流清楚",
      "補 focused tests 或 browser smoke",
    ],
  },
  {
    id: "contacts-product-completeness-autofill",
    title: "Contacts product completeness sweep",
    priority: 3,
    lane: "product",
    scope: [
      "src/app/contacts",
      "src/components/ContactsListClient.tsx",
      "src/app/api/contacts",
      "tests/e2e/contacts-auth.spec.ts",
      "docs/codex-session-log.md",
      "docs/fix-roadmap.md",
      "docs/project-launch-checklist.md",
      "docs/product-readiness-review.md",
      "AI_TEAM/tasks/current-task.md",
      "AI_TEAM/tasks/backlog.md",
      "AI_TEAM/tasks/queue.json",
      "AI_TEAM/reports/dev-report.md",
      "AI_TEAM/reports/final-report.md",
    ],
    acceptance: [
      "Contacts 篩選、批次操作、空狀態與錯誤回饋都不再像半成品",
      "安全可支援的操作補最小可用",
      "暫時不支援的操作改為清楚 disabled UX",
      "補 focused tests 或 authenticated Playwright smoke",
    ],
  },
  {
    id: "automations-scope-clarity-autofill",
    title: "Automations scope clarity and disabled UX sweep",
    priority: 4,
    lane: "product",
    scope: [
      "src/app/automations",
      "src/app/api/automations",
      "tests",
      "docs/codex-session-log.md",
      "docs/fix-roadmap.md",
      "docs/project-launch-checklist.md",
      "docs/product-readiness-review.md",
      "AI_TEAM/tasks/current-task.md",
      "AI_TEAM/tasks/backlog.md",
      "AI_TEAM/tasks/queue.json",
      "AI_TEAM/reports/dev-report.md",
      "AI_TEAM/reports/final-report.md",
    ],
    acceptance: [
      "Automations 頁面清楚說明目前 workspace / channel scope 行為",
      "看得到但尚未支援的操作改成 disabled UX",
      "不要讓使用者誤以為 sidebar IG channel 已完整隔離 automation data model",
      "補 focused tests 或 smoke",
    ],
  },
  {
    id: "analytics-readiness-autofill",
    title: "Analytics readability and data-state sweep",
    priority: 5,
    lane: "product",
    scope: [
      "src/app/analytics",
      "src/app/api/analytics",
      "tests",
      "docs/codex-session-log.md",
      "docs/fix-roadmap.md",
      "docs/project-launch-checklist.md",
      "docs/product-readiness-review.md",
      "AI_TEAM/tasks/current-task.md",
      "AI_TEAM/tasks/backlog.md",
      "AI_TEAM/tasks/queue.json",
      "AI_TEAM/reports/dev-report.md",
      "AI_TEAM/reports/final-report.md",
    ],
    acceptance: [
      "Analytics 空資料、載入失敗、權限不足與篩選狀態都要有清楚說明",
      "不能讓圖表或數字看起來像壞掉",
      "補 focused tests 或 smoke",
    ],
  },
  {
    id: "billing-payuni-sandbox-autofill",
    title: "Billing / PayUNI Sandbox product readiness sweep",
    priority: 6,
    lane: "product",
    scope: [
      "src/app/billing",
      "src/app/api/billing",
      "src/lib/payuni.ts",
      "tests",
      "docs/billing-affiliate-readiness.md",
      "docs/codex-session-log.md",
      "docs/fix-roadmap.md",
      "docs/project-launch-checklist.md",
      "docs/product-readiness-review.md",
      "AI_TEAM/tasks/current-task.md",
      "AI_TEAM/tasks/backlog.md",
      "AI_TEAM/tasks/queue.json",
      "AI_TEAM/reports/dev-report.md",
      "AI_TEAM/reports/final-report.md",
    ],
    acceptance: [
      "PayUNI 維持 Sandbox，不切 production",
      "Billing 頁面清楚說明 Sandbox / production gate",
      "能安全測的 checkout / return / notify path 補 smoke 或文件化",
      "不執行正式交易",
    ],
  },
  {
    id: "launch-readiness-product-sweep-autofill",
    title: "Launch readiness product sweep",
    priority: 7,
    lane: "product",
    scope: [
      "docs/project-launch-checklist.md",
      "docs/product-readiness-review.md",
      "docs/fix-roadmap.md",
      "docs/codex-session-log.md",
      "AI_TEAM/tasks/current-task.md",
      "AI_TEAM/tasks/backlog.md",
      "AI_TEAM/tasks/queue.json",
      "AI_TEAM/reports/dev-report.md",
      "AI_TEAM/reports/final-report.md",
    ],
    acceptance: [
      "整理產品是否已達 beta / paid launch 的差距",
      "只把安全可自動處理的產品缺口補回 queue",
      "外部 gate 必須標成 human required，不猜 secret、不碰 production",
    ],
  },
];

const workerTimeoutMs = {
  planner: 30 * 1000,
  "codex-dev": runnerMode === "sleep" ? 2 * 60 * 60 * 1000 : 30 * 60 * 1000,
  "local-model-review": runnerMode === "sleep" ? 20 * 60 * 1000 : 6 * 60 * 1000,
  qa: runnerMode === "sleep" ? 45 * 60 * 1000 : 15 * 60 * 1000,
  "browser-qa": 10 * 60 * 1000,
  reporter: runnerMode === "sleep" ? 20 * 60 * 1000 : 6 * 60 * 1000,
  "git-delivery": 60 * 1000,
  "merge-delivery": 60 * 1000,
  deploy: 10 * 60 * 1000,
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

function writeTrackedFile(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${String(contents).replace(/\s+$/, "")}\n`, "utf8");
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

function classifyGitEntries(entries, options = {}) {
  const allowReports = options.allowReports === true;
  const committableFiles = [];
  const excludedFiles = [];

  for (const entry of entries) {
    const match = excludedGitPathRules.find((rule) => {
      if (allowReports && (rule.label === "reports")) return false;
      return rule.test(entry.path);
    });
    if (match) {
      excludedFiles.push({ ...entry, category: match.label });
    } else {
      committableFiles.push(entry);
    }
  }

  return { committableFiles, excludedFiles };
}

function normalizeScopePattern(value) {
  const normalized = String(value || "")
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\.\/+/, "");
  if (!normalized) return "";
  return normalized.endsWith("/") ? normalized : normalized;
}

function isEntryWithinScope(entryPath, scopePatterns = []) {
  const normalizedEntry = String(entryPath || "").replace(/\\/g, "/");
  if (!scopePatterns.length) return true;

  return scopePatterns.some((pattern) => {
    const normalizedPattern = normalizeScopePattern(pattern);
    if (!normalizedPattern) return false;
    if (normalizedEntry === normalizedPattern) return true;
    if (normalizedEntry.startsWith(`${normalizedPattern}/`)) return true;
    return false;
  });
}

function filterEntriesByScope(entries, scope = []) {
  const scopePatterns = (scope || []).map(normalizeScopePattern).filter(Boolean);
  if (scopePatterns.length === 0) {
    return {
      scopedEntries: [...entries],
      ignoredOutOfScope: [],
      scopePatterns,
    };
  }

  const scopedEntries = [];
  const ignoredOutOfScope = [];

  for (const entry of entries) {
    if (isEntryWithinScope(entry.path, scopePatterns)) {
      scopedEntries.push(entry);
    } else {
      ignoredOutOfScope.push(entry);
    }
  }

  return { scopedEntries, ignoredOutOfScope, scopePatterns };
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
  taskScope = [],
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
  const { scopedEntries, ignoredOutOfScope, scopePatterns } = filterEntriesByScope(gitEntries, taskScope);
  const allowReports = scopePatterns.some((pattern) => pattern.startsWith("AI_TEAM/reports/") || pattern.startsWith("reports/"));
  const { committableFiles, excludedFiles } = classifyGitEntries(scopedEntries, { allowReports });
  const failedWorkers = (results || []).filter((item) => ["failed", "blocked"].includes(item.status) && !["git-delivery", "merge-delivery", "deploy"].includes(item.worker));
  if (!qaPass) {
    blockedReasons.push("QA report 不是 PASS。");
  }

  if (branchPlan && !branchPlan.branchSafety.safe && !branchPlan.needsBranchSwitch) {
    blockedReasons.push(branchPlan.summary);
  }

  if (failedWorkers.length > 0) {
    blockedReasons.push(`存在失敗或阻塞 worker：${failedWorkers.map((item) => item.worker).join(", ")}`);
  }

  if (currentWorkerResult?.status && ["failed", "blocked"].includes(currentWorkerResult.status) && currentWorkerResult.worker !== "git-delivery") {
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
      validation: [...blockedReasons, branchPlan?.summary || "", scopePatterns.length ? `scope=${scopePatterns.length}` : "", ignoredOutOfScope.length ? `ignored-out-of-scope=${ignoredOutOfScope.length}` : ""].filter(Boolean),
      committableFiles,
      excludedFiles,
      ignoredOutOfScope,
      scopePatterns,
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
      scopePatterns.length ? `scope=${scopePatterns.length}` : "",
      ignoredOutOfScope.length ? `ignored-out-of-scope=${ignoredOutOfScope.length}` : "",
    ],
    committableFiles,
    excludedFiles,
    ignoredOutOfScope,
    scopePatterns,
    blockedReasons: [],
    prMetadata,
    effectiveBranch,
  };
}

function getJsonFromGh(args, fallback = null) {
  try {
    const output = execFileSync("gh", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
    return output ? JSON.parse(output) : fallback;
  } catch {
    return fallback;
  }
}

function getHeadCommitSha() {
  const sha = runGit(["rev-parse", "HEAD"]);
  return sha && !sha.startsWith("git unavailable:") ? sha : "";
}

function getCurrentBranchName() {
  return runGit(["branch", "--show-current"]) || "unknown";
}

function getExistingPrInfo(branch) {
  if (!branch || branch === "unknown") return null;
  return getJsonFromGh([
    "pr",
    "view",
    branch,
    "--json",
    "number,title,body,url,isDraft,mergeStateStatus,reviewDecision,headRefName,baseRefName,statusCheckRollup",
  ], null);
}

function summarizeStatusChecks(statusCheckRollup = []) {
  const items = Array.isArray(statusCheckRollup) ? statusCheckRollup : [];
  const failed = [];
  const pending = [];
  const passed = [];

  for (const item of items) {
    const name = item?.name || item?.context || item?.workflowName || item?.title || "unknown-check";
    const conclusion = String(item?.conclusion || item?.state || item?.status || "").toUpperCase();
    if (!conclusion || ["PENDING", "EXPECTED", "IN_PROGRESS", "QUEUED", "WAITING", "REQUESTED"].includes(conclusion)) {
      pending.push(name);
      continue;
    }

    if (["SUCCESS", "PASS", "PASSED", "NEUTRAL", "SKIPPED"].includes(conclusion)) {
      passed.push(name);
      continue;
    }

    failed.push(`${name}:${conclusion}`);
  }

  return {
    failed,
    pending,
    passed,
    hasChecks: items.length > 0,
  };
}

function evaluateMergeDeliveryPolicy({
  enabled,
  prInfo,
  allowWithoutChecks = false,
}) {
  if (!enabled) {
    return {
      decision: "skipped",
      status: "skipped",
      summary: "Merge delivery 未啟用；設定 AI_TEAM_GIT_MERGE=1 才會進入 merge gate。",
      validation: ["merge-delivery-disabled"],
    };
  }

  if (!prInfo?.url) {
    return {
      decision: "blocked",
      status: "blocked",
      summary: "尚未找到可合併的 PR，merge delivery 無法繼續。",
      validation: ["missing-pr"],
    };
  }

  if (prInfo.isDraft) {
    return {
      decision: "blocked",
      status: "blocked",
      summary: "PR 仍是 draft，暫不允許 unattended merge。",
      validation: ["draft-pr"],
    };
  }

  const mergeState = String(prInfo.mergeStateStatus || "").toUpperCase();
  if (mergeState && ["BLOCKED", "DIRTY", "BEHIND", "UNKNOWN"].includes(mergeState)) {
    return {
      decision: "blocked",
      status: "blocked",
      summary: `PR merge state 為 ${mergeState}，暫不允許 unattended merge。`,
      validation: [`merge-state=${mergeState}`],
    };
  }

  const checks = summarizeStatusChecks(prInfo.statusCheckRollup);
  if (checks.failed.length > 0) {
    return {
      decision: "blocked",
      status: "blocked",
      summary: `PR checks 失敗：${checks.failed.join(", ")}`,
      validation: [`failed-checks=${checks.failed.join(",")}`],
    };
  }

  if (checks.pending.length > 0) {
    return {
      decision: "blocked",
      status: "blocked",
      summary: `PR checks 尚未完成：${checks.pending.join(", ")}`,
      validation: [`pending-checks=${checks.pending.join(",")}`],
    };
  }

  if (!checks.hasChecks && !allowWithoutChecks) {
    return {
      decision: "blocked",
      status: "blocked",
      summary: "PR 沒有檢查結果；預設不做 unattended merge。",
      validation: ["no-status-checks"],
    };
  }

  return {
    decision: "ready",
    status: "done",
    summary: "PR 已達自動 merge 條件。",
    validation: [
      `pr=${prInfo.url}`,
      `merge-state=${mergeState || "unknown"}`,
      checks.hasChecks ? `checks=${checks.passed.length}` : "checks=none",
    ],
  };
}

function evaluateDeployPolicy({
  enabled,
  target,
  productionEnabled = false,
  mergeDone = false,
}) {
  if (!enabled) {
    return {
      decision: "skipped",
      status: "skipped",
      summary: "Deploy worker 未啟用；設定 AI_TEAM_DEPLOY=1 才會進入 deploy gate。",
      validation: ["deploy-disabled"],
    };
  }

  if (!mergeDone) {
    return {
      decision: "blocked",
      status: "blocked",
      summary: "尚未完成 merge，不允許自動部署。",
      validation: ["merge-required-before-deploy"],
    };
  }

  if (target === "production" && !productionEnabled) {
    return {
      decision: "blocked",
      status: "blocked",
      summary: "Production deploy 預設關閉，需明確開啟 AI_TEAM_ENABLE_PRODUCTION_DEPLOY=1。",
      validation: ["production-deploy-blocked"],
    };
  }

  return {
    decision: "ready",
    status: "done",
    summary: `可執行 ${target} deploy。`,
    validation: [`deploy-target=${target}`],
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

function writeDeliveryState(state) {
  writeJson(runtimeFiles.deliveryState, {
    updatedAt: nowIso(),
    ...state,
  });
}

function loadQueue() {
  const fallback = { version: 1, updatedAt: nowIso(), tasks: [] };
  return readJsonSafe(trackedFiles.queue, fallback);
}

function saveQueue(queue) {
  writeTrackedFile(
    trackedFiles.queue,
    JSON.stringify(
      {
        ...queue,
        updatedAt: nowIso(),
      },
      null,
      2,
    ),
  );
}

function buildAutofillTask(seed) {
  return {
    ...seed,
    status: "pending",
    safety: [
      "no-production-db",
      "no-migration",
      "no-production-deploy",
      "no-meta-review",
      "no-payuni-production",
      ...(seed.safety || []),
    ],
    createdBy: "ai-team-autofill",
    createdAt: nowIso(),
    summary: "由 planner 在 queue 無 pending / running task 時自動補入，讓產品閉環不中斷。",
  };
}

function ensureNextProductTask(queue) {
  const tasks = Array.isArray(queue.tasks) ? queue.tasks : [];
  const activeTask = tasks.find((task) => ["pending", "running"].includes(task.status));
  if (activeTask || smoke) {
    return { queue, task: activeTask || null, created: false };
  }

  const existingIds = new Set(tasks.map((task) => task.id));
  const nextSeed = PRODUCT_AUTOFILL_TASKS.find((seed) => !existingIds.has(seed.id));
  if (!nextSeed) {
    return { queue, task: null, created: false };
  }

  const task = buildAutofillTask(nextSeed);
  const nextQueue = {
    ...queue,
    tasks: [...tasks, task],
  };
  saveQueue(nextQueue);

  return { queue: nextQueue, task, created: true };
}

function updateQueueTask(taskId, updater) {
  if (smoke || !taskId) return;
  const queue = loadQueue();
  let changed = false;
  const tasks = (queue.tasks || []).map((task) => {
    if (task.id !== taskId) return task;
    changed = true;
    return updater({ ...task });
  });

  if (!changed) return;
  saveQueue({
    ...queue,
    tasks,
  });
}

function writeCurrentTaskFromQueue(task, statusLabel, details = []) {
  if (smoke || !task?.id) return;
  const lines = [
    "# Current Task",
    "",
    "## Active Lane",
    "",
    `- \`LANE\`: ${task.lane || "unassigned"}`,
    `- \`STATUS\`: ${statusLabel}`,
    "- `OWNER`: AI_TEAM runner",
    `- \`PRIMARY_TARGET\`: ${task.title || task.id}`,
    `- \`SECONDARY_TARGET\`: ${task.scope?.join(", ") || "（空）"}`,
    "",
    "## Current Execution Goal",
    "",
    `- task id: \`${task.id}\``,
    ...details.map((item) => `- ${item}`),
    "",
    "## Hard Stops",
    "",
    "- 不碰 production DB。",
    "- 不跑 migration / `db push`。",
    "- 不部署 Production。",
    "- 不送 Meta App Review。",
    "- 不切 PayUNI production。",
  ];

  writeTrackedFile(trackedFiles.currentTask, lines.join("\n"));
}

function syncBacklogFromQueue(queue) {
  if (smoke) return;
  const orderedTasks = [...(queue.tasks || [])].sort((a, b) => Number(a.priority || 999) - Number(b.priority || 999));
  const lines = [
    "# Backlog",
    "",
    "## Runner Rules",
    "",
    "backlog 第一個可執行項目，代表下一輪預設要接的任務。若第一項被外部條件阻塞，runner 應跳到下一個 `UNBLOCKED` 項目，並把阻塞原因寫進 `AI_TEAM/reports/final-report.md`。",
    "",
    "## Queue Snapshot",
    "",
    ...(orderedTasks.length
      ? orderedTasks.map((task) => `- [${String(task.status || "pending").toUpperCase()}][P${task.priority || 999}][${task.lane || "lane"}] ${task.title || task.id}`)
      : ["- （空）"]),
  ];
  writeTrackedFile(trackedFiles.backlog, lines.join("\n"));
}

function syncTaskLifecycle(task, patch = {}) {
  if (!task?.id || smoke) return;
  updateQueueTask(task.id, (existing) => ({
    ...existing,
    ...patch,
  }));
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
      acceptance: ["完整走過 planner -> codex-dev -> local-model-review -> qa -> browser-qa -> reporter -> git-delivery -> merge-delivery -> deploy"],
    };
  }

  return [...(queue.tasks || [])]
    .sort((a, b) => Number(a.priority || 999) - Number(b.priority || 999))
    .find((task) => ["pending", "running"].includes(task.status));
}

async function plannerWorker() {
  let queue = loadQueue();
  let task = selectTask(queue);

  if (!task) {
    const ensured = ensureNextProductTask(queue);
    queue = ensured.queue;
    task = ensured.task;
    if (ensured.created) {
      syncBacklogFromQueue(queue);
    }
  } else {
    syncBacklogFromQueue(queue);
  }

  if (!task) {
    return writeWorkerResult(baseWorkerResult("planner", {
      status: "blocked",
      summary: "queue.json 沒有 pending / running task，且產品自動補題清單已全部完成。",
      validation: ["queue checked", "autofill exhausted"],
      next: null,
    }));
  }

  writeLoopState({
    status: "running",
    currentTaskId: task.id,
    currentTaskTitle: task.title,
    workerOrder: WORKER_ORDER,
  });
  syncTaskLifecycle(task, {
    status: "running",
    startedAt: task.startedAt || nowIso(),
    lastPickedAt: nowIso(),
    attempts: Number(task.attempts || 0) + 1,
  });
  writeCurrentTaskFromQueue(task, "Running", [
    `scope: ${(task.scope || []).join(", ") || "（空）"}`,
    `priority: ${task.priority ?? 999}`,
  ]);

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
      next: "merge-delivery",
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
    taskScope: task.scope || [],
    productionDeployEnabled: process.env.AI_TEAM_ENABLE_PRODUCTION_DEPLOY === "1",
  });

  if (policy.decision === "skipped") {
    writeDeliveryState({
      taskId: task.id,
      stage: "git-delivery",
      status: "skipped",
      branch,
      scope: task.scope || [],
    });
    return writeWorkerResult(baseWorkerResult("git-delivery", {
      status: "skipped",
      taskId: task.id,
      summary: policy.summary,
      changedFiles: policy.committableFiles.map((item) => item.path),
      validation: policy.validation,
      next: "merge-delivery",
    }));
  }

  if (policy.decision === "blocked") {
    writeDeliveryState({
      taskId: task.id,
      stage: "git-delivery",
      status: "blocked",
      branch,
      reason: policy.summary,
      scope: task.scope || [],
      ignoredOutOfScope: (policy.ignoredOutOfScope || []).map((item) => item.path),
    });
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
    writeDeliveryState({
      taskId: task.id,
      stage: "git-delivery",
      status: "dry-run",
      branch: effectiveBranch,
      plannedActions,
      prMetadata,
      scope: task.scope || [],
      ignoredOutOfScope: (policy.ignoredOutOfScope || []).map((item) => item.path),
    });
    return writeWorkerResult(baseWorkerResult("git-delivery", {
      status: "done",
      taskId: task.id,
      summary: branchPlan.needsBranchSwitch
        ? `Dry-run：目前 branch 不安全，將切到 ${effectiveBranch}，再執行 ${plannedActionText}。`
        : `Dry-run：將執行 ${plannedActionText}。`,
      changedFiles: policy.committableFiles.map((item) => item.path),
      validation: [...validations, "dry-run", ...plannedActions, `pr-base=${prMetadata.base}`, `pr-draft=${prMetadata.draft ? "true" : "false"}`],
      next: "merge-delivery",
    }));
  }

  if (!commitEnabled) {
    validations.push("delivery-ready");
    writeDeliveryState({
      taskId: task.id,
      stage: "git-delivery",
      status: "ready",
      branch: effectiveBranch,
      prMetadata,
      plannedActions,
      scope: task.scope || [],
      ignoredOutOfScope: (policy.ignoredOutOfScope || []).map((item) => item.path),
    });
    return writeWorkerResult(baseWorkerResult("git-delivery", {
      status: "done",
      taskId: task.id,
      summary: "Git delivery policy 通過，已達 ready 狀態；設定 AI_TEAM_GIT_COMMIT=1 後才會真的 commit / push / PR。",
      changedFiles: policy.committableFiles.map((item) => item.path),
      validation: [...validations, `pr-base=${prMetadata.base}`, `pr-draft=${prMetadata.draft ? "true" : "false"}`],
      next: "merge-delivery",
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
  const commitSha = getHeadCommitSha();
  let prUrl = "";

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
    prUrl = (prResult.stdout || "").trim().split(/\r?\n/).map((line) => line.trim()).find((line) => /^https:\/\/github\.com\//.test(line)) || "";
  }

  writeDeliveryState({
    taskId: task.id,
    stage: "git-delivery",
    status: "done",
    branch: getCurrentBranchName(),
    commitSha,
    commitMessage,
    prUrl,
    prMetadata,
    changedFiles: policy.committableFiles.map((item) => item.path),
    scope: task.scope || [],
    ignoredOutOfScope: (policy.ignoredOutOfScope || []).map((item) => item.path),
  });
  validations.push("delivery-ready");
  return writeWorkerResult(baseWorkerResult("git-delivery", {
    status: "done",
    taskId: task.id,
    summary: "Git delivery 完成。",
    changedFiles: policy.committableFiles.map((item) => item.path),
    validation: validations,
    next: "merge-delivery",
  }));
}

async function mergeDeliveryWorker(task) {
  if (smoke) {
    const smokeResults = [
      evaluateMergeDeliveryPolicy({ enabled: false, prInfo: null }),
      evaluateMergeDeliveryPolicy({ enabled: true, prInfo: null }),
      evaluateMergeDeliveryPolicy({ enabled: true, prInfo: { url: "https://example.test/pr/1", isDraft: true } }),
      evaluateMergeDeliveryPolicy({
        enabled: true,
        prInfo: {
          url: "https://example.test/pr/2",
          isDraft: false,
          mergeStateStatus: "CLEAN",
          statusCheckRollup: [{ name: "ci", conclusion: "SUCCESS" }],
        },
      }),
    ];

    return writeWorkerResult(baseWorkerResult("merge-delivery", {
      status: "done",
      taskId: task.id,
      summary: "Smoke 已覆蓋 merge-delivery disabled / missing-pr / draft-pr / ready。",
      validation: smokeResults.map((result) => `smoke-${result.decision}=${result.status}`),
      next: "deploy",
    }));
  }

  const enabled = process.env.AI_TEAM_GIT_MERGE === "1";
  const allowWithoutChecks = process.env.AI_TEAM_GIT_ALLOW_MERGE_WITHOUT_CHECKS === "1";
  const deliveryState = readJsonSafe(runtimeFiles.deliveryState, {});
  const branch = deliveryState.branch || getCurrentBranchName();
  const prInfo = deliveryState.prUrl ? getJsonFromGh([
    "pr",
    "view",
    deliveryState.prUrl,
    "--json",
    "number,title,body,url,isDraft,mergeStateStatus,reviewDecision,headRefName,baseRefName,statusCheckRollup",
  ], null) : getExistingPrInfo(branch);
  const policy = evaluateMergeDeliveryPolicy({ enabled, prInfo, allowWithoutChecks });

  if (policy.decision === "skipped") {
    writeDeliveryState({ ...deliveryState, merge: { status: "skipped", validation: policy.validation } });
    return writeWorkerResult(baseWorkerResult("merge-delivery", {
      status: "skipped",
      taskId: task.id,
      summary: policy.summary,
      validation: policy.validation,
      next: "deploy",
    }));
  }

  if (policy.decision === "blocked") {
    writeDeliveryState({ ...deliveryState, merge: { status: "blocked", validation: policy.validation, prUrl: prInfo?.url || "" } });
    return writeWorkerResult(baseWorkerResult("merge-delivery", {
      status: "blocked",
      taskId: task.id,
      summary: policy.summary,
      validation: policy.validation,
      next: "planner",
    }));
  }

  if (!(await commandExists("gh"))) {
    return writeWorkerResult(baseWorkerResult("merge-delivery", {
      status: "failed",
      taskId: task.id,
      summary: "要求 merge PR，但本機找不到 gh CLI。",
      validation: [...policy.validation, "gh-missing"],
      next: "planner",
    }));
  }

  const mergeMethod = process.env.AI_TEAM_GIT_MERGE_METHOD?.trim() || "merge";
  const mergeArgs = ["pr", "merge", prInfo.url, `--${mergeMethod}`, "--delete-branch=false"];
  const mergeResult = await ghMutate(mergeArgs, 5 * 60 * 1000);
  if (mergeResult.code !== 0) {
    return writeWorkerResult(baseWorkerResult("merge-delivery", {
      status: "failed",
      taskId: task.id,
      summary: `gh pr merge 失敗：${summarizeOutput(mergeResult) || `exit ${mergeResult.code}`}`,
      validation: [...policy.validation, "gh-pr-merge-failed"],
      next: "planner",
    }));
  }

  writeDeliveryState({
    ...deliveryState,
    merge: {
      status: "done",
      method: mergeMethod,
      prUrl: prInfo.url,
      validation: [...policy.validation, `merge-method=${mergeMethod}`],
    },
  });
  return writeWorkerResult(baseWorkerResult("merge-delivery", {
    status: "done",
    taskId: task.id,
    summary: "PR 自動 merge 完成。",
    validation: [...policy.validation, `merge-method=${mergeMethod}`],
    next: "deploy",
  }));
}

async function deployWorker(task) {
  if (smoke) {
    const smokeResults = [
      evaluateDeployPolicy({ enabled: false, target: "preview", mergeDone: false }),
      evaluateDeployPolicy({ enabled: true, target: "preview", mergeDone: true }),
      evaluateDeployPolicy({ enabled: true, target: "production", mergeDone: true, productionEnabled: false }),
    ];

    return writeWorkerResult(baseWorkerResult("deploy", {
      status: "done",
      taskId: task.id,
      summary: "Smoke 已覆蓋 deploy disabled / preview ready / production blocked。",
      validation: smokeResults.map((result) => `smoke-${result.decision}=${result.status}`),
      next: null,
    }));
  }

  const enabled = process.env.AI_TEAM_DEPLOY === "1";
  const target = process.env.AI_TEAM_DEPLOY_TARGET?.trim().toLowerCase() === "production" ? "production" : "preview";
  const deliveryState = readJsonSafe(runtimeFiles.deliveryState, {});
  const mergeDone = deliveryState?.merge?.status === "done";
  const policy = evaluateDeployPolicy({
    enabled,
    target,
    mergeDone,
    productionEnabled: process.env.AI_TEAM_ENABLE_PRODUCTION_DEPLOY === "1",
  });

  if (policy.decision === "skipped") {
    writeDeliveryState({ ...deliveryState, deploy: { status: "skipped", target, validation: policy.validation } });
    return writeWorkerResult(baseWorkerResult("deploy", {
      status: "skipped",
      taskId: task.id,
      summary: policy.summary,
      validation: policy.validation,
      next: null,
    }));
  }

  if (policy.decision === "blocked") {
    writeDeliveryState({ ...deliveryState, deploy: { status: "blocked", target, validation: policy.validation } });
    return writeWorkerResult(baseWorkerResult("deploy", {
      status: "blocked",
      taskId: task.id,
      summary: policy.summary,
      validation: policy.validation,
      next: "planner",
    }));
  }

  if (!(await commandExists("vercel"))) {
    return writeWorkerResult(baseWorkerResult("deploy", {
      status: "failed",
      taskId: task.id,
      summary: "要求 deploy，但本機找不到 vercel CLI。",
      validation: [...policy.validation, "vercel-missing"],
      next: "planner",
    }));
  }

  const deployArgs = target === "production"
    ? ["deploy", "--prod", "--yes"]
    : ["deploy", "--yes"];
  const deployResult = await runCommand("vercel", deployArgs, workerTimeoutMs.deploy);
  if (deployResult.code !== 0) {
    return writeWorkerResult(baseWorkerResult("deploy", {
      status: "failed",
      taskId: task.id,
      summary: `vercel ${target} deploy 失敗：${summarizeOutput(deployResult) || `exit ${deployResult.code}`}`,
      validation: [...policy.validation, `deploy-${target}-failed`],
      next: "planner",
    }));
  }

  const deployUrl = (deployResult.stdout || "").split(/\r?\n/).map((line) => line.trim()).find((line) => /^https?:\/\//.test(line)) || "";
  writeDeliveryState({
    ...deliveryState,
    deploy: {
      status: "done",
      target,
      url: deployUrl,
      validation: [...policy.validation, `deploy-target=${target}`],
    },
  });
  return writeWorkerResult(baseWorkerResult("deploy", {
    status: "done",
    taskId: task.id,
    summary: `${target} deploy 完成。`,
    validation: [...policy.validation, deployUrl ? `deploy-url=${deployUrl}` : "deploy-url=unknown"],
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
    case "merge-delivery":
      return mergeDeliveryWorker(task);
    case "deploy":
      return deployWorker(task);
    default:
      return writeWorkerResult(baseWorkerResult(worker, {
        status: "failed",
        taskId: task?.id || null,
        summary: `未知 worker：${worker}`,
        next: "planner",
      }));
  }
}

function finalizeTask(task, finalStatus, results) {
  if (!task?.id || smoke) return;
  const finalResult = results[results.length - 1] || null;
  const summary = finalResult?.summary || "";
  const queueStatus = finalStatus === "done" ? "completed" : finalStatus;

  syncTaskLifecycle(task, {
    status: queueStatus,
    completedAt: finalStatus === "done" ? nowIso() : undefined,
    blockedAt: finalStatus === "blocked" ? nowIso() : undefined,
    failedAt: finalStatus === "failed" ? nowIso() : undefined,
    lastSummary: summary,
    lastWorker: finalResult?.worker || null,
    lastValidation: finalResult?.validation || [],
  });

  writeCurrentTaskFromQueue(task, queueStatus.toUpperCase(), [
    `last worker: ${finalResult?.worker || "unknown"}`,
    `summary: ${summary || "（空）"}`,
  ]);
  const refreshedQueue = loadQueue();
  syncBacklogFromQueue(refreshedQueue);
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
      task = selectTask(loadQueue());
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
  finalizeTask(task, finalStatus, results);

  return results;
}

async function runSingleWorkerPipeline() {
  const queue = loadQueue();
  const existingLoopState = readJsonSafe(runtimeFiles.loopState, {});
  const queueTask = selectTask(queue);
  const task = queueTask || {
    id: existingLoopState.currentTaskId || "manual-worker-replay",
    title: existingLoopState.currentTaskTitle || `Replay ${onlyWorker}`,
    status: "running",
    lane: "manual-replay",
  };
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
