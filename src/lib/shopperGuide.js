/**
 * Honest showroom guides for the homepage.
 * Every pick comes from live stock, the real starting price, and the active sale.
 * A model is used at most once. Out-of-stock models are left out.
 */

import { bestDealScooterId, quoteStartingPrice } from './salePrice.js';
import { getCheapestVariant } from './scooterVariants.js';

function buyable(scooters) {
  return (scooters || []).filter((scooter) => scooter && scooter.stock !== 'out_of_stock');
}

function startingRangeKm(scooter) {
  const variant = getCheapestVariant(scooter);
  const range = Number(variant?.range ?? scooter?.range);
  return Number.isFinite(range) && range > 0 ? range : 0;
}

function byPayablePrice(offers) {
  return (a, b) => {
    const diff = quoteStartingPrice(a, offers).sale - quoteStartingPrice(b, offers).sale;
    if (diff) return diff;
    return String(a.name || a.id).localeCompare(String(b.name || b.id));
  };
}

/**
 * Up to three guides:
 * - lowest: cheapest in-stock starting price (the anchor)
 * - bestDeal: biggest rupee saving, when a sale covers two or more models
 * - value: most kilometres of starting range per rupee
 * Remaining slots fill with the next cheapest in-stock models.
 */
export function buildShowroomGuides(scooters, offers) {
  const pool = buyable(scooters);
  const used = new Set();
  const guides = [];
  const priced = [...pool].sort(byPayablePrice(offers));

  const take = (scooter, role) => {
    if (!scooter || used.has(String(scooter.id)) || guides.length >= 3) return;
    used.add(String(scooter.id));
    guides.push({ id: String(scooter.id), role });
  };

  take(priced[0], 'lowest');

  const bestId = bestDealScooterId(scooters, offers);
  if (bestId) {
    take(pool.find((scooter) => String(scooter.id) === String(bestId)), 'bestDeal');
  }

  const bestValue = pool
    .filter((scooter) => !used.has(String(scooter.id)))
    .map((scooter) => {
      const price = quoteStartingPrice(scooter, offers).sale;
      const km = startingRangeKm(scooter);
      return { scooter, score: price > 0 && km > 0 ? km / price : 0 };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || byPayablePrice(offers)(a.scooter, b.scooter))[0];

  if (bestValue) take(bestValue.scooter, 'value');

  priced.forEach((scooter) => take(scooter, 'next'));

  return guides;
}

/** In-stock models first, then by the price a customer would actually pay. */
export function sortByShowroomPrice(scooters, offers) {
  return [...(scooters || [])].sort((a, b) => {
    const stockA = a?.stock === 'out_of_stock' ? 1 : 0;
    const stockB = b?.stock === 'out_of_stock' ? 1 : 0;
    if (stockA !== stockB) return stockA - stockB;
    return byPayablePrice(offers)(a, b);
  });
}
