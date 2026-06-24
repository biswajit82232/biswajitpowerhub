import { useAdminPwa } from '@/hooks/useAdminPwa';

/** Invisible — wires admin PWA manifest + service worker. */
export function AdminPwaSetup() {
  useAdminPwa();
  return null;
}
