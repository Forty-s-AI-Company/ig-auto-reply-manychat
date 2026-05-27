import { spawn } from "node:child_process";

async function runGeminiCli(prompt: string, model: string) {
  const timeoutMs = Number(process.env.ANTIGRAVITY_CLI_TIMEOUT_MS || process.env.GEMINI_CLI_TIMEOUT_MS || 45000);
  const command = process.env.ANTIGRAVITY_CLI_COMMAND || process.env.GEMINI_CLI_COMMAND || "antigravity";
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

export async function generateGeminiCliReply(prompt: string, model: string) {
  return runGeminiCli(prompt, model);
}
