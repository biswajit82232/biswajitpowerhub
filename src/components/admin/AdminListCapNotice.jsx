import { ADMIN_LIST_LIMIT } from '@/features/leads/leadService';

/** Honesty banner when an admin list hit the soft fetch cap. */
export function AdminListCapNotice({ count, limit = ADMIN_LIST_LIMIT }) {
  if (!count || count < limit) return null;
  return (
    <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 ring-1 ring-amber-100">
      Showing latest {limit.toLocaleString()} rows. Older history is not loaded.
    </p>
  );
}
