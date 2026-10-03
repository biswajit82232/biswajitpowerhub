import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getActiveOffers } from '@/features/offers/offerService';
import { quotePrice, saleForScooter } from '@/lib/salePrice';

const SaleOffersContext = createContext(null);

export function SaleOffersProvider({ children }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await getActiveOffers();
      setOffers(Array.isArray(data) ? data : []);
    } catch {
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(() => ({
    offers,
    loading,
    refresh,
    saleFor: (scooterId) => saleForScooter(scooterId, offers),
    quote: (listPrice, scooterId) => quotePrice(listPrice, saleForScooter(scooterId, offers)),
  }), [offers, loading, refresh]);

  return (
    <SaleOffersContext.Provider value={value}>
      {children}
    </SaleOffersContext.Provider>
  );
}

export function useSaleOffers() {
  const ctx = useContext(SaleOffersContext);
  if (!ctx) {
    return {
      offers: [],
      loading: false,
      refresh: async () => {},
      saleFor: () => null,
      quote: (listPrice) => quotePrice(listPrice, null),
    };
  }
  return ctx;
}
