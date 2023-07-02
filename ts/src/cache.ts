import { sleep } from "./time.ts";

export type Cache = {
  set(key: string, value: Record<string, unknown>): void | Promise<void>;
  get(
    key: string
  ):
    | Record<string, unknown>
    | undefined
    | Promise<Record<string, unknown> | undefined>;
  delete(key: string): void | Promise<void>;
};

const LocalCacheStorage = new Map<string, Record<string, unknown>>();

export const LocalCache: Cache = {
  async set(key, value) {
    LocalCacheStorage.set(key, value);
  },
  async get(key) {
    return LocalCacheStorage.get(key);
  },
  async delete(key) {
    LocalCacheStorage.delete(key);
  },
};

export type CacheValue<Value> = {
  value: Value;
  validTill: number;
  version: 1;
};

export async function getFromCache<Value>(
  cache: Cache,
  key: string
): Promise<CacheValue<Value>> {
  return cache.get(key) as CacheValue<Value>;
}

export async function setCache<Value>(
  cache: Cache,
  key: string,
  value: CacheValue<Value>
) {
  return cache.set(key, value);
}
