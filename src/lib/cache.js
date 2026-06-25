/**
 * Two-layer cache: in-memory (instant, per-session) + localStorage (survives reload).
 *
 * Usage:
 *   const data = await fetchWithCache('scooters', getScooters, 5 * 60);
 *   clearCache('scooters');        // bust one key
 *   clearCache();                  // bust everything
 */

const MEM = new Map(); // key → { data, expiresAt }
const IN_FLIGHT = new Map(); // key → Promise (dedupe concurrent fetches)
const LS_PREFIX = 'bph_cache_';

function readStale(key) {
  const mem = MEM.get(key);
  if (mem?.data != null) return mem.data;

  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    if (raw) {
      const { data } = JSON.parse(raw);
      if (data != null) return data;
    }
  } catch (_) { /* storage unavailable */ }

  return null;
}

/** @param {string} key @param {() => Promise<any>} fetcher @param {number} ttlSeconds */
export async function fetchWithCache(key, fetcher, ttlSeconds = 300) {
  const now = Date.now();

  // 1. In-memory hit
  const mem = MEM.get(key);
  if (mem && mem.expiresAt > now) return mem.data;

  // 2. localStorage hit
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    if (raw) {
      const { data, expiresAt } = JSON.parse(raw);
      if (expiresAt > now) {
        MEM.set(key, { data, expiresAt });
        return data;
      }
    }
  } catch (_) { /* storage unavailable */ }

  // 3. Dedupe concurrent fetches for the same key
  const pending = IN_FLIGHT.get(key);
  if (pending) return pending;

  const fetchPromise = (async () => {
    try {
      const data = await fetcher();
      const expiresAt = Date.now() + ttlSeconds * 1000;

      MEM.set(key, { data, expiresAt });
      try {
        localStorage.setItem(LS_PREFIX + key, JSON.stringify({ data, expiresAt }));
      } catch (_) { /* storage full — mem-only */ }

      return data;
    } catch (err) {
      const stale = readStale(key);
      if (stale != null) return stale;
      throw err;
    } finally {
      IN_FLIGHT.delete(key);
    }
  })();

  IN_FLIGHT.set(key, fetchPromise);
  return fetchPromise;
}

/** Remove one key (or all bph_ keys) from both layers. */
export function clearCache(key) {
  if (key) {
    MEM.delete(key);
    try { localStorage.removeItem(LS_PREFIX + key); } catch (_) {}
  } else {
    MEM.clear();
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(LS_PREFIX))
        .forEach((k) => localStorage.removeItem(k));
    } catch (_) {}
  }
}
