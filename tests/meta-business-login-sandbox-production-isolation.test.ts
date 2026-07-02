import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();

const productionOAuthFiles = [
  "src/app/api/oauth/[provider]/authorize/route.ts",
  "src/app/api/oauth/[provider]/callback/route.ts",
  "src/app/api/meta/oauth/start/route.ts",
  "src/app/api/meta/oauth/callback/route.ts",
  "src/app/api/instagram/oauth/callback/route.ts",
];

const forbiddenProductionMarkers = [
  "meta-business-sandbox",
  "meta-business-facebook-sandbox",
  "meta-business-instagram-sandbox",
  "/api/internal/oauth",
];

function readRepoFile(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function listSourceFiles(relativeDir: string): string[] {
  const absoluteDir = path.join(repoRoot, relativeDir);

  if (!existsSync(absoluteDir)) {
    return [];
  }

  return readdirSync(absoluteDir).flatMap((entry) => {
    const absolutePath = path.join(absoluteDir, entry);
    const relativePath = path.relative(repoRoot, absolutePath).replaceAll(path.sep, "/");
    const stats = statSync(absolutePath);

    if (stats.isDirectory()) {
      return listSourceFiles(relativePath);
    }

    if (!/\.(ts|tsx|js|jsx)$/.test(entry)) {
      return [];
    }

    return [relativePath];
  });
}

function findMarkerHits(files: string[], markers: string[]) {
  return files.flatMap((file) => {
    const content = readRepoFile(file);

    return markers
      .filter((marker) => content.includes(marker))
      .map((marker) => ({ file, marker }));
  });
}

function isAllowedCallbackCaptureGuardHit(hit: { file: string; marker: string }) {
  return (
    hit.file === "src/app/api/meta/oauth/callback/route.ts" &&
    hit.marker === "meta-business-sandbox" &&
    readRepoFile(hit.file).includes("@/lib/meta-business-sandbox-callback-capture")
  );
}

function findUnexpectedProductionMarkerHits(files: string[], markers: string[]) {
  return findMarkerHits(files, markers).filter((hit) => !isAllowedCallbackCaptureGuardHit(hit));
}

describe("Meta Business Login sandbox production isolation", () => {
  it("keeps existing production OAuth routes free of sandbox providers and helpers", () => {
    const existingProductionOAuthFiles = productionOAuthFiles.filter((file) => existsSync(path.join(repoRoot, file)));

    expect(existingProductionOAuthFiles.length).toBeGreaterThan(0);
    expect(findUnexpectedProductionMarkerHits(existingProductionOAuthFiles, forbiddenProductionMarkers)).toEqual([]);
  });

  it("does not expose internal sandbox OAuth routes from app or component UI code", () => {
    const uiFiles = [...listSourceFiles("src/app"), ...listSourceFiles("src/components")].filter(
      (file) => !file.startsWith("src/app/api/internal/"),
    );

    expect(findMarkerHits(uiFiles, ["/api/internal/oauth"])).toEqual([]);
  });

  it("does not add sandbox-specific Prisma models or schema fields", () => {
    const schema = readRepoFile("prisma/schema.prisma");

    expect(schema).not.toMatch(/MetaBusinessSandbox|meta_business_sandbox/i);
    expect(schema).not.toContain("meta-business-facebook-sandbox");
    expect(schema).not.toContain("meta-business-instagram-sandbox");
  });

  it("keeps sandbox implementation under internal routes, sandbox helpers, tests, and docs only", () => {
    const productionSourceFiles = [...listSourceFiles("src/app"), ...listSourceFiles("src/components"), ...listSourceFiles("src/lib")].filter(
      (file) => !file.startsWith("src/app/api/internal/") && !file.includes("meta-business-sandbox"),
    );

    expect(findUnexpectedProductionMarkerHits(productionSourceFiles, forbiddenProductionMarkers)).toEqual([]);
  });
});
