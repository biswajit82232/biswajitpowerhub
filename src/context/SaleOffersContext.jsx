import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getActiveOffers } from '@/features/offers/offerService';
import { getScooters } from '@/features/scooters/scooterService';
import { bestDealScooterId, quotePrice, saleForScooter } from '@/lib/salePrice';

const SaleOffersContext = createContext(null);

export function SaleOffersProvider({ children }) {
  const [offers, setOffers] = useState([]);
  const [scooters, setScooters] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [data, catalog] = await Promise.all([
        getActiveOffers().catch(() => []),
        getScooters().catch(() => []),
      ]);
      setOffers(Array.isArray(data) ? data : []);
      setScooters(Array.isArray(catalog) ? catalog : []);
    } catch {
      setOffers([]);
      setScooters([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(() => {
    const bestId = bestDealScooterId(scooters, offers);
    return {
      offers,
      loading,
      refresh,
      saleFor: (scooterId) => saleForScooter(scooterId, offers),
      quote: (listPrice, scooterId) => quotePrice(listPrice, saleForScooter(scooterId, offers)),
      isBestDeal: (scooterId) => bestId != null && String(scooterId) === bestId,
    };
  }, [offers, scooters, loading, refresh]);

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
      isBestDeal: () => false,
    };
  }
  return ctx;
}
