import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
export const root = path.resolve(path.dirname(scriptPath), "..", "..", "..");
export const aiTeamRoot = path.join(root, "AI_TEAM");
export const reportsDir = path.join(aiTeamRoot, "reports");
export const runtimeDir = path.join(aiTeamRoot, "runtime");

export const trackedFiles = {
  projectState: path.join(aiTeamRoot, "PROJECT_STATE.md"),
  launchCriteria: path.join(aiTeamRoot, "LAUNCH_CRITERIA.md"),
  acceptance: path.join(aiTeamRoot, "tasks", "acceptance.md"),
  currentTask: path.join(aiTeamRoot, "tasks", "current-task.md"),
  backlog: path.join(aiTeamRoot, "tasks", "backlog.md"),
  queue: path.join(aiTeamRoot, "tasks", "queue.json"),
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

export const runtimeFiles = {
  healthSummary: path.join(runtimeDir, "health-summary.md"),
  qaReport: path.join(runtimeDir, "qa-report.md"),
  browserQaReport: path.join(runtimeDir, "browser-qa.md"),
  errorSummary: path.join(runtimeDir, "error-summary.md"),
  staticQa: path.join(runtimeDir, "static-qa.md"),
  codeReview: path.join(runtimeDir, "code-review.md"),
  finalReport: path.join(runtimeDir, "final-report.md"),
  nextPrompt: path.join(runtimeDir, "next-codex-prompt.md"),
  runnerLog: path.join(runtimeDir, "runner-log.md"),
  pipelineState: path.join(runtimeDir, "pipeline-state.json"),
  loopState: path.join(runtimeDir, "loop-state.json"),
  deliveryState: path.join(runtimeDir, "delivery-state.json"),
  currentWorker: path.join(runtimeDir, "current-worker.json"),
  workerResult: path.join(runtimeDir, "worker-result.json"),
  heartbeat: path.join(runtimeDir, "heartbeat.json"),
  runnerLock: path.join(runtimeDir, "runner.lock.json"),
  qaLock: path.join(runtimeDir, "qa.lock.json"),
  codexLock: path.join(runtimeDir, "codex.lock.json"),
  codexPrompt: path.join(runtimeDir, "codex-exec-prompt.md"),
  codexLastMessage: path.join(runtimeDir, "codex-last-message.md"),
};

export function ensureRuntimeDir() {
  fs.mkdirSync(runtimeDir, { recursive: true });
}

export function readFileSafe(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

export function readPreferred(runtimePath, trackedPath) {
  const runtimeValue = readFileSafe(runtimePath).trim();
  if (runtimeValue) {
    return runtimeValue;
  }
  return readFileSafe(trackedPath).trim();
}

export function writeRuntimeFile(filePath, contents) {
  ensureRuntimeDir();
  fs.writeFileSync(filePath, `${contents.replace(/\s+$/, "")}\n`, "utf8");
}

export function extractTopItems(markdown, maxItems = 5) {
  return markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .slice(0, maxItems)
    .map((line) => line.slice(2).trim());
}

export function section(title, content) {
  return `\n## ${title}\n\n${content.trim() || "（空）"}\n`;
}
