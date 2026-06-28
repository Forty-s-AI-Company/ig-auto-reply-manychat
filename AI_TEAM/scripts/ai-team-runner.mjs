import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(scriptPath), "..", "..");
const aiTeamRoot = path.join(root, "AI_TEAM");
const reportsDir = path.join(aiTeamRoot, "reports");
const logFile = path.join(reportsDir, "runner-log.md");
const nextPromptFile = path.join(reportsDir, "next-codex-prompt.md");

const intervalInput = Number.parseInt(process.argv.find((arg) => arg.startsWith("--interval="))?.split("=")[1] || "15", 10);
const intervalMinutes = Number.isFinite(intervalInput) && intervalInput > 0 ? intervalInput : 15;
const once = process.argv.includes("--once");
const maxCyclesArg = process.argv.find((arg) => arg.startsWith("--cycles="))?.split("=")[1];
const parsedMaxCycles = maxCyclesArg ? Number.parseInt(maxCyclesArg, 10) : Number.POSITIVE_INFINITY;
const maxCycles = Number.isFinite(parsedMaxCycles) && parsedMaxCycles > 0 ? parsedMaxCycles : Number.POSITIVE_INFINITY;
const quiet = process.argv.includes("--quiet");

const filesToWatch = [
  path.join(aiTeamRoot, "PROJECT_STATE.md"),
  path.join(aiTeamRoot, "LAUNCH_CRITERIA.md"),
  path.join(aiTeamRoot, "tasks", "current-task.md"),
  path.join(aiTeamRoot, "tasks", "backlog.md"),
  path.join(aiTeamRoot, "reports", "final-report.md"),
  path.join(aiTeamRoot, "reports", "qa-report.md"),
];

function read(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function ensureReportsDir() {
  fs.mkdirSync(reportsDir, { recursive: true });
}

function hashText(text) {
  return crypto.createHash("sha1").update(text).digest("hex");
}

function buildSnapshot() {
  return filesToWatch
    .map((filePath) => {
      const rel = path.relative(root, filePath);
      return `${rel}\n${hashText(read(filePath))}`;
    })
    .join("\n---\n");
}

function nowLabel() {
  return new Intl.DateTimeFormat("zh-TW", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date());
}

function extractTopItems(markdown, maxItems = 5) {
  return markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .slice(0, maxItems)
    .map((line) => line.slice(2).trim());
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

  return {
    branch,
    dirtyCount,
    worktreeCount,
  };
}

function getQaHealth() {
  const qaReport = read(path.join(aiTeamRoot, "reports", "qa-report.md"));
  if (!qaReport.trim()) return "unknown";
  if (qaReport.includes("：FAIL") || qaReport.includes(": FAIL")) return "FAIL";
  if (qaReport.includes("：WARN") || qaReport.includes(": WARN")) return "WARN";
  if (qaReport.includes("：PASS") || qaReport.includes(": PASS")) return "PASS";
  return "unknown";
}

function buildStatus() {
  const projectState = read(path.join(aiTeamRoot, "PROJECT_STATE.md"));
  const currentTask = read(path.join(aiTeamRoot, "tasks", "current-task.md"));
  const backlog = read(path.join(aiTeamRoot, "tasks", "backlog.md"));
  const finalReport = read(path.join(aiTeamRoot, "reports", "final-report.md"));
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
    `- mode: ${once ? "once" : "loop"}`,
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
  ].join("\n");
}

function buildNextPrompt() {
  const currentTask = read(path.join(aiTeamRoot, "tasks", "current-task.md")).trim();
  const backlogItems = extractTopItems(read(path.join(aiTeamRoot, "tasks", "backlog.md")), 8);
  return [
    "請接續 InboxPilot / ReplyPilot 的 AI_TEAM 長跑流程。",
    "",
    "請先讀取：",
    "- AI_TEAM/PROJECT_STATE.md",
    "- AI_TEAM/LAUNCH_CRITERIA.md",
    "- AI_TEAM/tasks/current-task.md",
    "- AI_TEAM/tasks/backlog.md",
    "- AI_TEAM/reports/final-report.md",
    "- AI_TEAM/reports/qa-report.md",
    "",
    "目前任務摘要：",
    currentTask || "（空）",
    "",
    "優先待辦：",
    ...(backlogItems.length ? backlogItems.map((item) => `- ${item}`) : ["- （空）"]),
    "",
    "安全限制：",
    "- 不碰 production DB",
    "- 不部署 Production",
    "- 不送 Meta App Review",
    "- 不切 PayUNI production",
    "- 不輸出 secret",
    "",
    "執行要求：",
    "- 只處理可安全自動化的任務",
    "- 修改後補最小必要驗證與報告",
    "- 完成後更新 AI_TEAM/tasks/current-task.md、AI_TEAM/tasks/backlog.md、AI_TEAM/reports/dev-report.md、AI_TEAM/reports/final-report.md",
    "",
    "請直接從最高優先且可安全處理的任務開始，不要只停在建議。",
  ].join("\n");
}

function appendLog(block) {
  ensureReportsDir();
  const header = `\n\n---\n\n## ${nowLabel()}\n`;
  fs.appendFileSync(logFile, `${header}${block.trim()}\n`, "utf8");
}

function emit(block) {
  if (!quiet) {
    console.log(block);
  }
}

async function main() {
  ensureReportsDir();
  let previous = "";
  let cycles = 0;

  while (cycles < maxCycles) {
    cycles += 1;
    const snapshot = buildSnapshot();
    if (snapshot !== previous) {
      previous = snapshot;
      const status = buildStatus();
      const prompt = buildNextPrompt();
      const output = [
        status,
        "",
        "## NEXT_PROMPT",
        prompt,
      ].join("\n");
      fs.writeFileSync(nextPromptFile, `${prompt}\n`, "utf8");
      emit(output);
      appendLog(output);
    } else {
      const msg = `AI_TEAM 無變更，${intervalMinutes} 分鐘後再檢查。`;
      emit(msg);
      appendLog(msg);
    }

    if (once) break;
    await new Promise((resolve) => setTimeout(resolve, intervalMinutes * 60 * 1000));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
