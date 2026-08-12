/** Custom event so admin pages can refresh nav inbox badges after mutations. */
export const ADMIN_BADGES_INVALIDATE = 'bph:admin-badges-invalidate';

export function invalidateAdminBadges() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(ADMIN_BADGES_INVALIDATE));
}
