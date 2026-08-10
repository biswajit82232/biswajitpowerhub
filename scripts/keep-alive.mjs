/**
 * Supabase keep-alive ping.
 *
 * Free-tier Supabase projects auto-pause after 7 days with zero API activity.
 * This script makes one lightweight, read-only REST request so the project
 * always looks "active" — safe to run as often as you like.
 *
 * Runs from:
 *   - GitHub Actions cron (.github/workflows/supabase-keep-alive.yml) — primary safeguard,
 *     fires on a schedule regardless of whether anyone visits the site.
 *   - Locally: `npm run keep-alive` (reads .env)
 *
 * Required env (either from .env locally, or GitHub Actions repo secrets):
 *   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadDotEnv() {
  const env = {};
  try {
    for (const line of readFileSync(resolve(root, '.env'), 'utf8').split(/\r?\n/)) {
      if (!line || line.startsWith('#')) continue;
      const i = line.indexOf('=');
      if (i === -1) continue;
      env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  } catch {
    /* no local .env — fine in CI, where secrets come from process.env */
  }
  return env;
}

const env = { ...loadDotEnv(), ...process.env };
const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.log('⏭  Skipping keep-alive — no Supabase credentials configured (demo mode). Nothing to protect.');
  process.exit(0);
}

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 5000;

async function ping(attempt = 1) {
  try {
    const res = await fetch(`${url}/rest/v1/scooters?select=id&limit=1`, {
      method: 'GET',
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });

    if (res.ok) {
      console.log(`✓ Supabase keep-alive ping succeeded (HTTP ${res.status}) at ${new Date().toISOString()}`);
      return true;
    }

    console.log(`⚠ Attempt ${attempt}: unexpected HTTP ${res.status}`);
  } catch (err) {
    console.log(`⚠ Attempt ${attempt}: request failed — ${err.message}`);
  }

  if (attempt < MAX_ATTEMPTS) {
    await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    return ping(attempt + 1);
  }
  return false;
}

const ok = await ping();
if (!ok) {
  console.log('❌ Supabase keep-alive failed after retries.');
  process.exit(1);
}
