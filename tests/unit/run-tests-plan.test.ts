import { describe, expect, it } from "vitest";
import {
  buildTestBatches,
  formatBatchLabel,
  isWindowsAccessViolationExitCode,
  shouldDiagnoseBatchFailure,
} from "../../scripts/run-tests-plan.mjs";

describe("run-tests plan helpers", () => {
  it("splits test files into stable six-file batches by default", () => {
    const files = Array.from({ length: 13 }, (_, index) => `tests/file-${index + 1}.test.ts`);

    expect(buildTestBatches(files)).toEqual([
      files.slice(0, 6),
      files.slice(6, 12),
      files.slice(12, 13),
    ]);
  });

  it("keeps coverage runs in one batch", () => {
    const files = ["tests/a.test.ts", "tests/b.test.ts"];

    expect(buildTestBatches(files, { withCoverage: true })).toEqual([files]);
  });

  it("formats batch labels with file names for CI diagnostics", () => {
    expect(formatBatchLabel(["tests/a.test.ts", "tests/b.test.ts"], 1, 3)).toBe(
      "batch 2/3: tests/a.test.ts, tests/b.test.ts",
    );
  });

  it("recognizes Windows access violation exit codes", () => {
    expect(isWindowsAccessViolationExitCode(3221225477)).toBe(true);
    expect(isWindowsAccessViolationExitCode(-1073741819)).toBe(true);
    expect(isWindowsAccessViolationExitCode(1)).toBe(false);
  });

  it("only diagnoses multi-file non-coverage batches that crash with Windows access violation", () => {
    expect(
      shouldDiagnoseBatchFailure({
        code: 3221225477,
        batch: ["tests/a.test.ts", "tests/b.test.ts"],
        withCoverage: false,
      }),
    ).toBe(true);
    expect(
      shouldDiagnoseBatchFailure({
        code: 1,
        batch: ["tests/a.test.ts", "tests/b.test.ts"],
        withCoverage: false,
      }),
    ).toBe(false);
    expect(
      shouldDiagnoseBatchFailure({
        code: 3221225477,
        batch: ["tests/a.test.ts"],
        withCoverage: false,
      }),
    ).toBe(false);
    expect(
      shouldDiagnoseBatchFailure({
        code: 3221225477,
        batch: ["tests/a.test.ts", "tests/b.test.ts"],
        withCoverage: true,
      }),
    ).toBe(false);
  });
});
