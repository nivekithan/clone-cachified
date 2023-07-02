import { Cache, getFromCache, setCache } from "./cache.ts";
import { isFuture, isPast } from "./time.ts";

export type CachifiedOptions<Value> = {
  getFreshValue(): Promise<Value>;
  key: string;
  cache: Cache;
  ttl: number;
  swr: number;
};

export async function cachified<Value>({
  cache,
  getFreshValue,
  key,
  ttl,
  swr,
}: CachifiedOptions<Value>): Promise<Value> {
  const cachedValue = await getFromCache<Value>(cache, key);

  if (cachedValue) {
    const cacheValidTill = cachedValue.validTill;

    if (isFuture(cacheValidTill)) {
      // Cache is valid
      return cachedValue.value;
    }

    const cacheStaleTime = cacheValidTill + swr;
    if (isPast(cacheValidTill) && isFuture(cacheStaleTime)) {
      // Cache is invalid but can be considered as stale.
      updateCacheInBackground({ cache, getFreshValue, key, ttl });

      return cachedValue.value;
    }
    await cache.delete(key);
  }

  const newValue = await getFreshValue();

  await setCache(cache, key, {
    value: newValue,
    validTill: new Date().getTime() + ttl,
    version: 1,
  });

  return newValue;
}

function updateCacheInBackground({
  cache,
  getFreshValue,
  key,
  ttl,
}: Omit<CachifiedOptions<unknown>, "swr">) {
  setTimeout(async () => {
    try {
      console.log("Updating in background");
      const newValue = await getFreshValue();

      await setCache(cache, key, {
        value: newValue,
        validTill: new Date().getTime() + ttl,
        version: 1,
      });
    } catch (err) {
      // If updating the cache in background throws error. Fail silently. Users will get
      // stale cache till `swr`
    }
  }, 0);
}

export { LocalCache } from "./cache.ts";
