/** Catalog-wide stats for marketing copy (Hero, etc.) */

import { FINANCE_DEFAULTS } from '@/config/finance';
import { CHARGE_EFFICIENCY } from '@/lib/simulator';
import { parseBatteryKwh } from '@/lib/battery';
import { getScooterVariants } from '@/lib/scooterVariants';

function variantEntries(scooter) {
  const variants = getScooterVariants(scooter);
  if (!variants.length) return [{ ...scooter }];
  return variants.map((v) => ({
    range: v.range ?? scooter.range,
    batteryCapacity: v.batteryCapacity ?? scooter.batteryCapacity,
    realRangeFactor: v.realRangeFactor ?? scooter.realRangeFactor ?? 0.82,
  }));
}

export function computeCatalogStats(scooters = []) {
  if (!scooters.length) {
    return {
      maxRangeKm: 120,
      minCostPerKm: 0.2,
      minPrice: 43000,
      chargingLabel: '4–6 hrs',
    };
  }

  const electricityRate = FINANCE_DEFAULTS.electricityRatePerUnit;
  let maxRangeKm = 0;
  let minCostPerKm = Infinity;
  let minPrice = Infinity;
  const chargeTimes = new Set();

  for (const scooter of scooters) {
    minPrice = Math.min(minPrice, scooter.price ?? Infinity);
    if (scooter.chargingTime) chargeTimes.add(scooter.chargingTime);

    for (const entry of variantEntries(scooter)) {
      const range = Number(entry.range) || 0;
      if (range > maxRangeKm) maxRangeKm = range;

      const realRange = range * (entry.realRangeFactor ?? 0.82);
      const kwh = parseBatteryKwh(entry.batteryCapacity);
      if (realRange > 0 && kwh > 0) {
        const energyPerCharge = kwh / CHARGE_EFFICIENCY;
        const cost = (energyPerCharge * electricityRate) / realRange;
        if (cost < minCostPerKm) minCostPerKm = cost;
      }
    }
  }

  const chargeList = [...chargeTimes];
  const chargingLabel = chargeList.length === 1
    ? chargeList[0]
    : chargeList.length > 1
      ? '4–6 hrs'
      : '4–6 hrs';

  return {
    maxRangeKm: maxRangeKm || 120,
    minCostPerKm: Number.isFinite(minCostPerKm) ? minCostPerKm : 0.2,
    minPrice: Number.isFinite(minPrice) ? minPrice : 43000,
    chargingLabel,
  };
}

export function formatCostPerKm(value) {
  const rounded = Math.round(value * 100) / 100;
  return `₹${rounded.toFixed(2)}`;
}
