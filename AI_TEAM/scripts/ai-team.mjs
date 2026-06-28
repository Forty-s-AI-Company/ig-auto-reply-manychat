import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(scriptPath), "..", "..");
const aiTeamRoot = path.join(root, "AI_TEAM");
const reportsDir = path.join(aiTeamRoot, "reports");

const files = {
  projectState: path.join(aiTeamRoot, "PROJECT_STATE.md"),
  launchCriteria: path.join(aiTeamRoot, "LAUNCH_CRITERIA.md"),
  acceptance: path.join(aiTeamRoot, "tasks", "acceptance.md"),
  currentTask: path.join(aiTeamRoot, "tasks", "current-task.md"),
  backlog: path.join(aiTeamRoot, "tasks", "backlog.md"),
  readme: path.join(aiTeamRoot, "README.md"),
  modelAssignment: path.join(aiTeamRoot, "MODEL_ASSIGNMENT.md"),
  runnerDesign: path.join(aiTeamRoot, "RUNNER_DESIGN.md"),
  worktreePolicy: path.join(aiTeamRoot, "WORKTREE_POLICY.md"),
  setupReport: path.join(reportsDir, "setup-report.md"),
  finalReport: path.join(reportsDir, "final-report.md"),
  qaReport: path.join(reportsDir, "qa-report.md"),
  browserQaReport: path.join(reportsDir, "browser-qa-report.md"),
  nextPrompt: path.join(reportsDir, "next-codex-prompt.md"),
};

const requiredPaths = [
  files.projectState,
  files.launchCriteria,
  files.acceptance,
  files.currentTask,
  files.backlog,
  files.readme,
  files.modelAssignment,
  files.runnerDesign,
  files.worktreePolicy,
  files.setupReport,
  files.finalReport,
  files.qaReport,
  files.browserQaReport,
  path.join(aiTeamRoot, "roles", "01-project-lead.md"),
  path.join(aiTeamRoot, "roles", "02-system-architect.md"),
  path.join(aiTeamRoot, "roles", "03-backend-lead.md"),
  path.join(aiTeamRoot, "roles", "04-frontend-worker.md"),
  path.join(aiTeamRoot, "roles", "05-qa-runner.md"),
  path.join(aiTeamRoot, "roles", "06-bug-fixer.md"),
  path.join(aiTeamRoot, "roles", "07-browser-qa.md"),
  path.join(aiTeamRoot, "roles", "08-security-reviewer.md"),
  path.join(aiTeamRoot, "roles", "09-report-writer.md"),
  path.join(aiTeamRoot, "roles", "10-prompt-engineer.md"),
  path.join(aiTeamRoot, "skills", "nextjs-skill.md"),
  path.join(aiTeamRoot, "skills", "supabase-skill.md"),
  path.join(aiTeamRoot, "skills", "meta-api-skill.md"),
  path.join(aiTeamRoot, "skills", "payuni-skill.md"),
  path.join(aiTeamRoot, "skills", "vercel-skill.md"),
  path.join(aiTeamRoot, "skills", "testing-skill.md"),
  path.join(aiTeamRoot, "skills", "security-skill.md"),
  path.join(aiTeamRoot, "scripts", "local-ai-team.ps1"),
  path.join(aiTeamRoot, "scripts", "local-qa.ps1"),
  path.join(aiTeamRoot, "scripts", "ai-team-runner.mjs"),
  path.join(aiTeamRoot, "scripts", "browser-qa-prompt.md"),
];

function read(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function ensureReportsDir() {
  fs.mkdirSync(reportsDir, { recursive: true });
}

function section(title, content) {
  return `\n## ${title}\n\n${content.trim() || "（空）"}\n`;
}

function extractTopItems(markdown, maxItems = 5) {
  return markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .slice(0, maxItems)
    .map((line) => line.slice(2).trim());
}

function buildStatus() {
  const currentTask = read(files.currentTask);
  const backlog = read(files.backlog);
  const projectState = read(files.projectState);
  const acceptance = read(files.acceptance);
  const finalReport = read(files.finalReport);

  const parts = [
    "# AI_TEAM 狀態",
    "",
    section("PROJECT_STATE", projectState),
    section("CURRENT_TASK", currentTask),
    section("ACCEPTANCE", acceptance),
    section(
      "BACKLOG 前幾項",
      extractTopItems(backlog).length ? extractTopItems(backlog).map((item) => `- ${item}`).join("\n") : "（沒有可讀到的待辦）",
    ),
    section("FINAL_REPORT 摘要", extractTopItems(finalReport, 6).length ? extractTopItems(finalReport, 6).map((item) => `- ${item}`).join("\n") : finalReport),
    "",
    "建議下一步：`npm run ai-team:next`",
  ];

  return parts.join("\n");
}

function buildNextPrompt() {
  const currentTask = read(files.currentTask).trim();
  const backlogItems = extractTopItems(read(files.backlog), 8);
  const prompt = [
    "請接續 InboxPilot / ReplyPilot 的 AI_TEAM 流程。",
    "",
    "請先讀取：",
    "- AI_TEAM/PROJECT_STATE.md",
    "- AI_TEAM/LAUNCH_CRITERIA.md",
    "- AI_TEAM/tasks/acceptance.md",
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
    "- 優先處理可見但不能用的產品功能，或把暫不支援功能改成清楚 disabled UX",
    "- 修改後補最小必要驗證與報告",
    "- 完成後更新 AI_TEAM/tasks/current-task.md、AI_TEAM/tasks/backlog.md、AI_TEAM/reports/dev-report.md、AI_TEAM/reports/final-report.md",
    "",
    "請直接從最高優先且可安全處理的任務開始，不要只停在建議。",
  ].join("\n");

  ensureReportsDir();
  fs.writeFileSync(files.nextPrompt, `${prompt}\n`, "utf8");
  return prompt;
}

function check() {
  const missing = requiredPaths.filter((filePath) => !fs.existsSync(filePath));

  if (missing.length > 0) {
    console.error("AI_TEAM 缺少以下檔案：");
    for (const filePath of missing) {
      console.error(`- ${path.relative(root, filePath)}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("AI_TEAM 長跑骨架完整。");
}

const command = (process.argv[2] || "status").toLowerCase();

if (command === "status") {
  console.log(buildStatus());
} else if (command === "next") {
  console.log(buildNextPrompt());
} else if (command === "check") {
  check();
} else if (command === "autopilot") {
  console.log([
    "# 舊 autopilot 已退役",
    "",
    "請改用：",
    "- `npm run ai-team`",
    "- `npm run ai-team:next`",
    "- `npm run ai-team:check`",
    "",
    "原因：AI_TEAM 流程已取代舊 autopilot 設計。",
  ].join("\n"));
} else {
  console.error(`未知指令：${command}`);
  process.exitCode = 1;
}
