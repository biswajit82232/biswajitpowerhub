import { createClient } from '@supabase/supabase-js';

const env = import.meta.env || {};
const url = env.VITE_SUPABASE_URL;
const anonKey = env.VITE_SUPABASE_ANON_KEY;

/**
 * isSupabaseConfigured — when false, the app falls back to local seed data
 * and form submissions are simulated. This keeps the site fully demoable
 * before credentials are wired up.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

if (!isSupabaseConfigured && env.DEV) {
  console.warn(
    '[Supabase] Not configured. Running in demo mode with local seed data. ' +
      'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env to enable persistence.'
  );
}
