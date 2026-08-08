/**
 * Verify Supabase app connection and report which tables/columns are missing.
 * Usage: node scripts/check-supabase.mjs
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnv() {
  const env = {};
  try {
    for (const line of readFileSync(resolve(root, '.env'), 'utf8').split(/\r?\n/)) {
      if (!line || line.startsWith('#')) continue;
      const i = line.indexOf('=');
      if (i === -1) continue;
      env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  } catch {
    /* no .env */
  }
  return env;
}

async function probe(url, key, path) {
  const res = await fetch(`${url}/rest/v1/${path}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  const body = await res.text();
  return { ok: res.ok, status: res.status, body };
}

const env = { ...loadEnv(), ...process.env };
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;

console.log('\nBISWAJIT POWER HUB — Supabase status\n');

if (!url || !key) {
  console.log('❌ App not connected — add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env');
  process.exit(1);
}

console.log(`✓ Credentials found (${url})\n`);

const checks = [
  { name: 'scooters', path: 'scooters?select=id&limit=1' },
  { name: 'finance_settings', path: 'finance_settings?select=id,interest_rate,file_charges&limit=1' },
  { name: 'site_settings', path: 'site_settings?select=id&limit=1' },
  { name: 'promotional_offers', path: 'promotional_offers?select=id&limit=1' },
  { name: 'accessories', path: 'accessories?select=id&limit=1' },
];

const missing = [];

for (const check of checks) {
  const { status, body } = await probe(url, key, check.path);
  if (status === 200) {
    if (check.name === 'finance_settings' && body.includes('file_charges does not exist')) {
      console.log(`⚠  ${check.name} — missing column: file_charges`);
      missing.push('add_file_charges.sql');
    } else {
      console.log(`✓  ${check.name}`);
    }
  } else if (status === 400 && body.includes('file_charges')) {
    console.log(`⚠  finance_settings — missing column: file_charges`);
    missing.push('add_file_charges.sql');
  } else if (status === 404 || body.includes('Could not find the table')) {
    console.log(`❌ ${check.name} — table missing`);
    if (check.name === 'promotional_offers') missing.push('add_promotional_offers.sql');
    if (check.name === 'accessories') {
      missing.push('add_accessories.sql', 'create_accessory_images_bucket.sql');
    }
  } else {
    console.log(`?  ${check.name} — HTTP ${status}: ${body.slice(0, 120)}`);
  }
}

console.log('');
if (missing.length === 0) {
  console.log('✓ Database schema looks up to date.\n');
} else {
  const unique = [...new Set(missing)];
  console.log('Pending migrations:');
  unique.forEach((m) => console.log(`  • supabase/migrations/${m}`));
  console.log('\nRun: npm run db:migrate\n');
}

if (!env.SUPABASE_DB_PASSWORD && !env.DATABASE_URL) {
  console.log('Tip: add SUPABASE_DB_PASSWORD to .env (Supabase → Settings → Database) to run migrations locally.\n');
}
