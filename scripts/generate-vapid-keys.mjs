/**
 * Generate VAPID keys for admin Web Push.
 * Usage: npm run vapid:generate
 */
import { randomBytes } from 'node:crypto';
import webpush from 'web-push';

const keys = webpush.generateVAPIDKeys();
const notifySecret = randomBytes(24).toString('base64url');

console.log(`
Add these to .env (local) and Vercel Project → Settings → Environment Variables:

# Public — safe for the browser bundle
VITE_VAPID_PUBLIC_KEY=${keys.publicKey}

# Server-only (Vercel /api/admin-notify)
VAPID_PUBLIC_KEY=${keys.publicKey}
VAPID_PRIVATE_KEY=${keys.privateKey}
VAPID_SUBJECT=mailto:your-admin@example.com

# Shared secret for Supabase Database Webhooks → Authorization: Bearer …
ADMIN_NOTIFY_SECRET=${notifySecret}

# Also set on Vercel (server only):
# SUPABASE_SERVICE_ROLE_KEY=…   (Supabase → Settings → API → service_role)
# SUPABASE_URL=https://….supabase.co   (optional if VITE_SUPABASE_URL is already set)
`);
