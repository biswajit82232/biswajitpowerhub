/** Algorithmic value badges from scooter specs */

import { parseBatteryKwh } from '@/lib/battery';
import { CHARGE_EFFICIENCY } from '@/lib/simulator';
import { FINANCE_DEFAULTS } from '@/config/finance';

export const VALUE_BADGE_DEFS = {
  best_value: { id: 'best_value', label: 'Best Value', emoji: '⭐', tone: 'warning' },
  longest_range: { id: 'longest_range', label: 'Longest Range', emoji: '⚡', tone: 'brand' },
  lowest_running_cost: { id: 'lowest_running_cost', label: 'Lowest Running Cost', emoji: '💰', tone: 'accent' },
  best_city: { id: 'best_city', label: 'Best City Scooter', emoji: '🏙', tone: 'success' },
};

function parseWeightKg(weight) {
  const m = String(weight || '').match(/([\d.]+)/);
  return m ? Number(m[1]) : 75;
}

function realRange(scooter) {
  return scooter.range * (scooter.realRangeFactor ?? 0.85);
}

/** Estimated electricity cost per km */
function runningCostPerKm(scooter) {
  const kwh = parseBatteryKwh(scooter.batteryCapacity);
  const range = realRange(scooter);
  if (!range || !kwh) return Infinity;
  const energyPerCharge = kwh / CHARGE_EFFICIENCY;
  return (energyPerCharge * FINANCE_DEFAULTS.electricityRatePerUnit) / range;
}

function cityScore(scooter) {
  const range = realRange(scooter);
  const weight = parseWeightKg(scooter.weight);
  const price = scooter.price || 999999;
  let score = range * 0.35 - weight * 0.25 - (price / 100000) * 8;
  if (scooter.noLicence) score += 12;
  if (scooter.topSpeed <= 25) score += 8;
  if (scooter.stock === 'in_stock') score += 5;
  return score;
}

function pickTop(scooters, scoreFn, higherIsBetter = true) {
  if (!scooters?.length) return null;
  let best = scooters[0];
  let bestScore = scoreFn(best);
  for (let i = 1; i < scooters.length; i += 1) {
    const s = scoreFn(scooters[i]);
    if (higherIsBetter ? s > bestScore : s < bestScore) {
      best = scooters[i];
      bestScore = s;
    }
  }
  return best.id;
}

/**
 * Returns Map<scooterId, badge[]>
 * Each scooter gets at most one primary badge; ties allowed across different metrics.
 */
export function computeValueBadges(scooters = []) {
  const inStock = scooters.filter((s) => s.stock !== 'out_of_stock');
  const pool = inStock.length ? inStock : scooters;
  if (!pool.length) return new Map();

  const bestValueId = pickTop(pool, (s) => realRange(s) / (s.price || 1));
  const longestRangeId = pickTop(pool, (s) => s.range || 0);
  const lowestCostId = pickTop(pool, runningCostPerKm, false);
  const bestCityId = pickTop(pool, cityScore);

  const winners = {
    best_value: bestValueId,
    longest_range: longestRangeId,
    lowest_running_cost: lowestCostId,
    best_city: bestCityId,
  };

  const map = new Map();
  for (const [key, id] of Object.entries(winners)) {
    if (!id) continue;
    const badge = VALUE_BADGE_DEFS[key];
    const list = map.get(id) || [];
    list.push(badge);
    map.set(id, list);
  }
  return map;
}

export function getPrimaryValueBadge(scooterId, badgeMap) {
  const list = badgeMap?.get?.(scooterId) || badgeMap?.[scooterId] || [];
  return list[0] || null;
}

export function getAllValueBadges(scooterId, badgeMap) {
  return badgeMap?.get?.(scooterId) || badgeMap?.[scooterId] || [];
}
