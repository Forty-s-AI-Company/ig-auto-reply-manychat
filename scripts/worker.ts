import "dotenv/config";
import { processDueJobs, processJob } from "@/lib/jobs";
import { createExternalWorker, isExternalQueueEnabled } from "@/lib/queue";

const intervalMs = Number(process.env.WORKER_INTERVAL_MS || 5000);
const dbBatchSize = Number(process.env.WORKER_DB_BATCH_SIZE || 10);

async function tick() {
  try {
    const count = await processDueJobs(dbBatchSize);
    if (count > 0) {
      console.log(`[worker] processed ${count} job(s)`);
    }
  } catch (error) {
    console.error("[worker] tick failed", error);
  }
}

if (isExternalQueueEnabled()) {
  console.log(`[worker] starting BullMQ worker, interval fallback=${intervalMs}ms`);
  createExternalWorker(processJob)
    .then((worker) => {
      if (!worker) return;
      worker.on("completed", (job) => console.log(`[worker] completed external job ${job.id}`));
      worker.on("failed", (job, error) => {
        console.error(`[worker] failed external job ${job?.id || "unknown"}`, error);
      });
    })
    .catch((error) => {
      console.error("[worker] failed to start BullMQ worker", error);
    });
} else {
  console.log(`[worker] started DB polling worker, interval=${intervalMs}ms`);
}

void tick();
setInterval(() => void tick(), intervalMs);
