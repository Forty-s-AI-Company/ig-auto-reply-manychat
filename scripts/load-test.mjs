import { createHmac } from "node:crypto";
import process from "node:process";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: ".env", quiet: true });
dotenv.config({ path: ".env.local", quiet: true });

const baseUrl = process.env.LOAD_TEST_BASE_URL || "http://127.0.0.1:3041";
const users = Number.parseInt(process.env.LOAD_TEST_USERS || "1000", 10);
const durationMs = Number.parseInt(process.env.LOAD_TEST_DURATION_MS || "60000", 10);
const thinkMinMs = Number.parseInt(process.env.LOAD_TEST_THINK_MIN_MS || "80", 10);
const thinkMaxMs = Number.parseInt(process.env.LOAD_TEST_THINK_MAX_MS || "800", 10);
const workerIntervalMs = Number.parseInt(process.env.LOAD_TEST_WORKER_INTERVAL_MS || "750", 10);
const workerLimit = Number.parseInt(process.env.LOAD_TEST_WORKER_LIMIT || "100", 10);
const requestTimeoutMs = Number.parseInt(process.env.LOAD_TEST_REQUEST_TIMEOUT_MS || "15000", 10);
const seedContacts = Number.parseInt(process.env.LOAD_TEST_SEED_CONTACTS || String(Math.max(users, 1000)), 10);
const prefix = process.env.LOAD_TEST_PREFIX || "loadtest";
const email = process.env.LOAD_TEST_ADMIN_EMAIL || `${prefix}@example.com`;
const password = process.env.LOAD_TEST_ADMIN_PASSWORD || "load-test-password-please-change";
const webhookKey = process.env.LOAD_TEST_WEBHOOK_KEY || `${prefix}-webhook-key-20260531`;
const workspaceId = process.env.LOAD_TEST_WORKSPACE_ID || "default-workspace";
const cleanup = process.env.LOAD_TEST_CLEANUP !== "0";
const deleteLoadTestUser = process.env.LOAD_TEST_DELETE_USER === "1";

const prisma = new PrismaClient();
let startedAt = Date.now();
const histograms = new Map();
const counters = new Map();
const failures = [];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function increment(key, by = 1) {
  counters.set(key, (counters.get(key) || 0) + by);
}

function record(name, elapsedMs, status, ok) {
  if (!histograms.has(name)) histograms.set(name, []);
  histograms.get(name).push(elapsedMs);
  increment(`${name}.status.${status}`);
  if (!ok) increment(`${name}.errors`);
}

function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
}

function summarizeHistogram(name, values) {
  const total = values.reduce((sum, value) => sum + value, 0);
  return {
    name,
    count: values.length,
    avgMs: values.length ? Math.round(total / values.length) : 0,
    p50Ms: Math.round(percentile(values, 50)),
    p95Ms: Math.round(percentile(values, 95)),
    p99Ms: Math.round(percentile(values, 99)),
    maxMs: Math.round(values.reduce((max, value) => Math.max(max, value), 0)),
    errors: counters.get(`${name}.errors`) || 0,
  };
}

function hmacSignature(body) {
  const secret = process.env.AUTOMATION_WEBHOOK_SECRET;
  if (!secret) return undefined;
  return `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
}

async function request(name, path, options = {}) {
  const started = performance.now();
  let status = 0;
  let ok = false;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);
  try {
    const response = await fetch(new URL(path, baseUrl), {
      redirect: "manual",
      signal: controller.signal,
      ...options,
      headers: {
        origin: baseUrl,
        ...(options.headers || {}),
      },
    });
    status = response.status;
    ok = status >= 200 && status < 400;
    await response.arrayBuffer();
  } catch (error) {
    failures.push({ name, path, error: error instanceof Error ? error.message : String(error) });
  } finally {
    clearTimeout(timeout);
  }
  record(name, performance.now() - started, status, ok);
  return { status, ok };
}

async function cleanupLoadData(workspace) {
  const channel = await prisma.channel.findFirst({
    where: { workspaceId: workspace.id, type: "mock", name: "Local Mock" },
    select: { id: true },
  });
  await prisma.job.deleteMany({ where: { workspaceId: workspace.id } });
  await prisma.broadcast.deleteMany({ where: { workspaceId: workspace.id, name: { startsWith: "Load Test Broadcast" } } });
  await prisma.automation.deleteMany({ where: { workspaceId: workspace.id, name: { startsWith: "Load Test" } } });
  if (channel) {
    await prisma.contact.deleteMany({ where: { channelId: channel.id, externalId: { startsWith: `${prefix}-` } } });
  }
  await prisma.tag.deleteMany({ where: { workspaceId: workspace.id, name: "load-test" } });
  if (deleteLoadTestUser) {
    await prisma.user.deleteMany({ where: { email } });
  }
}

async function ensureDataset() {
  const passwordHash = await bcrypt.hash(password, 8);
  const workspace = await prisma.workspace.upsert({
    where: { id: workspaceId },
    update: {},
    create: {
      id: workspaceId,
      name: workspaceId === "default-workspace" ? "Default Workspace" : "Load Test Workspace",
      slug: workspaceId === "default-workspace" ? "default" : `${prefix}-workspace`,
    },
  });
  await cleanupLoadData(workspace);
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "admin" },
    create: { email, name: "Load Test Admin", passwordHash, role: "admin" },
  });
  await prisma.workspaceUser.upsert({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: user.id } },
    update: {},
    create: { workspaceId: workspace.id, userId: user.id, role: "admin" },
  });
  const channel = await prisma.channel.upsert({
    where: { workspaceId_type_name: { workspaceId: workspace.id, type: "mock", name: "Local Mock" } },
    update: { enabled: true },
    create: { workspaceId: workspace.id, type: "mock", name: "Local Mock", enabled: true, configJson: {} },
  });
  const tag = await prisma.tag.upsert({
    where: { workspaceId_name: { workspaceId: workspace.id, name: "load-test" } },
    update: {},
    create: { workspaceId: workspace.id, name: "load-test", color: "#2563eb" },
  });

  await prisma.automation.deleteMany({ where: { workspaceId: workspace.id, name: { startsWith: "Load Test" } } });
  await prisma.automation.create({
    data: {
      workspaceId: workspace.id,
      name: "Load Test Keyword Automation",
      enabled: true,
      triggerType: "keyword",
      triggerConfigJson: { keywords: ["price", "demo", "help"], match: "contains" },
      steps: {
        create: [
          { order: 1, type: "send_message", configJson: { text: "收到，我們會提供方案資訊。" } },
          { order: 2, type: "add_tag", configJson: { tagName: "load-test" } },
          { order: 3, type: "wait", configJson: { seconds: 1 } },
          { order: 4, type: "send_message", configJson: { text: "這是自動追蹤訊息。" } },
        ],
      },
    },
  });
  await prisma.automation.create({
    data: {
      workspaceId: workspace.id,
      name: "Load Test Webhook Automation",
      enabled: true,
      triggerType: "webhook",
      triggerConfigJson: { webhookKey },
      steps: {
        create: [
          { order: 1, type: "send_message", configJson: { text: "Webhook 已收到。" } },
          { order: 2, type: "add_tag", configJson: { tagName: "load-test" } },
        ],
      },
    },
  });

  const existing = await prisma.contact.count({ where: { channelId: channel.id, externalId: { startsWith: `${prefix}-contact-` } } });
  if (existing < seedContacts) {
    const batchSize = 500;
    for (let offset = existing; offset < seedContacts; offset += batchSize) {
      const size = Math.min(batchSize, seedContacts - offset);
      await prisma.contact.createMany({
        skipDuplicates: true,
        data: Array.from({ length: size }, (_, index) => {
          const n = offset + index;
          return {
            channelId: channel.id,
            externalId: `${prefix}-contact-${n}`,
            displayName: `Load User ${n}`,
            consentStatus: "opted_in",
            metadataJson: {},
            lastInboundAt: new Date(),
          };
        }),
      });
    }
  }

  const contacts = await prisma.contact.findMany({
    where: { channelId: channel.id, externalId: { startsWith: `${prefix}-contact-` } },
    select: { id: true },
    take: seedContacts,
  });
  for (let offset = 0; offset < contacts.length; offset += 1000) {
    await prisma.contactTag.createMany({
      skipDuplicates: true,
      data: contacts.slice(offset, offset + 1000).map((contact) => ({ contactId: contact.id, tagId: tag.id })),
    });
  }

  const broadcast = await prisma.broadcast.create({
    data: {
      workspaceId: workspace.id,
      name: `Load Test Broadcast ${new Date().toISOString()}`,
      status: "draft",
      targetConfigJson: { tagId: tag.id },
      messageJson: { text: "Load test broadcast message" },
    },
  });

  return { workspace, user, channel, tag, broadcast };
}

async function loginCookie() {
  const response = await fetch(new URL("/api/auth/login", baseUrl), {
    method: "POST",
    headers: { "content-type": "application/json", origin: baseUrl },
    body: JSON.stringify({ email, password }),
    redirect: "manual",
  });
  if (!response.ok) {
    throw new Error(`Load-test login failed with HTTP ${response.status}.`);
  }
  const session = response.headers.get("set-cookie")?.split(";")[0] || "";
  return `${session}; selected_workspace_id=${workspaceId}`;
}

async function virtualUser(id, cookie) {
  const ip = `10.${Math.floor(id / 65536) % 255}.${Math.floor(id / 256) % 255}.${id % 255 || 1}`;
  const externalId = `${prefix}-vu-${id}`;
  const texts = ["price please", "demo link", "help me", "hello", "pricing demo help"];
  const scenarios = [
    async () => request("page.dashboard", "/dashboard", { headers: { cookie, "x-forwarded-for": ip } }),
    async () => request("page.inbox", "/inbox", { headers: { cookie, "x-forwarded-for": ip } }),
    async () => request("page.broadcasts", "/broadcasts", { headers: { cookie, "x-forwarded-for": ip } }),
    async () => request("page.analytics", "/analytics", { headers: { cookie, "x-forwarded-for": ip } }),
    async () => request("api.conversations", "/api/conversations", { headers: { cookie, "x-forwarded-for": ip } }),
    async () => request("api.contacts", "/api/contacts", { headers: { cookie, "x-forwarded-for": ip } }),
    async () => request("mock.inbound", "/api/webhooks/mock", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": ip,
        ...(process.env.MOCK_WEBHOOK_SECRET ? { "x-mock-webhook-secret": process.env.MOCK_WEBHOOK_SECRET } : {}),
      },
      body: JSON.stringify({
        externalId,
        displayName: `Virtual User ${id}`,
        text: pick(texts),
        consentStatus: "opted_in",
      }),
    }),
    async () => {
      const body = JSON.stringify({
        externalId: `${externalId}-webhook`,
        channelType: "mock",
        channelName: "Local Mock",
        displayName: `Webhook User ${id}`,
        text: "webhook pressure",
        consentStatus: "opted_in",
      });
      const signature = hmacSignature(body);
      return request("automation.webhook", `/api/automation-webhooks/${webhookKey}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": ip,
          ...(signature ? { "x-inboxpilot-signature": signature } : {}),
        },
        body,
      });
    },
  ];

  while (Date.now() - startedAt < durationMs) {
    await pick(scenarios)();
    await sleep(randomInt(thinkMinMs, thinkMaxMs));
  }
}

async function workerPump(cookie, broadcastId) {
  await request("broadcast.queue", `/api/broadcasts/${broadcastId}/queue`, {
    method: "POST",
    headers: { cookie, "x-forwarded-for": "10.255.0.1" },
  });

  while (Date.now() - startedAt < durationMs + 2000) {
    await request("cron.worker", `/api/cron/worker?limit=${workerLimit}`, {
      headers: {
        "x-forwarded-for": "10.255.0.2",
        ...(process.env.CRON_SECRET ? { authorization: `Bearer ${process.env.CRON_SECRET}` } : {}),
      },
    });
    await sleep(workerIntervalMs);
  }
}

const dataset = await ensureDataset();
const cookie = await loginCookie();
startedAt = Date.now();
await Promise.all([
  workerPump(cookie, dataset.broadcast.id),
  ...Array.from({ length: users }, (_, index) => virtualUser(index + 1, cookie)),
]);

const totalDurationMs = Date.now() - startedAt;
const databaseCounts = await prisma.$transaction([
  prisma.contact.count({ where: { channelId: dataset.channel.id } }),
  prisma.conversation.count({ where: { channelId: dataset.channel.id } }),
  prisma.message.count({ where: { channelId: dataset.channel.id } }),
  prisma.automationRun.count({ where: { automation: { workspaceId: dataset.workspace.id } } }),
  prisma.job.count({ where: { workspaceId: dataset.workspace.id, status: "queued" } }),
  prisma.job.count({ where: { workspaceId: dataset.workspace.id, status: "failed" } }),
]);
if (cleanup) {
  await cleanupLoadData(dataset.workspace);
}
await prisma.$disconnect();

const endpointSummaries = [...histograms.entries()]
  .map(([name, values]) => summarizeHistogram(name, values))
  .sort((a, b) => b.p95Ms - a.p95Ms);
const totalRequests = endpointSummaries.reduce((sum, item) => sum + item.count, 0);
const totalErrors = endpointSummaries.reduce((sum, item) => sum + item.errors, 0);

console.log(JSON.stringify({
  baseUrl,
  users,
  durationMs: totalDurationMs,
  requestsPerSecond: Math.round((totalRequests / totalDurationMs) * 1000 * 10) / 10,
  totalRequests,
  totalErrors,
  errorRate: totalRequests ? Math.round((totalErrors / totalRequests) * 10000) / 100 : 0,
  dataset: {
    workspaceId: dataset.workspace.id,
    broadcastId: dataset.broadcast.id,
    seededContacts: seedContacts,
    contacts: databaseCounts[0],
    conversations: databaseCounts[1],
    messages: databaseCounts[2],
    automationRuns: databaseCounts[3],
    queuedJobs: databaseCounts[4],
    failedJobs: databaseCounts[5],
    cleanedUp: cleanup,
    deletedLoadTestUser: cleanup && deleteLoadTestUser,
  },
  endpoints: endpointSummaries,
  statusCounters: Object.fromEntries([...counters.entries()].filter(([key]) => key.includes(".status."))),
  sampleFailures: failures.slice(0, 20),
}, null, 2));
