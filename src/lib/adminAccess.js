/**
 * Admin access control.
 * Source of truth: Supabase `is_admin()` (JWT email on `admin_allowlist`).
 * `VITE_ADMIN_EMAILS` is an optional extra UI gate — never the only check.
 */

function parseAdminEmails() {
  const raw = import.meta.env?.VITE_ADMIN_EMAILS || '';
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function getAdminEmails() {
  return parseAdminEmails();
}

/** Optional client email list. Empty list means "no extra gate". */
export function passesClientEmailGate(email) {
  const list = parseAdminEmails();
  if (list.length === 0) return true;
  const normalized = (email || '').trim().toLowerCase();
  return Boolean(normalized) && list.includes(normalized);
}

/**
 * @deprecated Prefer `canAccessAdmin` with the DB `is_admin()` result.
 * Kept for demo-mode / RPC-failure fallback.
 */
export function isAdminEmail(email) {
  const list = parseAdminEmails();
  const normalized = (email || '').trim().toLowerCase();
  if (!normalized) return false;
  if (list.length === 0) return !import.meta.env?.PROD;
  return list.includes(normalized);
}

export function canAccessAdmin({ email, isDbAdmin }) {
  if (!isDbAdmin) return false;
  return passesClientEmailGate(email);
}

export function adminAccessHint() {
  const list = parseAdminEmails();
  if (list.length > 0) return null;
  return 'Admin access is granted from the database allowlist (admin_allowlist).';
}
