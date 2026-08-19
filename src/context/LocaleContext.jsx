import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { readLocale, translate, writeLocale } from '@/i18n/messages';

const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(() => readLocale());

  const setLocale = useCallback((next) => {
    const value = next === 'bn' ? 'bn' : 'en';
    setLocaleState(value);
    writeLocale(value);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = locale === 'bn' ? 'bn' : 'en';
  }, [locale]);

  const t = useCallback((key, vars) => translate(locale, key, vars), [locale]);

  const value = useMemo(
    () => ({ locale, setLocale, t, isBn: locale === 'bn' }),
    [locale, setLocale, t],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    return {
      locale: 'en',
      setLocale: () => {},
      t: (key, vars) => translate('en', key, vars),
      isBn: false,
    };
  }
  return ctx;
}
