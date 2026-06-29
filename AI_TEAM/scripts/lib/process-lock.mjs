import fs from "node:fs";

function isProcessAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export function readLock(lockPath) {
  try {
    if (!fs.existsSync(lockPath)) return null;
    return JSON.parse(fs.readFileSync(lockPath, "utf8"));
  } catch {
    return null;
  }
}

export function acquireLock(lockPath, meta = {}, staleAfterMs = 6 * 60 * 60 * 1000) {
  const now = Date.now();
  const payload = {
    pid: process.pid,
    startedAt: new Date(now).toISOString(),
    ...meta,
  };

  try {
    fs.writeFileSync(lockPath, JSON.stringify(payload, null, 2), { encoding: "utf8", flag: "wx" });
    return { ok: true, lock: payload };
  } catch (error) {
    if (!error || error.code !== "EEXIST") {
      return { ok: false, reason: `無法建立 lock：${error instanceof Error ? error.message : String(error)}` };
    }
  }

  const existing = readLock(lockPath);
  const startedAt = existing?.startedAt ? new Date(existing.startedAt).getTime() : 0;
  const isStale = !startedAt || now - startedAt > staleAfterMs;
  const alive = isProcessAlive(existing?.pid);

  if (!alive || isStale) {
    try {
      fs.rmSync(lockPath, { force: true });
      fs.writeFileSync(lockPath, JSON.stringify(payload, null, 2), { encoding: "utf8", flag: "wx" });
      return { ok: true, lock: payload, replacedStale: true };
    } catch (retryError) {
      return {
        ok: false,
        reason: `lock 已存在，且重建失敗：${retryError instanceof Error ? retryError.message : String(retryError)}`,
        existing,
      };
    }
  }

  return {
    ok: false,
    reason: "已有同類流程執行中。",
    existing,
  };
}

export function releaseLock(lockPath) {
  try {
    fs.rmSync(lockPath, { force: true });
  } catch {
  }
}
