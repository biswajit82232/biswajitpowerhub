import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_SITE_PHOTOS,
  loadSitePhotos,
  readSitePhotos,
  saveSitePhotos as persistPhotos,
} from '@/features/site/sitePhotosService';
import { getFinanceSettings } from '@/features/finance/financeService';

const SitePhotosContext = createContext(null);

export function SitePhotosProvider({ children }) {
  // Hydrate from local cache immediately so the hero URL is known before network
  // (cuts LCP resource-load delay on repeat visits).
  const [photos, setPhotos] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_SITE_PHOTOS;
    try {
      return readSitePhotos();
    } catch {
      return DEFAULT_SITE_PHOTOS;
    }
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const loaded = await loadSitePhotos();
        try {
          const finance = await getFinanceSettings();
          if (finance?.heroImageUrl && !loaded.hero?.url) {
            loaded.hero = { ...loaded.hero, url: finance.heroImageUrl };
          }
        } catch {
          /* ignore */
        }
        if (!cancelled) setPhotos(loaded);
      } catch {
        /* keep cached / default photos */
      }
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
    () => ({
      photos,
      savePhotos,
      refresh: async () => setPhotos(await loadSitePhotos()),
    }),
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
