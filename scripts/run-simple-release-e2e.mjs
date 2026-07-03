import { spawn } from "node:child_process";

const isWindows = process.platform === "win32";
const npmCommand = isWindows ? "npm.cmd" : "npm";
const npxCommand = isWindows ? "npx.cmd" : "npx";

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(isWindows ? [command, ...args].join(" ") : command, isWindows ? [] : args, {
      stdio: "inherit",
      shell: isWindows,
      ...options,
      env: {
        ...process.env,
        ...options.env,
      },
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} failed with ${signal ? `signal ${signal}` : `exit ${code}`}`));
    });
  });
}

await run(npmCommand, ["run", "e2e:admin:ensure"]);

await run(npxCommand, ["playwright", "test", "tests/e2e/simple-release.spec.ts"], {
  env: {
    INBOXPILOT_RELEASE_CHANNEL: "simple",
  },
});
