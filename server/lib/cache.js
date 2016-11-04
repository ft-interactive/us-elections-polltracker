import lruCache from 'lru-cache';
import debugLogger from 'debug';

const debug = debugLogger('cache');
const pending = new Map();
const maxAge = 60 * 1000; // 60 secs

const lru = lruCache({
  maxAge,
  max: 1600000,
  stale: true,
  length: (value, key) =>
      (!value ? 0 : JSON.stringify(value).length) + JSON.stringify(key).length
});

export default function cache(keyFn, job, max = maxAge) {
  const key = typeof keyFn === 'string' ? keyFn : keyFn();

  // key can be falsey to bypass caching. e.g.
  // const keyFn = () => {
  //    return !bypassCache && 'my-key';
  // }
  if (!key) return job();

  if (pending.has(key)) {
   debug('already pending %s', key);
   return pending.get(key);
  }

  // grab the current value in case the key is
  // just about to be deleted so we can serve
  // stale in the event of a refresh error
  let stale = lru.peek(key);

  const isCached = lru.has(key);
  const hasStaleValue = !!stale;

  function refresh() {
    debug('refreshing %s', key);
    return job()
      .then(result => {
        debug('caching value %s', key);
        lru.set(key, result, max);
        pending.delete(key);
        return result;
      })
      .catch(err => {
        pending.delete(key);

        if (!hasStaleValue) {
          throw err;
        }

        // swallow the error and serve stale
        debug('restore previous value %s', key)
        lru.set(key, stale, max);
        return stale;
      });
  }

  if (isCached) {
    debug('cache hit %s', key);
    return Promise.resolve(lru.get(key));
  } else if (hasStaleValue) {
    debug('start BG refresh and return stale value %s', key);
    const p = Promise.resolve(stale);
    pending.set(key, p);
    process.nextTick(() => {
      refresh().catch(err => {
        console.error('Failed background refresh', err.message);
      });
    });
    return p;
  }

  const pendingPromise = refresh();
  pending.set(key, pendingPromise);
  return pendingPromise;
}
