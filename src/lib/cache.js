/**
 * Two-layer cache: in-memory (instant, per-session) + localStorage (survives reload).
 *
 * Usage:
 *   const data = await fetchWithCache('scooters', getScooters, 5 * 60);
 *   clearCache('scooters');        // bust one key
 *   clearCache();                  // bust everything
 */

const MEM = new Map(); // key → { data, expiresAt }
const LS_PREFIX = 'bph_cache_';

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

  // 3. Fetch fresh
  const data = await fetcher();
  const expiresAt = now + ttlSeconds * 1000;

  MEM.set(key, { data, expiresAt });
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify({ data, expiresAt }));
  } catch (_) { /* storage full — mem-only */ }

  return data;
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
