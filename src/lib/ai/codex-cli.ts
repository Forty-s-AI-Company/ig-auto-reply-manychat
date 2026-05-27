import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

function runCodexCli(prompt: string, outputPath: string, model: string) {
  const timeoutMs = Number(process.env.CODEX_CLI_TIMEOUT_MS || 45000);
  const modelArgs = model && model !== "auto" ? ["--model", model] : [];
  const child = spawn(
    process.env.CODEX_CLI_COMMAND || "codex",
    [
      "exec",
      "--ephemeral",
      ...modelArgs,
      "--skip-git-repo-check",
      "--sandbox",
      "read-only",
      "--ask-for-approval",
      "never",
      "--output-last-message",
      outputPath,
      "-",
    ],
    { stdio: ["pipe", "ignore", "ignore"] },
  );

  child.stdin.end(prompt);

  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error("Codex CLI timed out."));
    }, timeoutMs);

    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.on("exit", (code) => {
      clearTimeout(timeout);
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Codex CLI exited with code ${code}.`));
      }
    });
  });
}

export async function generateCodexCliReply(prompt: string, model = "auto") {
  const workspace = await mkdtemp(join(tmpdir(), "pca-codex-"));
  const outputPath = join(workspace, "reply.txt");

  try {
    await runCodexCli(prompt, outputPath, model);
    return (await readFile(outputPath, "utf8")).trim();
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
}
