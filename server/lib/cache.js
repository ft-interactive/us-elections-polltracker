import lruCache from 'lru-cache';

const maxAge = 60 * 1000; // 60 seconds

export const lru = lruCache({
  maxAge,
  max: 500,
});

const noop = () => {};

export default async function cache(keyFn = noop, refresh = noop, max = maxAge) {
  const key = typeof keyFn === 'string' ? keyFn : keyFn();

  if (!key) return await refresh();

  if (lru.has(key)) {
    return lru.get(key);
  }

  const value = await refresh();
  lru.set(key, value, max);
  return value;
}
