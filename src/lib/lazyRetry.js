import { lazy } from 'react';

const RELOAD_KEY = 'bph_chunk_reload';

/**
 * React.lazy wrapper that retries chunk fetches (stale deploy / flaky network).
 * After retries fail, forces a one-time full reload to pick up the new index.html.
 */
export function lazyRetry(factory, { retries = 2, delayMs = 1200 } = {}) {
  return lazy(async () => {
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        const mod = await factory();
        try {
          sessionStorage.removeItem(RELOAD_KEY);
        } catch {
          /* storage blocked */
        }
        return mod;
      } catch (err) {
        lastError = err;
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
        }
      }
    }

    try {
      const already = sessionStorage.getItem(RELOAD_KEY);
      if (!already) {
        sessionStorage.setItem(RELOAD_KEY, '1');
        window.location.reload();
        return new Promise(() => {});
      }
      sessionStorage.removeItem(RELOAD_KEY);
    } catch {
      /* storage blocked */
    }

    throw lastError;
  });
}
