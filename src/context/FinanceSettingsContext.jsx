import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { FINANCE_DEFAULTS } from '@/config/finance';
import { getFinanceSettings } from '@/features/finance/financeService';

const FinanceSettingsContext = createContext(null);

export function FinanceSettingsProvider({ children }) {
  const [settings, setSettings] = useState(FINANCE_DEFAULTS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await getFinanceSettings({ bypassCache: true });
      setSettings(data);
    } catch {
      setSettings({ ...FINANCE_DEFAULTS, heroImageUrl: null });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ settings, loading, refresh }),
    [settings, loading, refresh],
  );

  return (
    <FinanceSettingsContext.Provider value={value}>
      {children}
    </FinanceSettingsContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceSettingsContext);
  if (!ctx) {
    return { settings: FINANCE_DEFAULTS, loading: false, refresh: async () => {} };
  }
  return ctx;
}
