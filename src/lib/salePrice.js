/** Percent-off sale on selected scooters. List prices stay in inventory; this only quotes them. */

import { formatINR } from './utils.js';
import { getScooterVariants, getStartingPrice } from './scooterVariants.js';

export const SCOOTER_SALE_KIND = 'scooter_sale';
export const MIN_SALE_PERCENT = 1;
export const MAX_SALE_PERCENT = 90;

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

/** Nearest rupee. 10% off ₹45,000 is ₹40,500. */
export function roundSalePrice(listPrice, percent) {
  const price = Number(listPrice);
  const pct = Number(percent);
  if (!Number.isFinite(price) || price <= 0) return 0;
  if (!Number.isFinite(pct) || pct <= 0) return Math.round(price);
  const clamped = Math.min(MAX_SALE_PERCENT, Math.max(0, pct));
  return Math.max(0, Math.round((price * (100 - clamped)) / 100));
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
    return (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0);
  });
  return matches[0];
}

export function quotePrice(listPrice, sale) {
  const list = Math.max(0, Math.round(Number(listPrice) || 0));
  const percent = sale ? normalizeSalePercent(sale.discountPercent) : null;
  if (!percent) {
    return { list, sale: list, onSale: false, percent: 0, saved: 0, offer: null };
  }
  const salePrice = roundSalePrice(list, percent);
  const onSale = salePrice < list;
  return {
    list,
    sale: onSale ? salePrice : list,
    onSale,
    percent: onSale ? percent : 0,
    saved: onSale ? list - salePrice : 0,
    offer: onSale ? sale : null,
  };
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
