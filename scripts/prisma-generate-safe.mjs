import { existsSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";

const clientPath = join(process.cwd(), "node_modules", ".prisma", "client");

function runGenerate() {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ["scripts/prisma-env.mjs", "generate"], {
      cwd: process.cwd(),
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    const stdout = [];
    const stderr = [];

    child.stdout.on("data", (chunk) => {
      stdout.push(Buffer.from(chunk));
      process.stdout.write(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr.push(Buffer.from(chunk));
      process.stderr.write(chunk);
    });
    child.on("exit", (code) => {
      resolve({
        code,
        output: `${Buffer.concat(stdout).toString("utf8")}\n${Buffer.concat(stderr).toString("utf8")}`,
      });
    });
  });
}

const result = await runGenerate();
if (result.code === 0) process.exit(0);

const lockedWindowsEngine =
  process.platform === "win32" &&
  /EPERM: operation not permitted, rename/.test(result.output) &&
  /query_engine-windows\.dll\.node/.test(result.output) &&
  existsSync(clientPath);

if (lockedWindowsEngine) {
  console.warn("[prisma-generate-safe] Prisma engine is locked by a local Node process; reusing existing generated client.");
  process.exit(0);
}

process.exit(result.code || 1);
