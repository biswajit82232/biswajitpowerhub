/**
 * Fire-and-forget client error ingest. Never throws; never includes PII.
 */
const recent = [];
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;

function allow() {
  const now = Date.now();
  while (recent.length && now - recent[0] > WINDOW_MS) recent.shift();
  if (recent.length >= MAX_PER_WINDOW) return false;
  recent.push(now);
  return true;
}

export function reportClientError(error, info = {}) {
  if (typeof window === 'undefined') return;
  if (!allow()) return;

  const message = String(error?.message || error || 'unknown').slice(0, 240);
  const stack = String(error?.stack || '').split('\n').slice(0, 6).join('\n').slice(0, 800);
  const path = String(info.path || window.location?.pathname || '').slice(0, 160);
  const source = String(info.source || 'unknown').slice(0, 40);

  try {
    const body = JSON.stringify({ message, stack, path, source });
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/client-error', new Blob([body], { type: 'application/json' }));
      return;
    }
    fetch('/api/client-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}
