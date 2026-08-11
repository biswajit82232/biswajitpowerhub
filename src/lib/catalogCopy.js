/** Live catalog copy — prices/ranges from inventory, not hardcoded marketing tables. */

import { formatINR } from '@/lib/utils';
import {
  formatRangeRange,
  getStartingPrice,
  getScooterVariants,
} from '@/lib/scooterVariants';

/** Editorial “best for” lines — not inventory fields. */
export const BEST_FOR_BY_ID = {
  activa: 'Longer Murshidabad trips',
  zoom: 'Premium daily commute',
  'double-light': 'Family errands',
  'single-light': 'Lowest budget',
};

const FALLBACK_ORDER = ['activa', 'zoom', 'double-light', 'single-light'];

export function catalogMinPrice(scooters = []) {
  const prices = (scooters || [])
    .map((s) => getStartingPrice(s))
    .filter((p) => Number.isFinite(p) && p > 0);
  if (!prices.length) return null;
  return Math.min(...prices);
}

export function formatCatalogFromPrice(scooters = []) {
  const min = catalogMinPrice(scooters);
  return min != null ? formatINR(min) : null;
}

/**
 * Comparison rows for SEO / marketing tables from live scooters.
 * Sorted by starting price ascending.
 */
export function buildComparisonRows(scooters = []) {
  const list = [...(scooters || [])];
  list.sort((a, b) => {
    const pa = getStartingPrice(a);
    const pb = getStartingPrice(b);
    if (pa !== pb) return pa - pb;
    const ia = FALLBACK_ORDER.indexOf(a.id);
    const ib = FALLBACK_ORDER.indexOf(b.id);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  return list.map((s) => {
    const starting = getStartingPrice(s);
    return {
      id: s.id,
      slug: s.id,
      model: s.name,
      price: formatINR(starting),
      priceValue: starting,
      range: formatRangeRange(s),
      topSpeed: s.topSpeed != null ? `${s.topSpeed} km/h` : '—',
      bestFor: BEST_FOR_BY_ID[s.id] || s.tagline || 'Daily rides',
      noLicence: !!s.noLicence,
    };
  });
}

/** Soft price FAQ answer from live catalog. */
export function buildPriceFaqAnswer(scooters = []) {
  const rows = buildComparisonRows(scooters);
  if (!rows.length) {
    return 'At Biswajit Power Hub, electric scooter prices depend on model and battery pack. Ask for today’s starting price and EMI at our Berhampore showroom.';
  }
  const from = formatINR(rows[0].priceValue);
  const parts = rows.map((r) => `${r.model} from ${r.price}`).join(', ');
  return `At Biswajit Power Hub, electric scooters start from ${from}. Current starting prices: ${parts}. EMI options are available — confirm today’s offer at the showroom.`;
}

export function buildSiteFaqs(baseFaqs = [], scooters = []) {
  return (baseFaqs || []).map((faq) => {
    if (/price of electric scooters/i.test(faq.question || '')) {
      return { ...faq, answer: buildPriceFaqAnswer(scooters) };
    }
    if (/range per full charge/i.test(faq.question || '')) {
      const ranges = (scooters || [])
        .map((s) => formatRangeRange(s))
        .filter(Boolean);
      if (!ranges.length) return faq;
      return {
        ...faq,
        answer: `Range depends on model and battery pack. Across our current lineup you’ll see figures like ${ranges.join('; ')}. Custom battery upgrades are also available at our Berhampore showroom for extra range.`,
      };
    }
    return faq;
  });
}

/** PDP / meta description with live starting price. */
export function buildModelSeo(scooter, baseMeta = {}) {
  if (!scooter) return baseMeta;
  const price = formatINR(getStartingPrice(scooter));
  const range = formatRangeRange(scooter);
  const packs = getScooterVariants(scooter);
  const packNote = packs.length > 1 ? ' Battery pack options available.' : '';
  return {
    title:
      baseMeta.title ||
      `${scooter.name} Electric Scooter Berhampore — Price & Test Ride`,
    description: `Buy ${scooter.name} at Biswajit Power Hub, Chunakhali, Berhampore.${scooter.noLicence ? ' No licence required.' : ''} From ${price}${range && range !== '—' ? ` · ${range}` : ''}.${packNote} Book test ride. Call 096355 05436.`,
    h1:
      baseMeta.h1 ||
      `${scooter.name} Electric Scooter in Berhampore — Price, Features & Test Ride`,
  };
}
