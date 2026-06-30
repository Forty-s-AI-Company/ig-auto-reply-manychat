import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadProjectEnv } from "../../scripts/load-env.mjs";
import {
  readFileSafe,
  readPreferred,
  runtimeFiles,
  trackedFiles,
  writeRuntimeFile,
} from "./lib/ai-team-paths.mjs";

loadProjectEnv();

const MODEL_COMMAND = process.env.AI_TEAM_LOCAL_MODEL_COMMAND?.trim() || "ollama";
const MODEL_TIMEOUT_MS = Number(process.env.AI_TEAM_LOCAL_MODEL_TIMEOUT_MS || 120000);
const STRICT = process.argv.includes("--strict");
const thisFilePath = fileURLToPath(import.meta.url);
const onlyArg = process.argv.find((arg) => arg.startsWith("--only="))?.split("=")[1];
const onlyKeys = new Set((onlyArg || "").split(",").map((value) => value.trim()).filter(Boolean));
const requestedMode = process.argv.find((arg) => arg.startsWith("--mode="))?.split("=")[1]?.trim().toLowerCase() || "";
const SUPPORTED_MODES = new Set(["general", "advanced", "sleep"]);
const MODE = SUPPORTED_MODES.has(requestedMode) ? requestedMode : "general";

const MODEL_MODE_DEFAULTS = {
  general: {
    errorSummary: "qwen2.5-coder:1.5b",
    bugFixer: "qwen2.5-coder:7b",
    codeReview: "deepseek-coder-v2:lite",
    prompt: "qwen2.5-coder:7b",
    finalReport: "qwen2.5-coder:1.5b",
  },
  advanced: {
    errorSummary: "qwen2.5-coder:7b",
    bugFixer: "qwen2.5-coder:7b",
    codeReview: "deepseek-coder-v2:lite",
    prompt: "qwen3:8b",
    finalReport: "qwen2.5-coder:7b",
  },
  sleep: {
    errorSummary: "qwen2.5-coder:7b",
    bugFixer: "qwen2.5-coder:14b",
    codeReview: "qwen3-coder:30b",
    prompt: "qwen3:8b",
    finalReport: "qwen2.5-coder:7b",
  },
};

export function resolveModelAssignment(mode = MODE) {
  const normalizedMode = SUPPORTED_MODES.has(mode) ? mode : "general";
  const defaults = MODEL_MODE_DEFAULTS[normalizedMode];

  return {
    mode: normalizedMode,
    errorSummary: process.env.AI_TEAM_ERROR_SUMMARY_MODEL?.trim() || defaults.errorSummary,
    bugFixer: process.env.AI_TEAM_BUG_FIXER_MODEL?.trim() || defaults.bugFixer,
    codeReview: process.env.AI_TEAM_CODE_REVIEW_MODEL?.trim() || defaults.codeReview,
    prompt: process.env.AI_TEAM_PROMPT_MODEL?.trim() || defaults.prompt,
    finalReport: process.env.AI_TEAM_FINAL_REPORT_MODEL?.trim() || defaults.finalReport,
  };
}

const modelAssignment = resolveModelAssignment(MODE);

function modeLabel(mode = modelAssignment.mode) {
  if (mode === "sleep") return "睡覺模式";
  if (mode === "advanced") return "高級模式";
  return "一般模式";
}

const MODEL_PLAN = [
  {
    key: "error-summary",
    role: "Error Summarizer",
    model: modelAssignment.errorSummary,
    output: runtimeFiles.errorSummary,
    buildPrompt: (context) => [
      "你是 InboxPilot AI_TEAM 的 Error Summarizer。",
      `目前執行模式：${modeLabel()}。`,
      "請根據以下 QA / build / test 狀態，整理成精簡繁體中文 Markdown。",
      "只輸出這三段：",
      "1. 現況摘要",
      "2. 主要阻塞（P0/P1/P2）",
      "3. 建議先修哪一件",
      "",
      context,
    ].join("\n"),
  },
  {
    key: "static-qa",
    role: "Bug Fixer",
    model: modelAssignment.bugFixer,
    output: runtimeFiles.staticQa,
    buildPrompt: (context) => [
      "你是 InboxPilot AI_TEAM 的 Bug Fixer。",
      `目前執行模式：${modeLabel()}。`,
      "請針對目前狀態提出最小可安全修補建議。",
      "限制：不要建議 production DB、migration、Production deploy。",
      "只輸出這四段：",
      "1. 可安全自動處理",
      "2. 暫時不要動",
      "3. 最小修補順序",
      "4. 建議驗證指令",
      "",
      context,
    ].join("\n"),
  },
  {
    key: "code-review",
    role: "Code Reviewer",
    model: modelAssignment.codeReview,
    output: runtimeFiles.codeReview,
    buildPrompt: (context) => [
      "你是 InboxPilot AI_TEAM 的 Code Reviewer / Security Assistant。",
      `目前執行模式：${modeLabel()}。`,
      "請從安全性、穩定性、可維護性三個面向，對目前狀態做簡短 review。",
      "只輸出這四段：",
      "1. 目前風險",
      "2. 可接受風險",
      "3. 不可忽略風險",
      "4. 建議 Codex 複查項目",
      "",
      context,
    ].join("\n"),
  },
  {
    key: "next-prompt",
    role: "Prompt Engineer",
    model: modelAssignment.prompt,
    output: runtimeFiles.nextPrompt,
    buildPrompt: (context) => [
      "你是 InboxPilot AI_TEAM 的 Prompt Engineer。",
      `目前執行模式：${modeLabel()}。`,
      "請產出下一輪給 Codex 的可直接執行提示詞。",
      "用繁體中文，必須包含：目標、範圍、安全限制、驗證、完成後回報格式。",
      "請直接輸出 prompt 內容，不要加前言。",
      "",
      context,
    ].join("\n"),
  },
  {
    key: "final-report",
    role: "Final Report Writer",
    model: modelAssignment.finalReport,
    output: runtimeFiles.finalReport,
    buildPrompt: (context) => [
      "你是 InboxPilot AI_TEAM 的 Final Report Writer。",
      `目前執行模式：${modeLabel()}。`,
      "請把目前狀態整理成精簡繁體中文 Markdown。",
      "只輸出這四段：",
      "1. 本輪完成",
      "2. 剩餘 P0/P1",
      "3. 需要人工處理",
      "4. 下一步",
      "",
      context,
    ].join("\n"),
  },
];

export function parseInstalledModelNames(output) {
  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(1)
    .map((line) => line.split(/\s{2,}/)[0]?.trim())
    .filter(Boolean);
}

function stripAnsi(text) {
  return text.replace(/\u001b\[[0-9;]*[A-Za-z]/g, "");
}

function runCapture(command, args, timeoutMs = MODEL_TIMEOUT_MS) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
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
      resolve({ code: 124, stdout, stderr: `${stderr}${stderr ? "\n" : ""}timeout after ${timeoutMs}ms` });
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
      resolve({ code: 1, stdout, stderr: `${stderr}${stderr ? "\n" : ""}${error.message}` });
    });

    child.on("exit", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ code: code ?? 1, stdout, stderr });
    });
  });
}

function collectContext() {
  const currentTask = readFileSafe(trackedFiles.currentTask).trim();
  const backlog = readFileSafe(trackedFiles.backlog).trim();
  const projectState = readFileSafe(trackedFiles.projectState).trim();
  const launchCriteria = readFileSafe(trackedFiles.launchCriteria).trim();
  const qaReport = readPreferred(runtimeFiles.qaReport, trackedFiles.qaReport);
  const browserQaReport = readPreferred(runtimeFiles.browserQaReport, trackedFiles.browserQaReport);
  const existingFinalReport = readPreferred(runtimeFiles.finalReport, trackedFiles.finalReport);

  return [
    "# CONTEXT",
    "",
    "## MODE",
    modeLabel(),
    "",
    "## PROJECT_STATE",
    projectState || "（空）",
    "",
    "## CURRENT_TASK",
    currentTask || "（空）",
    "",
    "## BACKLOG",
    backlog || "（空）",
    "",
    "## LAUNCH_CRITERIA",
    launchCriteria || "（空）",
    "",
    "## QA_REPORT",
    qaReport || "（空）",
    "",
    "## BROWSER_QA_REPORT",
    browserQaReport || "（空）",
    "",
    "## EXISTING_FINAL_REPORT",
    existingFinalReport || "（空）",
  ].join("\n");
}

async function listInstalledModels() {
  const result = await runCapture(MODEL_COMMAND, ["list"], 20000);
  if (result.code !== 0) {
    return {
      ok: false,
      models: [],
      reason: result.stderr.trim() || result.stdout.trim() || `${MODEL_COMMAND} list failed`,
    };
  }

  return {
    ok: true,
    models: parseInstalledModelNames(result.stdout),
    reason: "",
  };
}

async function runModel(plan, context, installedModelNames) {
  if (!installedModelNames.includes(plan.model)) {
    const message = [
      `# ${plan.role}`,
      "",
      `- STATUS: SKIP`,
      `- REASON: 本機找不到模型 \`${plan.model}\`。`,
      `- COMMAND: \`${MODEL_COMMAND} list\``,
    ].join("\n");
    writeRuntimeFile(plan.output, message);
    return { key: plan.key, status: "SKIP", details: `missing model ${plan.model}` };
  }

  const prompt = plan.buildPrompt(context);
  const result = await runCapture(MODEL_COMMAND, ["run", plan.model, prompt]);

  if (result.code !== 0) {
    const message = [
      `# ${plan.role}`,
      "",
      `- STATUS: FAIL`,
      `- MODEL: \`${plan.model}\``,
      `- REASON: ${result.stderr.trim() || result.stdout.trim() || `exit code ${result.code}`}`,
    ].join("\n");
    writeRuntimeFile(plan.output, message);
    return { key: plan.key, status: "FAIL", details: `model ${plan.model} failed` };
  }

  writeRuntimeFile(
    plan.output,
    stripAnsi(result.stdout).trim() || `# ${plan.role}\n\n- STATUS: WARN\n- REASON: 模型未輸出內容。`,
  );
  return { key: plan.key, status: "PASS", details: plan.model };
}

export async function main() {
  const installed = await listInstalledModels();

  if (!installed.ok) {
    const message = [
      "# Local Model Orchestrator",
      "",
      `- STATUS: ${STRICT ? "FAIL" : "WARN"}`,
      `- REASON: 無法讀取本地模型清單。${installed.reason}`,
      `- COMMAND: \`${MODEL_COMMAND} list\``,
    ].join("\n");

    writeRuntimeFile(runtimeFiles.errorSummary, message);
    writeRuntimeFile(runtimeFiles.staticQa, message);
    writeRuntimeFile(runtimeFiles.codeReview, message);
    writeRuntimeFile(runtimeFiles.finalReport, message);
    writeRuntimeFile(runtimeFiles.nextPrompt, "請先修復本地 Ollama / AI_TEAM 模型環境，再繼續下一輪自動化。");
    process.exit(STRICT ? 1 : 0);
  }

  const context = collectContext();
  const results = [];

  const plans = onlyKeys.size > 0 ? MODEL_PLAN.filter((plan) => onlyKeys.has(plan.key)) : MODEL_PLAN;

  for (const plan of plans) {
    results.push(await runModel(plan, context, installed.models));
  }

  const failed = results.some((result) => result.status === "FAIL");
  if (failed && STRICT) {
    process.exit(1);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === thisFilePath) {
  await main();
}
