/**
 * Apply Supabase SQL migrations in order (idempotent — safe to re-run).
 * Requires SUPABASE_DB_PASSWORD or DATABASE_URL in .env
 *
 * Usage: npm run db:migrate
 */
import { readFileSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { loadEnv } from './load-env.mjs';

const { Client } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const migrationsDir = resolve(root, 'supabase', 'migrations');

/** Migrations run in this order after schema.sql + seed.sql */
const ORDER = [
  'add_petrol_settings.sql',
  'add_hero_image.sql',
  'create_storage_bucket.sql',
  'add_promotional_offers.sql',
  'add_site_settings.sql',
  'add_site_photos_json.sql',
  'add_file_charges.sql',
  'add_accessories.sql',
  'create_accessory_images_bucket.sql',
  'update_reviews_product_names.sql',
  'create_review_photos_bucket.sql',
  'add_scooter_variants.sql',
  'add_battery_warranty.sql',
  'fix_critical_rls_and_rpc.sql',
  'update_reviews_catalog.sql',
  'update_zoom_max_range.sql',
  'add_scooter_range_tags.sql',
  'add_site_content_json.sql',
  'add_ops_inbox_fields.sql',
  'add_vyapar_sync.sql',
  'add_service_bookings.sql',
  'add_admin_push_subscriptions.sql',
  'lock_admin_rls_allowlist.sql',
  'harden_rls_storage_and_rpc.sql',
  'add_offer_kind_image_hero.sql',
  'revoke_is_admin_anon.sql',
  'rate_limit_upsert_lead.sql',
  'harden_public_writes_push_and_rate_limits.sql',
  'add_lead_attribution.sql',
  'repair_rls_after_replay.sql',
];

function getDatabaseUrl(env) {
  if (env.DATABASE_URL) return env.DATABASE_URL;
  const url = env.VITE_SUPABASE_URL;
  const password = env.SUPABASE_DB_PASSWORD;
  if (!url || !password) return null;
  const ref = url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!ref) throw new Error('Could not parse project ref from VITE_SUPABASE_URL');
  return `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`;
}

async function ensureMigrationTable(client) {
  // RLS with no policies denies all PostgREST access; this connection runs as
  // postgres and bypasses it. Without this the anon key can read migration history.
  await client.query(`
    create table if not exists public.schema_migrations (
      filename text primary key,
      applied_at timestamptz default now()
    );
    alter table public.schema_migrations enable row level security;
    revoke all on table public.schema_migrations from anon, authenticated;
  `);
}

async function isApplied(client, filename) {
  const { rows } = await client.query(
    'select 1 from public.schema_migrations where filename = $1',
    [filename],
  );
  return rows.length > 0;
}

async function markApplied(client, filename) {
  await client.query(
    'insert into public.schema_migrations (filename) values ($1) on conflict do nothing',
    [filename],
  );
}

const env = loadEnv();
const dbUrl = getDatabaseUrl(env);

if (!dbUrl) {
  console.error('\n❌ Missing database credentials.\n');
  console.error('Add to .env or .env.local (from Supabase → Project Settings → Database):');
  console.error('  SUPABASE_DB_PASSWORD=your-database-password\n');
  console.error('Or set DATABASE_URL=postgresql://postgres:...@db.<ref>.supabase.co:5432/postgres\n');
  process.exit(1);
}

const onDisk = new Set(readdirSync(migrationsDir).filter((f) => f.endsWith('.sql') && f !== 'README.md'));
const files = ORDER.filter((f) => onDisk.has(f));

if (files.length === 0) {
  console.error('No migration files found.');
  process.exit(1);
}

const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  console.log('\nConnected to Supabase Postgres.\n');
  await ensureMigrationTable(client);

  let applied = 0;
  let skipped = 0;

  for (const file of files) {
    if (await isApplied(client, file)) {
      console.log(`⏭  ${file} (already applied)`);
      skipped += 1;
      continue;
    }

    const sql = readFileSync(resolve(migrationsDir, file), 'utf8');
    console.log(`▶  ${file}`);
    await client.query(sql);
    await markApplied(client, file);
    applied += 1;
    console.log(`✓  ${file}`);
  }

  console.log(`\nDone — ${applied} applied, ${skipped} skipped.\n`);
} catch (err) {
  console.error('\n❌ Migration failed:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
