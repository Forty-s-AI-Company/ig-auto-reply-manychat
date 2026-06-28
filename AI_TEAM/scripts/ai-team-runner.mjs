import crypto from "node:crypto";
import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";
import {
  extractTopItems,
  readFileSafe,
  readPreferred,
  root,
  runtimeFiles,
  trackedFiles,
  writeRuntimeFile,
} from "./lib/ai-team-paths.mjs";

const intervalInput = Number.parseInt(process.argv.find((arg) => arg.startsWith("--interval="))?.split("=")[1] || "15", 10);
const intervalMinutes = Number.isFinite(intervalInput) && intervalInput > 0 ? intervalInput : 15;
const once = process.argv.includes("--once");
const alwaysRun = process.argv.includes("--always-run");
const requestedMode = process.argv.find((arg) => arg.startsWith("--mode="))?.split("=")[1]?.trim().toLowerCase() || "";
const runnerMode = requestedMode === "sleep" ? "sleep" : "general";
const maxCyclesArg = process.argv.find((arg) => arg.startsWith("--cycles="))?.split("=")[1];
const parsedMaxCycles = maxCyclesArg ? Number.parseInt(maxCyclesArg, 10) : Number.POSITIVE_INFINITY;
const maxCycles = Number.isFinite(parsedMaxCycles) && parsedMaxCycles > 0 ? parsedMaxCycles : Number.POSITIVE_INFINITY;
const quiet = process.argv.includes("--quiet");

const filesToWatch = [
  trackedFiles.projectState,
  trackedFiles.launchCriteria,
  trackedFiles.currentTask,
  trackedFiles.backlog,
  runtimeFiles.finalReport,
  runtimeFiles.qaReport,
  runtimeFiles.browserQaReport,
];

function hashText(text) {
  return crypto.createHash("sha1").update(text).digest("hex");
}

function buildSnapshot() {
  return filesToWatch
    .map((filePath) => `${filePath}\n${hashText(readFileSafe(filePath))}`)
    .join("\n---\n");
}

function nowLabel() {
  return new Intl.DateTimeFormat("zh-TW", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date());
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

function buildHealthSummary() {
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

function appendLog(block) {
  const header = `\n\n---\n\n## ${nowLabel()}\n`;
  try {
    fs.appendFileSync(runtimeFiles.runnerLog, `${header}${block.trim()}\n`, "utf8");
  } catch (error) {
    const code = error instanceof Error && "code" in error ? error.code : "";
    if (code === "EBUSY" || code === "EPERM") {
      return;
    }
    throw error;
  }
}

function emit(block) {
  if (!quiet) {
    console.log(block);
  }
}

function runNodeScript(scriptPath, args = []) {
  return new Promise((resolve) => {
    const child = spawn("node", [scriptPath, ...args], {
      cwd: root,
      stdio: "inherit",
      env: process.env,
    });

    child.on("exit", (code) => resolve(code ?? 1));
    child.on("error", () => resolve(1));
  });
}

async function runPipeline() {
  const qaArgs = (process.env.AI_TEAM_RUNNER_QA_ARGS || "")
    .split(/\s+/)
    .map((value) => value.trim())
    .filter(Boolean);
  const modelArgs = (process.env.AI_TEAM_RUNNER_MODEL_ARGS || "")
    .split(/\s+/)
    .map((value) => value.trim())
    .filter(Boolean);
  const modelArgsWithMode = modelArgs.some((arg) => arg.startsWith("--mode="))
    ? modelArgs
    : [...modelArgs, `--mode=${runnerMode}`];

  const steps = [
    {
      name: "qa",
      script: "AI_TEAM/scripts/local-qa.mjs",
      args: qaArgs,
    },
    {
      name: "local-models",
      script: "AI_TEAM/scripts/local-models.mjs",
      args: modelArgsWithMode,
    },
  ];

  const results = [];
  for (const step of steps) {
    const code = await runNodeScript(step.script, step.args);
    results.push({ ...step, code });
  }
  return results;
}

function buildPipelineSummary(results) {
  return [
    "## PIPELINE",
    ...results.map((result) => `- ${result.name}: ${result.code === 0 ? "PASS" : `FAIL (exit ${result.code})`}`),
  ].join("\n");
}

async function main() {
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
      const results = await runPipeline();
      const healthSummary = buildHealthSummary();
      const pipelineSummary = buildPipelineSummary(results);
      const output = [healthSummary, "", pipelineSummary].join("\n");

      writeRuntimeFile(runtimeFiles.healthSummary, output);
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
