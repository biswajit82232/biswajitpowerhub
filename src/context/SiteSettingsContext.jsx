import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SITE, mergeSiteSettings } from '@/config/site';
import { getSiteSettings, saveSiteSettings as persistSiteSettings } from '@/features/site/siteService';

const SiteSettingsContext = createContext(null);

export function SiteSettingsProvider({ children }) {
  const [site, setSite] = useState(() => mergeSiteSettings({}));
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await getSiteSettings({ bypassCache: true });
      setSite(data);
    } catch {
      setSite(mergeSiteSettings({}));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveSiteSettings = useCallback(async (settings) => {
    const saved = await persistSiteSettings(settings);
    setSite(saved);
    return saved;
  }, []);

  const value = useMemo(
    () => ({ site, loading, refresh, saveSiteSettings }),
    [site, loading, refresh, saveSiteSettings],
  );

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSite() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) {
    return { site: SITE, loading: false, refresh: async () => {}, saveSiteSettings: async () => SITE };
  }
  return ctx;
}
