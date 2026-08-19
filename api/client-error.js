/**
 * Browser ErrorBoundary / unhandledrejection ingest.
 * Writes to Vercel logs only — no PII store.
 */
const recent = new Map();
const WINDOW_MS = 60_000;
const MAX_PER_IP = 20;

function clientIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return forwarded || req.socket?.remoteAddress || 'unknown';
}

function allow(ip) {
  const now = Date.now();
  const hits = (recent.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= MAX_PER_IP) {
    recent.set(ip, hits);
    return false;
  }
  hits.push(now);
  recent.set(ip, hits);
  return true;
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = clientIp(req);
  if (!allow(ip)) return res.status(429).json({ error: 'rate limited' });

  let body = {};
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const payload = {
    message: String(body.message || '').slice(0, 240),
    stack: String(body.stack || '').slice(0, 800),
    path: String(body.path || '').slice(0, 160),
    source: String(body.source || '').slice(0, 40),
  };

  if (!payload.message) return res.status(204).end();

  console.error('[client-error]', JSON.stringify(payload));
  return res.status(204).end();
}
