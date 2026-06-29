import fs from "node:fs";
import path from "node:path";
import {
  aiTeamRoot,
  extractTopItems,
  readFileSafe,
  readPreferred,
  reportsDir,
  root,
  runtimeFiles,
  section,
  trackedFiles,
  writeRuntimeFile,
} from "./lib/ai-team-paths.mjs";

const requiredPaths = [
  trackedFiles.projectState,
  trackedFiles.launchCriteria,
  trackedFiles.acceptance,
  trackedFiles.currentTask,
  trackedFiles.backlog,
  trackedFiles.queue,
  trackedFiles.readme,
  trackedFiles.modelAssignment,
  trackedFiles.runnerDesign,
  trackedFiles.worktreePolicy,
  trackedFiles.setupReport,
  trackedFiles.finalReport,
  trackedFiles.qaReport,
  trackedFiles.browserQaReport,
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
  path.join(aiTeamRoot, "scripts", "codex-dev.mjs"),
  path.join(aiTeamRoot, "scripts", "playwright-browser-qa.mjs"),
  path.join(aiTeamRoot, "scripts", "browser-qa-prompt.md"),
  path.join(aiTeamRoot, "scripts", "lib", "process-lock.mjs"),
];

function getFinalReportText() {
  return readPreferred(runtimeFiles.finalReport, trackedFiles.finalReport);
}

function getQaReportText() {
  return readPreferred(runtimeFiles.qaReport, trackedFiles.qaReport);
}

function extractActionableItems(markdown, maxItems = 5) {
  return markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- `[" ) || line.startsWith("- ["))
    .slice(0, maxItems)
    .map((line) => line.slice(2).trim());
}

function buildStatus() {
  const currentTask = readFileSafe(trackedFiles.currentTask);
  const backlog = readFileSafe(trackedFiles.backlog);
  const projectState = readFileSafe(trackedFiles.projectState);
  const acceptance = readFileSafe(trackedFiles.acceptance);
  const finalReport = getFinalReportText();
  const qaReport = getQaReportText();

  const parts = [
    "# AI_TEAM 狀態",
    "",
    section("PROJECT_STATE", projectState),
    section("CURRENT_TASK", currentTask),
    section("ACCEPTANCE", acceptance),
    section(
      "BACKLOG 前幾項",
      extractActionableItems(backlog).length
        ? extractActionableItems(backlog).map((item) => `- ${item}`).join("\n")
        : "（沒有可讀到的待辦）",
    ),
    section("FINAL_REPORT 摘要", extractTopItems(finalReport, 6).length ? extractTopItems(finalReport, 6).map((item) => `- ${item}`).join("\n") : finalReport),
    section("LATEST_QA 摘要", extractTopItems(qaReport, 6).length ? extractTopItems(qaReport, 6).map((item) => `- ${item}`).join("\n") : qaReport),
    "",
    "建議下一步：`npm run ai-team:next` 或 `npm run ai-team:dev`",
    "長跑模式：`npm run ai-team:loop:continuous` 或 `npm run ai-team:loop:continuous:sleep`",
  ];

  return parts.join("\n");
}

function buildFallbackNextPrompt() {
  const currentTask = readFileSafe(trackedFiles.currentTask).trim();
  const backlogItems = extractActionableItems(readFileSafe(trackedFiles.backlog), 8);
  return [
    "請接續 InboxPilot / ReplyPilot 的 AI_TEAM 開發閉環流程。",
    "",
    "請先讀取：",
    "- AI_TEAM/PROJECT_STATE.md",
    "- AI_TEAM/LAUNCH_CRITERIA.md",
    "- AI_TEAM/tasks/acceptance.md",
    "- AI_TEAM/tasks/current-task.md",
    "- AI_TEAM/tasks/backlog.md",
    "- AI_TEAM/runtime/final-report.md（若存在）",
    "- AI_TEAM/runtime/qa-report.md（若存在）",
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
    "- Codex CLI 直接做本輪實作，不要只寫建議",
    "- 優先處理可見但不能用的產品功能，或把暫不支援功能改成清楚 disabled UX",
    "- 修改後補最小必要驗證與報告",
    "- 完成後更新 AI_TEAM/tasks/current-task.md、AI_TEAM/tasks/backlog.md、AI_TEAM/reports/dev-report.md、AI_TEAM/reports/final-report.md",
    "",
    "請直接從最高優先且可安全處理的任務開始，不要只停在建議。",
  ].join("\n");
}

function buildNextPrompt() {
  const prompt = buildFallbackNextPrompt();
  writeRuntimeFile(runtimeFiles.nextPrompt, prompt);
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

  fs.mkdirSync(reportsDir, { recursive: true });
  fs.mkdirSync(path.join(aiTeamRoot, "runtime"), { recursive: true });
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
    "- `npm run ai-team:qa`",
    "- `npm run ai-team:dev`",
    "- `npm run ai-team:loop:continuous`",
    "- `npm run ai-team:loop:continuous:sleep`",
    "",
    "原因：AI_TEAM 流程已取代舊 autopilot 設計，並改把執行期輸出寫到 `AI_TEAM/runtime/`。",
  ].join("\n"));
} else {
  console.error(`未知指令：${command}`);
  process.exitCode = 1;
}
