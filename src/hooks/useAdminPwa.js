import { useEffect } from 'react';
import { setupAdminPwa, teardownAdminPwa, bindInstallPrompt } from '@/lib/adminPwa';

/** Activate admin PWA manifest + service worker while mounted (admin routes only). */
export function useAdminPwa() {
  useEffect(() => {
    setupAdminPwa();
    const unbind = bindInstallPrompt();
    return () => {
      unbind();
      teardownAdminPwa();
    };
  }, []);
}
