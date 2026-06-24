import { clamp } from './utils';

/**
 * EV real-world usage model.
 *
 * Inputs:
 *  - scooter: { batteryCapacity ("2.5 kWh"), range (km claimed), realRangeFactor }
 *  - dailyDistance (km/day)
 *  - riderWeight (kg)
 *  - electricityRate (₹/kWh)
 *
 * Assumptions:
 *  - Charging efficiency ~90% (energy drawn from the wall > battery capacity).
 *  - Baseline rider weight 70 kg; range degrades ~0.35% per kg above baseline,
 *    improves slightly below (capped).
 */
const CHARGE_EFFICIENCY = 0.9;
const BASELINE_WEIGHT = 70;

function parseKwh(capacity) {
  if (typeof capacity === 'number') return capacity;
  const m = String(capacity || '').match(/([\d.]+)/);
  return m ? parseFloat(m[1]) : 2;
}

export function simulate({
  scooter,
  dailyDistance,
  riderWeight,
  electricityRate,
  petrolPricePerLitre = 110,
  petrolMileageKmPerLitre = 40,
}) {
  const capacityKwh = parseKwh(scooter?.batteryCapacity);
  const claimedRange = Number(scooter?.range) || 80;
  const realFactor = Number(scooter?.realRangeFactor) || 0.83;

  // Weight adjustment
  const weightDelta = (Number(riderWeight) || BASELINE_WEIGHT) - BASELINE_WEIGHT;
  const weightFactor = clamp(1 - weightDelta * 0.0035, 0.7, 1.08);

  const realRange = Math.round(claimedRange * realFactor * weightFactor);

  // Energy & cost
  const energyPerCharge = capacityKwh / CHARGE_EFFICIENCY; // kWh from wall
  const costPerCharge = energyPerCharge * (Number(electricityRate) || 7);
  const costPerKm = realRange > 0 ? costPerCharge / realRange : 0;

  const daily = Number(dailyDistance) || 0;
  const daysBetweenCharges = daily > 0 ? realRange / daily : 0;
  const monthlyCost = daily * 30 * costPerKm;
  const annualCost = daily * 365 * costPerKm;

  const petrolPrice = Number(petrolPricePerLitre) || 110;
  const petrolMileage = Number(petrolMileageKmPerLitre) || 40;
  const petrolCostPerKm = petrolMileage > 0 ? petrolPrice / petrolMileage : 0;
  const monthlyPetrol = daily * 30 * petrolCostPerKm;
  const annualPetrol = daily * 365 * petrolCostPerKm;
  const annualSavings = Math.max(0, annualPetrol - annualCost);
  const monthlySavings = Math.max(0, monthlyPetrol - monthlyCost);

  return {
    realRange,
    daysBetweenCharges: Number(daysBetweenCharges.toFixed(1)),
    costPerCharge: Math.round(costPerCharge),
    monthlyCost: Math.round(monthlyCost),
    annualCost: Math.round(annualCost),
    costPerKm: Number(costPerKm.toFixed(2)),
    petrolCostPerKm: Number(petrolCostPerKm.toFixed(2)),
    monthlyPetrol: Math.round(monthlyPetrol),
    annualPetrol: Math.round(annualPetrol),
    monthlySavings: Math.round(monthlySavings),
    annualSavings: Math.round(annualSavings),
    rangePct: Math.round(realFactor * weightFactor * 100),
    // Level 3 transparency
    claimedRange,
    weightFactor: Number(weightFactor.toFixed(3)),
    realFactor,
    energyPerCharge: Number(energyPerCharge.toFixed(2)),
  };
}
