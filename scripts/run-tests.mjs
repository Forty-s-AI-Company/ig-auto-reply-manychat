import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { loadProjectEnv } from "./load-env.mjs";

loadProjectEnv();

const withCoverage = process.argv.includes("--coverage");

const baseDatabaseUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
if (!baseDatabaseUrl) {
  throw new Error("DATABASE_URL or TEST_DATABASE_URL is required to run tests.");
}
// Prefer an explicit test direct URL. Otherwise reuse the tested pooler URL,
// which is more reliable in this workspace than the provisioned DIRECT_URL.
const baseDirectUrl =
  process.env.TEST_DIRECT_URL ||
  process.env.TEST_DATABASE_URL ||
  process.env.DATABASE_URL ||
  process.env.DIRECT_URL ||
  baseDatabaseUrl;

const testSchema = `test_${Date.now()}_${randomBytes(3).toString("hex")}`;
const testDatabaseUrl = new URL(baseDatabaseUrl);
if (!["postgresql:", "postgres:"].includes(testDatabaseUrl.protocol)) {
  throw new Error("Tests now require a PostgreSQL DATABASE_URL. Use Supabase or TEST_DATABASE_URL.");
}
testDatabaseUrl.searchParams.set("schema", testSchema);
process.env.DATABASE_URL = testDatabaseUrl.toString();
const testDirectUrl = new URL(baseDirectUrl);
if (!["postgresql:", "postgres:"].includes(testDirectUrl.protocol)) {
  throw new Error("DIRECT_URL or TEST_DIRECT_URL must be PostgreSQL for tests.");
}
testDirectUrl.searchParams.set("schema", testSchema);
process.env.DIRECT_URL = testDirectUrl.toString();

const env = {
  ...Object.fromEntries(
    Object.entries(process.env).filter(([, value]) => value !== undefined),
  ),
};

const vitestBin = path.join(process.cwd(), "node_modules", "vitest", "vitest.mjs");
const prismaBin = path.join(process.cwd(), "node_modules", "prisma", "build", "index.js");

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env,
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} exited with ${code}`));
    });
  });
}

try {
  await run(process.execPath, [prismaBin, "db", "push", "--skip-generate"]);
  const testFiles = (await readdir(path.join(process.cwd(), "tests")))
    .filter((fileName) => fileName.endsWith(".test.ts"))
    .sort()
    .map((fileName) => path.join("tests", fileName));

  const batches = withCoverage
    ? [testFiles]
    : Array.from({ length: Math.ceil(testFiles.length / 6) }, (_, index) => testFiles.slice(index * 6, index * 6 + 6));

  for (const batch of batches) {
    await run(process.execPath, [
      vitestBin,
      "run",
      "--no-file-parallelism",
      "--maxWorkers",
      "1",
      "--reporter",
      "dot",
      ...(withCoverage ? ["--coverage"] : []),
      ...batch,
    ]);
  }
} finally {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${testSchema}" CASCADE`);
  await prisma.$disconnect();
}
