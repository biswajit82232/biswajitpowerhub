/**
 * Admin access control — restrict /admin to allowlisted emails.
 * Set VITE_ADMIN_EMAILS=comma,separated,emails in .env / Vercel.
 */

function parseAdminEmails() {
  const raw = import.meta.env.VITE_ADMIN_EMAILS || '';
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function getAdminEmails() {
  return parseAdminEmails();
}

export function isAdminEmail(email) {
  const list = parseAdminEmails();
  const normalized = (email || '').trim().toLowerCase();
  if (!normalized) return false;

  if (list.length === 0) {
    // Dev: allow any authenticated user when unset. Prod: deny until configured.
    return !import.meta.env.PROD;
  }

  return list.includes(normalized);
}

export function adminAccessHint() {
  const list = parseAdminEmails();
  if (list.length > 0) return null;
  if (import.meta.env.PROD) {
    return 'Admin access is not configured. Set VITE_ADMIN_EMAILS on the server.';
  }
  return 'Dev mode: any Supabase user can access admin. Set VITE_ADMIN_EMAILS for production.';
}
