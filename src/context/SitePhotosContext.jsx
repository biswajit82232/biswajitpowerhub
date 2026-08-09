import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_SITE_PHOTOS,
  readSitePhotos,
  saveSitePhotos as persistPhotos,
} from '@/features/site/sitePhotosService';
import { getFinanceSettings } from '@/features/finance/financeService';

const SitePhotosContext = createContext(null);

export function SitePhotosProvider({ children }) {
  const [photos, setPhotos] = useState(DEFAULT_SITE_PHOTOS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const local = readSitePhotos();
      try {
        const finance = await getFinanceSettings();
        if (finance?.heroImageUrl && !local.hero?.url) {
          local.hero = { ...local.hero, url: finance.heroImageUrl };
        }
      } catch {
        /* ignore */
      }
      if (!cancelled) setPhotos(local);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const savePhotos = useCallback(async (next) => {
    const saved = await persistPhotos(next);
    setPhotos(saved);
    return saved;
  }, []);

  const value = useMemo(
    () => ({ photos, savePhotos, refresh: () => setPhotos(readSitePhotos()) }),
    [photos, savePhotos],
  );

  return <SitePhotosContext.Provider value={value}>{children}</SitePhotosContext.Provider>;
}

export function useSitePhotos() {
  const ctx = useContext(SitePhotosContext);
  if (!ctx) {
    return {
      photos: DEFAULT_SITE_PHOTOS,
      savePhotos: async (p) => p,
      refresh: () => {},
    };
  }
  return ctx;
}
