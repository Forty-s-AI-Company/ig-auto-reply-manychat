import http from "node:http";
import net from "node:net";
import { spawn } from "node:child_process";
import { loadProjectEnv } from "../../scripts/load-env.mjs";
import { runtimeFiles, writeRuntimeFile } from "./lib/ai-team-paths.mjs";

loadProjectEnv();

const baseUrl = (process.env.AI_TEAM_BROWSER_QA_BASE_URL?.trim() || "http://127.0.0.1:3041").replace(/\/$/, "");
const timeoutMs = Number(process.env.AI_TEAM_BROWSER_QA_TIMEOUT_MS || 180000);
const loginUrl = new URL("/login", baseUrl).toString();
const browserQaArgs = [
  "playwright",
  "test",
  "tests/e2e/ai-team-browser-smoke.spec.ts",
  "--project=chromium",
];

let devServerProcess = null;

function checkPort(host, port, timeoutMs = 1500) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    let settled = false;

    const finish = (ok) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(ok);
    };

    socket.setTimeout(timeoutMs);
    socket.on("connect", () => finish(true));
    socket.on("timeout", () => finish(false));
    socket.on("error", () => finish(false));
  });
}

function checkHttpReachable(targetUrl, timeoutMs = 3000) {
  return new Promise((resolve) => {
    const request = http.get(
      targetUrl,
      {
        timeout: timeoutMs,
        headers: {
          connection: "close",
        },
      },
      (response) => {
        response.resume();
        resolve(response.statusCode ? response.statusCode < 500 : true);
      },
    );

    request.on("timeout", () => {
      request.destroy();
      resolve(false);
    });

    request.on("error", () => {
      resolve(false);
    });
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForPort(host, port, timeoutMs = 30000) {
  const startedAt = Date.now();
  while (!(await checkPort(host, port, 1000))) {
    if (Date.now() - startedAt >= timeoutMs) {
      throw new Error(`等待 ${host}:${port} 啟動逾時`);
    }
    await wait(500);
  }
}

function runTaskkill(pid) {
  return new Promise((resolve) => {
    const child = spawn("taskkill.exe", ["/PID", String(pid), "/T", "/F"], {
      stdio: "ignore",
      windowsHide: true,
    });

    child.on("exit", () => resolve());
    child.on("error", () => resolve());
  });
}

async function stopDevServerProcessTree() {
  if (!devServerProcess?.pid) {
    devServerProcess = null;
    return;
  }

  const pid = devServerProcess.pid;
  devServerProcess = null;

  if (process.platform === "win32") {
    await runTaskkill(pid);
    return;
  }

  try {
    process.kill(pid, "SIGTERM");
  } catch {
    return;
  }
}

async function ensureBaseServer() {
  const url = new URL(baseUrl);
  const port = Number(url.port || 80);

  if ((await checkPort(url.hostname, port)) && (await checkHttpReachable(loginUrl, 5000))) {
    return { started: false };
  }

  if (await checkPort(url.hostname, port)) {
    throw new Error(`偵測到 ${baseUrl} 已被佔用，但 /login 沒有正常回應。請先清掉殘留的本機 dev server。`);
  }

  const command = process.platform === "win32" ? "cmd.exe" : "npm";
  const commandArgs = process.platform === "win32" ? ["/d", "/s", "/c", "npm run dev"] : ["run", "dev"];

  devServerProcess = spawn(command, commandArgs, {
    cwd: process.cwd(),
    stdio: ["ignore", "pipe", "pipe"],
    shell: false,
  });

  devServerProcess.stdout?.on("data", (chunk) => {
    const text = chunk.toString("utf8");
    if (text.trim()) {
      process.stdout.write(text);
    }
  });

  devServerProcess.stderr?.on("data", (chunk) => {
    const text = chunk.toString("utf8");
    if (text.trim()) {
      process.stderr.write(text);
    }
  });

  await waitForPort(url.hostname, port, 60000);

  const startedAt = Date.now();
  while (!(await checkHttpReachable(loginUrl, 5000))) {
    if (Date.now() - startedAt >= 60000) {
      throw new Error(`dev server 已監聽 ${baseUrl}，但 /login 在 60 秒內仍未可用。`);
    }
    await wait(1000);
  }

  return { started: true };
}

function runCapture(command, args, env) {
  return new Promise((resolve) => {
    const child =
      process.platform === "win32" && command === "npx"
        ? spawn("cmd.exe", ["/d", "/s", "/c", `${command} ${args.join(" ")}`], {
            cwd: process.cwd(),
            env,
            stdio: ["ignore", "pipe", "pipe"],
          })
        : spawn(command, args, {
            cwd: process.cwd(),
            env,
            stdio: ["ignore", "pipe", "pipe"],
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

function renderReport(status, details, output = "") {
  const body = [
    "# Browser QA",
    "",
    `- STATUS: ${status}`,
    "- ENGINE: Playwright Test Runner",
    `- BASE_URL: ${baseUrl}`,
    `- DETAILS: ${details}`,
    "",
    "## 原始摘要",
    "",
    output.trim() || "- （空）",
  ].join("\n");

  writeRuntimeFile(runtimeFiles.browserQaReport, body);
}

async function main() {
  try {
    await ensureBaseServer();

    const env = {
      ...process.env,
      CI: "",
    };

    const result = await runCapture("npx", browserQaArgs, env);
    if (result.code !== 0) {
      const combined = [result.stdout.trim(), result.stderr.trim()].filter(Boolean).join("\n\n");
      renderReport("FAIL", `Playwright smoke 失敗，exit=${result.code}`, combined);
      process.exit(result.code);
    }

    renderReport("PASS", "Playwright smoke 通過。", result.stdout);
  } catch (error) {
    renderReport("FAIL", error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await stopDevServerProcessTree();
  }
}

await main();
