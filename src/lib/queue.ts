import type { Job as DbJob, Prisma } from "@prisma/client";
import { getDb } from "@/lib/db";

type QueueModule = typeof import("bullmq");

type JobCreateInput = {
  workspaceId: string;
  type: string;
  status?: "queued";
  runAt?: Date;
  payloadJson: Prisma.InputJsonValue;
};

const QUEUE_NAME = process.env.JOB_QUEUE_NAME || "inboxpilot-jobs";
const redisUrl = process.env.REDIS_URL?.trim();

let queuePromise: Promise<import("bullmq").Queue> | null = null;
let workerModulesPromise: Promise<QueueModule> | null = null;

export function isExternalQueueEnabled() {
  return Boolean(redisUrl);
}

async function loadQueueModules() {
  workerModulesPromise ||= import("bullmq");
  return workerModulesPromise;
}

async function getExternalQueue() {
  if (!redisUrl) return null;
  queuePromise ||= loadQueueModules().then(({ Queue }) =>
    new Queue(QUEUE_NAME, {
      connection: {
        url: redisUrl,
        maxRetriesPerRequest: null,
      },
    }),
  );
  return queuePromise;
}

function delayFor(runAt: Date) {
  return Math.max(0, runAt.getTime() - Date.now());
}

export async function mirrorJobToExternalQueue(job: Pick<DbJob, "id" | "type" | "runAt">) {
  const queue = await getExternalQueue();
  if (!queue) return false;

  try {
    await queue.add(
      job.type,
      { dbJobId: job.id },
      {
        jobId: job.id,
        delay: delayFor(job.runAt),
        attempts: 3,
        backoff: { type: "exponential", delay: 2_000 },
        removeOnComplete: { age: 60 * 60, count: 1_000 },
        removeOnFail: { age: 24 * 60 * 60, count: 5_000 },
      },
    );
    return true;
  } catch (error) {
    console.error("[queue] failed to mirror job to external queue", {
      jobId: job.id,
      type: job.type,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

export async function enqueueJob(input: JobCreateInput) {
  const job = await getDb().job.create({
    data: {
      workspaceId: input.workspaceId,
      type: input.type,
      status: input.status || "queued",
      runAt: input.runAt || new Date(),
      payloadJson: input.payloadJson,
    },
  });
  await mirrorJobToExternalQueue(job);
  return job;
}

export async function enqueueJobs(inputs: JobCreateInput[]) {
  if (!inputs.length) return [];

  const jobs = await getDb().job.createManyAndReturn({
    data: inputs.map((input) => ({
      workspaceId: input.workspaceId,
      type: input.type,
      status: input.status || "queued",
      runAt: input.runAt || new Date(),
      payloadJson: input.payloadJson,
    })),
    select: { id: true, type: true, runAt: true },
  });
  await Promise.all(jobs.map((job) => mirrorJobToExternalQueue(job)));
  return jobs;
}

export async function createExternalWorker(processJob: (dbJobId: string) => Promise<void>) {
  if (!redisUrl) return null;
  const { Worker } = await loadQueueModules();
  return new Worker(
    QUEUE_NAME,
    async (job) => {
      const dbJobId = String(job.data?.dbJobId || "");
      if (!dbJobId) throw new Error("BullMQ job is missing dbJobId.");
      await processJob(dbJobId);
    },
    {
      connection: {
        url: redisUrl,
        maxRetriesPerRequest: null,
      },
      concurrency: Math.max(1, Number(process.env.WORKER_CONCURRENCY || 5)),
    },
  );
}
