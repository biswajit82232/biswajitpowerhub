/** Live catalog copy — prices/ranges from inventory, not hardcoded marketing tables. */

import { formatINR } from '@/lib/utils';
import {
  formatRangeRange,
  getScooterVariants,
} from '@/lib/scooterVariants';
import { quoteStartingPrice } from '@/lib/salePrice';

/** Editorial “best for” lines — not inventory fields. */
export const BEST_FOR_BY_ID = {
  activa: 'Longer Murshidabad trips',
  zoom: 'Premium daily commute',
  'double-light': 'Family errands',
  'single-light': 'Lowest budget',
};

const FALLBACK_ORDER = ['activa', 'zoom', 'double-light', 'single-light'];

function startingQuote(scooter, offers) {
  return quoteStartingPrice(scooter, offers);
}

export function catalogMinPrice(scooters = [], offers) {
  const prices = (scooters || [])
    .map((s) => startingQuote(s, offers).sale)
    .filter((p) => Number.isFinite(p) && p > 0);
  if (!prices.length) return null;
  return Math.min(...prices);
}

export function formatCatalogFromPrice(scooters = [], offers) {
  const min = catalogMinPrice(scooters, offers);
  return min != null ? formatINR(min) : null;
}

/**
 * Comparison rows for SEO / marketing tables from live scooters.
 * Sorted by starting price ascending.
 */
export function buildComparisonRows(scooters = [], offers) {
  const list = [...(scooters || [])];
  list.sort((a, b) => {
    const pa = startingQuote(a, offers).sale;
    const pb = startingQuote(b, offers).sale;
    if (pa !== pb) return pa - pb;
    const ia = FALLBACK_ORDER.indexOf(a.id);
    const ib = FALLBACK_ORDER.indexOf(b.id);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  return list.map((s) => {
    const quote = startingQuote(s, offers);
    return {
      id: s.id,
      slug: s.id,
      model: s.name,
      price: formatINR(quote.sale),
      priceValue: quote.sale,
      listPrice: quote.onSale ? formatINR(quote.list) : '',
      onSale: quote.onSale,
      salePercent: quote.onSale ? quote.percent : 0,
      range: formatRangeRange(s),
      topSpeed: s.topSpeed != null ? `${s.topSpeed} km/h` : '—',
      bestFor: BEST_FOR_BY_ID[s.id] || s.tagline || 'Daily rides',
      noLicence: !!s.noLicence,
    };
  });
}

/** Soft price FAQ answer from live catalog. */
export function buildPriceFaqAnswer(scooters = [], offers) {
  const rows = buildComparisonRows(scooters, offers);
  if (!rows.length) {
    return 'At Biswajit Power Hub, electric scooter prices depend on model and battery pack. Ask for today’s starting price and EMI at our Berhampore showroom.';
  }
  const from = formatINR(rows[0].priceValue);
  const parts = rows.map((r) => `${r.model} from ${r.price}`).join(', ');
  return `At Biswajit Power Hub, electric scooters start from ${from}. Current starting prices: ${parts}. EMI options are available — confirm today’s offer at the showroom.`;
}

export function buildSiteFaqs(baseFaqs = [], scooters = [], offers) {
  return (baseFaqs || []).map((faq) => {
    if (/price of electric scooters/i.test(faq.question || '')) {
      return { ...faq, answer: buildPriceFaqAnswer(scooters, offers) };
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
export function buildModelSeo(scooter, baseMeta = {}, offers) {
  if (!scooter) return baseMeta;
  const quote = startingQuote(scooter, offers);
  const price = formatINR(quote.sale);
  const saleNote = quote.onSale ? ` (was ${formatINR(quote.list)})` : '';
  const range = formatRangeRange(scooter);
  const packs = getScooterVariants(scooter);
  const packNote = packs.length > 1 ? ' Battery pack options available.' : '';
  return {
    title:
      baseMeta.title ||
      `${scooter.name} Electric Scooter Berhampore — Price & Test Ride`,
    description: `Buy ${scooter.name} at Biswajit Power Hub, Chunakhali, Berhampore.${scooter.noLicence ? ' No licence required.' : ''} From ${price}${saleNote}${range && range !== '—' ? ` · ${range}` : ''}.${packNote} Book test ride. Call 096355 05436.`,
    h1:
      baseMeta.h1 ||
      `${scooter.name} Electric Scooter in Berhampore — Price, Features & Test Ride`,
  };
}
