/**
 * Fail Vercel Production builds if the SPA would ship in demo mode.
 * Preview / local / CI builds without VERCEL_ENV=production are allowed.
 */
const isVercelProduction = process.env.VERCEL_ENV === 'production';

if (!isVercelProduction) {
  process.exit(0);
}

const missing = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_SITE_URL'].filter(
  (key) => !String(process.env[key] || '').trim(),
);

if (missing.length) {
  console.error(
    `[assert-prod-env] Missing ${missing.join(', ')} on Vercel Production. Refusing to ship demo mode.`,
  );
  process.exit(1);
}
