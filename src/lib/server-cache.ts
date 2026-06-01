type ServerCacheEntry<T> = {
  expiresAt: number;
  value: Promise<T>;
};

const serverCache = new Map<string, ServerCacheEntry<unknown>>();

export function getServerCache<T>(key: string, ttlMs: number, loader: () => Promise<T>) {
  const now = Date.now();
  const existing = serverCache.get(key) as ServerCacheEntry<T> | undefined;

  if (existing && existing.expiresAt > now) {
    return existing.value;
  }

  const value = loader().catch((error) => {
    serverCache.delete(key);
    throw error;
  });

  serverCache.set(key, { expiresAt: now + ttlMs, value });
  return value;
}

export function clearServerCache(prefix?: string) {
  if (!prefix) {
    serverCache.clear();
    return;
  }

  for (const key of serverCache.keys()) {
    if (key.startsWith(prefix)) {
      serverCache.delete(key);
    }
  }
}
