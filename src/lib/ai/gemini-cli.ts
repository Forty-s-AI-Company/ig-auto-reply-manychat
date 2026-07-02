import { spawn } from "node:child_process";

export function getGeminiCliCommandCandidates() {
  return [
    process.env.ANTIGRAVITY_CLI_COMMAND,
    process.env.GEMINI_CLI_COMMAND,
    "agy",
    "gemini",
    "antigravity",
  ].filter((value): value is string => Boolean(value && value.trim()));
}

function runGeminiCliOnce(prompt: string, model: string, command: string, timeoutMs: number) {
  const args = model && model !== "auto" ? ["-m", model, "-p", prompt] : ["-p", prompt];
  const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });

  return new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    const errors: Buffer[] = [];
    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error("Antigravity CLI timed out."));
    }, timeoutMs);

    child.stdout.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    child.stderr.on("data", (chunk) => errors.push(Buffer.from(chunk)));
    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.on("exit", (code) => {
      clearTimeout(timeout);
      if (code === 0) {
        resolve(Buffer.concat(chunks).toString("utf8").trim());
      } else {
        reject(new Error(Buffer.concat(errors).toString("utf8") || `Antigravity CLI exited with code ${code}.`));
      }
    });
  });
}

function isMissingCommandError(error: unknown) {
  return Boolean(error && typeof error === "object" && "code" in error && (error as NodeJS.ErrnoException).code === "ENOENT");
}

async function runGeminiCli(prompt: string, model: string) {
  const timeoutMs = Number(process.env.ANTIGRAVITY_CLI_TIMEOUT_MS || process.env.GEMINI_CLI_TIMEOUT_MS || 45000);
  const commands = getGeminiCliCommandCandidates();
  let lastError: unknown = null;

  for (const command of commands) {
    try {
      return await runGeminiCliOnce(prompt, model, command, timeoutMs);
    } catch (error) {
      if (!isMissingCommandError(error)) throw error;
      lastError = error;
    }
  }

  throw lastError ?? new Error("Antigravity CLI is not available.");
}

export async function generateGeminiCliReply(prompt: string, model: string) {
  return runGeminiCli(prompt, model);
}
