import { spawn } from "node:child_process";
import { loadProjectEnv } from "./load-env.mjs";

loadProjectEnv();

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node scripts/prisma-env.mjs <prisma args...>");
  process.exit(1);
}

const child = spawn(process.execPath, ["./node_modules/prisma/build/index.js", ...args], {
  cwd: process.cwd(),
  env: process.env,
  stdio: "inherit",
});

child.on("exit", (code) => process.exit(code ?? 1));
child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});
