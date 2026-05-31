import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    pool: "threads",
    testTimeout: 15000,
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      reportsDirectory: "coverage",
      include: [
        "src/lib/app-url.ts",
        "src/lib/compliance.ts",
        "src/lib/segments.ts",
        "src/lib/secrets.ts",
        "src/lib/validation.ts",
        "src/lib/webhook-security.ts",
        "src/app/api/tags/route.ts",
        "src/app/api/broadcasts/route.ts",
      ],
      exclude: [
        "src/lib/db.ts",
        "src/lib/ai/codex-cli.ts",
        "src/lib/ai/gemini-cli.ts",
        "src/lib/google-oauth.ts",
        "src/lib/instagram/comments-sync.ts",
        "src/app/api/cron/**",
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
