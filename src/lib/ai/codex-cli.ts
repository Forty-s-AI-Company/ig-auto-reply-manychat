import { spawn } from "child_process";
import { mkdtemp, readFile, rm } from "fs/promises";
import { tmpdir } from "os";
import { sep } from "path";

function runCodexCli(prompt: string, outputPath: string) {
  const timeoutMs = Number(process.env.CODEX_CLI_TIMEOUT_MS || 45000);
  const child = spawn(
    process.env.CODEX_CLI_COMMAND || "codex",
    [
      "exec",
      "--ephemeral",
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

export async function generateCodexCliReply(prompt: string) {
  const workspace = await mkdtemp(`${tmpdir()}${sep}pca-codex-`);
  const outputPath = `${workspace}${sep}reply.txt`;

  try {
    await runCodexCli(prompt, outputPath);
    return (await readFile(outputPath, "utf8")).trim();
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
}
