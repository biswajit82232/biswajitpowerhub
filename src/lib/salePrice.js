/** Percent-off sale on selected scooters. List prices stay in inventory; this only quotes them. */

import { formatINR } from './utils.js';
import { getScooterVariants, getStartingPrice } from './scooterVariants.js';

export const SCOOTER_SALE_KIND = 'scooter_sale';
export const MIN_SALE_PERCENT = 1;
export const MAX_SALE_PERCENT = 90;
export const SMART_TECHNIQUE = 'smart';
export const EXACT_TECHNIQUE = 'exact';

export function normalizeSalePercent(value) {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n) || n < MIN_SALE_PERCENT || n > MAX_SALE_PERCENT) return null;
  return n;
}

export function parseScooterIds(value) {
  const raw = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.replace(/[{}]/g, '').split(',')
      : [];
  return [...new Set(raw.map((id) => String(id).trim()).filter(Boolean))];
}

export function normalizePriceTechnique(value) {
  return value === EXACT_TECHNIQUE ? EXACT_TECHNIQUE : SMART_TECHNIQUE;
}

/** Nearest rupee. 10% off ₹45,000 is ₹40,500. This is the ceiling the customer can be charged. */
export function roundSalePrice(listPrice, percent) {
  const price = Number(listPrice);
  const pct = Number(percent);
  if (!Number.isFinite(price) || price <= 0) return 0;
  if (!Number.isFinite(pct) || pct <= 0) return Math.round(price);
  const clamped = Math.min(MAX_SALE_PERCENT, Math.max(0, pct));
  return Math.max(0, Math.round((price * (100 - clamped)) / 100));
}

/**
 * How far a smart price may sit under the exact percent.
 * Caps the extra cut at ₹999 and about 1.5% of the list price.
 */
export function charmBudget(listPrice) {
  const list = Math.max(0, Math.round(Number(listPrice) || 0));
  return Math.min(999, Math.max(100, Math.round(list * 0.015)));
}

/**
 * Showroom endings (…999 / …499) at or below `ceiling`.
 * Returns the highest one inside the extra-discount budget, or the ceiling itself.
 */
export function smartSalePrice(listPrice, percent) {
  const list = Math.max(0, Math.round(Number(listPrice) || 0));
  const exact = roundSalePrice(list, percent);
  if (exact <= 0 || exact >= list) return exact;

  const floor = exact - charmBudget(list);
  let best = null;
  const startK = Math.floor(exact / 1000) + 1;
  for (let k = startK; k >= Math.max(0, startK - 3); k -= 1) {
    for (const ending of [999, 499]) {
      const price = k * 1000 + ending - 1000;
      if (price <= 0 || price > exact || price < floor || price >= list) continue;
      if (best == null || price > best) best = price;
    }
  }
  return best ?? exact;
}

export function isScooterSale(offer) {
  return (
    offer?.kind === SCOOTER_SALE_KIND
    && offer.active !== false
    && normalizeSalePercent(offer.discountPercent) != null
    && parseScooterIds(offer.scooterIds).length > 0
  );
}

/**
 * Best active sale for one scooter. Highest percent wins.
 * A tie keeps the earlier sort order.
 */
export function saleForScooter(scooterId, offers) {
  if (scooterId == null || scooterId === '') return null;
  const id = String(scooterId);
  const matches = (offers || []).filter(
    (offer) => isScooterSale(offer) && parseScooterIds(offer.scooterIds).includes(id),
  );
  if (!matches.length) return null;
  matches.sort((a, b) => {
    const byPercent = Number(b.discountPercent) - Number(a.discountPercent);
    if (byPercent) return byPercent;
    const smartFirst = (offer) => (normalizePriceTechnique(offer.priceTechnique) === SMART_TECHNIQUE ? 0 : 1);
    const byTechnique = smartFirst(a) - smartFirst(b);
    if (byTechnique) return byTechnique;
    return (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0);
  });
  return matches[0];
}

export function quotePrice(listPrice, sale) {
  const list = Math.max(0, Math.round(Number(listPrice) || 0));
  const percent = sale ? normalizeSalePercent(sale.discountPercent) : null;
  const empty = {
    list,
    sale: list,
    exact: list,
    onSale: false,
    percent: 0,
    effectivePercent: 0,
    saved: 0,
    extraSaved: 0,
    technique: null,
    offer: null,
  };
  if (!percent) return empty;

  const technique = normalizePriceTechnique(sale.priceTechnique);
  const exact = roundSalePrice(list, percent);
  const salePrice = technique === EXACT_TECHNIQUE ? exact : smartSalePrice(list, percent);
  const onSale = salePrice < list && salePrice > 0;
  if (!onSale) return { ...empty, exact, technique };
  const saved = list - salePrice;
  return {
    list,
    sale: salePrice,
    exact,
    onSale: true,
    percent,
    effectivePercent: Math.floor((saved / list) * 100),
    saved,
    extraSaved: Math.max(0, exact - salePrice),
    technique,
    offer: sale,
  };
}

/**
 * Biggest rupee saving on the starting pack, among scooters a customer can buy.
 * Needs two or more sale models — a single discounted scooter is not labelled best.
 */
export function bestDealScooterId(scooters, offers) {
  const ranked = (scooters || [])
    .filter((scooter) => scooter && scooter.stock !== 'out_of_stock')
    .map((scooter) => ({ id: String(scooter.id), quote: quoteStartingPrice(scooter, offers) }))
    .filter((row) => row.quote.onSale)
    .sort((a, b) => b.quote.saved - a.quote.saved || a.quote.sale - b.quote.sale);
  if (ranked.length < 2) return null;
  return ranked[0].id;
}

export function quoteScooterPrice(listPrice, scooterId, offers) {
  return quotePrice(listPrice, saleForScooter(scooterId, offers));
}

/** Starting-pack quote, including variants. */
export function quoteStartingPrice(scooter, offers) {
  return quoteScooterPrice(getStartingPrice(scooter), scooter?.id, offers);
}

/**
 * Min–max across battery packs.
 * Returns formatted sale and list spans plus whether any pack is discounted.
 */
export function describePriceRange(scooter, offers) {
  const variants = getScooterVariants(scooter);
  const lists = variants.length
    ? variants.map((variant) => Number(variant.price) || 0)
    : [getStartingPrice(scooter)];
  const quoted = lists.map((price) => quoteScooterPrice(price, scooter?.id, offers));
  const onSale = quoted.some((quote) => quote.onSale);
  const span = (pick) => {
    const values = quoted.map(pick);
    const min = Math.min(...values);
    const max = Math.max(...values);
    return {
      min,
      max,
      text: min === max ? formatINR(min) : `${formatINR(min)} – ${formatINR(max)}`,
    };
  };
  return {
    onSale,
    percent: onSale ? quoted.find((quote) => quote.onSale)?.percent || 0 : 0,
    sale: span((quote) => quote.sale),
    list: span((quote) => quote.list),
  };
}
