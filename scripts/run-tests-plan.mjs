export const DEFAULT_TEST_BATCH_SIZE = 6;
export const WINDOWS_ACCESS_VIOLATION_EXIT_CODE = 3221225477;
export const WINDOWS_ACCESS_VIOLATION_SIGNED_EXIT_CODE = -1073741819;

export function buildTestBatches(testFiles, { withCoverage = false, batchSize = DEFAULT_TEST_BATCH_SIZE } = {}) {
  if (withCoverage) return [testFiles];

  return Array.from({ length: Math.ceil(testFiles.length / batchSize) }, (_, index) =>
    testFiles.slice(index * batchSize, index * batchSize + batchSize),
  );
}

export function formatBatchLabel(batch, index, total) {
  return `batch ${index + 1}/${total}: ${batch.join(", ")}`;
}

export function isWindowsAccessViolationExitCode(code) {
  return code === WINDOWS_ACCESS_VIOLATION_EXIT_CODE || code === WINDOWS_ACCESS_VIOLATION_SIGNED_EXIT_CODE;
}

export function shouldDiagnoseBatchFailure({ code, batch, withCoverage }) {
  return !withCoverage && batch.length > 1 && isWindowsAccessViolationExitCode(code);
}
