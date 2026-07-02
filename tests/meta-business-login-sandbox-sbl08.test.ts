import { describe, expect, it } from "vitest";
import {
  SANDBOX_PRODUCTION_WRITE_OPERATIONS,
  assertSandboxProductionWritesBlocked,
  blockSandboxProductionWrite,
} from "@/lib/meta-business-sandbox-write-guard";

describe("SBL-08 Meta Business Login sandbox production write guard", () => {
  it("blocks every production write operation in dry-run mode", () => {
    const results = SANDBOX_PRODUCTION_WRITE_OPERATIONS.map(blockSandboxProductionWrite);

    expect(results).toHaveLength(7);
    expect(assertSandboxProductionWritesBlocked(results)).toEqual([]);
    expect(results.every((result) => result.allowed === false)).toBe(true);
    expect(results.every((result) => result.errorType === "production_write_blocked")).toBe(true);
  });
});
