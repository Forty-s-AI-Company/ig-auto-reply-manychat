const baseUrl = process.env.LOAD_TEST_BASE_URL || "http://127.0.0.1:3041";
const users = Number.parseInt(process.env.LOAD_TEST_USERS || "1000", 10);
const concurrency = Number.parseInt(process.env.LOAD_TEST_CONCURRENCY || "50", 10);
const durationMs = Number.parseInt(process.env.LOAD_TEST_DURATION_MS || "60000", 10);

const endpoints = [
  { method: "GET", path: "/", weight: 20 },
  { method: "GET", path: "/login", weight: 15 },
  { method: "GET", path: "/signup", weight: 10 },
  { method: "GET", path: "/pricing", weight: 10 },
  { method: "GET", path: "/api/ai-models", weight: 15 },
  { method: "GET", path: "/api/webhooks/meta?hub.mode=subscribe&hub.verify_token=invalid&hub.challenge=loadtest", weight: 15 },
  { method: "POST", path: "/api/billing/payuni/return", weight: 15, body: new URLSearchParams({ Status: "0" }) },
];

const weighted = endpoints.flatMap((endpoint) => Array.from({ length: endpoint.weight }, () => endpoint));
const stats = new Map(endpoints.map((endpoint) => [endpoint.path, { count: 0, errors: 0, totalMs: 0, maxMs: 0, statuses: new Map() }]));
const start = Date.now();
let requestCount = 0;

function pickEndpoint(workerId) {
  const index = (requestCount + workerId * 17) % weighted.length;
  return weighted[index];
}

async function hit(endpoint) {
  const startedAt = performance.now();
  let status = 0;
  let ok = false;

  try {
    const headers = endpoint.body ? { "Content-Type": "application/x-www-form-urlencoded" } : undefined;
    const response = await fetch(new URL(endpoint.path, baseUrl), {
      method: endpoint.method,
      headers,
      body: endpoint.body,
      redirect: "manual",
    });
    status = response.status;
    ok = status < 500;
    await response.arrayBuffer();
  } catch {
    ok = false;
  }

  const elapsed = performance.now() - startedAt;
  const bucket = stats.get(endpoint.path);
  bucket.count += 1;
  bucket.totalMs += elapsed;
  bucket.maxMs = Math.max(bucket.maxMs, elapsed);
  bucket.errors += ok ? 0 : 1;
  bucket.statuses.set(status, (bucket.statuses.get(status) || 0) + 1);
}

async function worker(workerId) {
  while (Date.now() - start < durationMs) {
    const endpoint = pickEndpoint(workerId);
    requestCount += 1;
    await hit(endpoint);
  }
}

const activeWorkers = Math.min(concurrency, users);
await Promise.all(Array.from({ length: activeWorkers }, (_, workerId) => worker(workerId)));

const totalMs = Date.now() - start;
const rows = [...stats.entries()].map(([path, value]) => ({
  path,
  count: value.count,
  errors: value.errors,
  averageMs: value.count ? Math.round(value.totalMs / value.count) : 0,
  maxMs: Math.round(value.maxMs),
  statuses: Object.fromEntries([...value.statuses.entries()].sort(([a], [b]) => a - b)),
}));

console.log(JSON.stringify({
  baseUrl,
  configuredUsers: users,
  concurrency: activeWorkers,
  durationMs: totalMs,
  totalRequests: rows.reduce((sum, row) => sum + row.count, 0),
  totalErrors: rows.reduce((sum, row) => sum + row.errors, 0),
  endpoints: rows,
}, null, 2));
