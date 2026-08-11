import { lazy } from 'react';

/**
 * React.lazy wrapper that retries chunk fetches (stale deploy / flaky network).
 * After retries fail, forces a one-time full reload to pick up the new index.html.
 */
export function lazyRetry(factory, { retries = 2, delayMs = 1200 } = {}) {
  return lazy(async () => {
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        return await factory();
      } catch (err) {
        lastError = err;
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
        }
      }
    }

    const key = 'bph_chunk_reload';
    try {
      const already = sessionStorage.getItem(key);
      if (!already) {
        sessionStorage.setItem(key, '1');
        window.location.reload();
        // Keep Suspense pending until reload completes.
        return new Promise(() => {});
      }
      sessionStorage.removeItem(key);
    } catch {
      /* storage blocked */
    }

    throw lastError;
  });
}
