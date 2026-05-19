import "dotenv/config";
import { processDueJobs } from "@/lib/jobs";

const intervalMs = Number(process.env.WORKER_INTERVAL_MS || 5000);

async function tick() {
  try {
    const count = await processDueJobs(10);
    if (count > 0) {
      console.log(`[worker] processed ${count} job(s)`);
    }
  } catch (error) {
    console.error("[worker] tick failed", error);
  }
}

console.log(`[worker] started, interval=${intervalMs}ms`);
void tick();
setInterval(() => void tick(), intervalMs);
