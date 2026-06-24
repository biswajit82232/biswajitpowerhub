import { clamp } from './utils';

/**
 * EV real-world usage model.
 * Charging efficiency ~90%; baseline rider weight 70 kg for range adjustment.
 */
export const CHARGE_EFFICIENCY = 0.9;
const BASELINE_WEIGHT = 70;

function parseKwh(capacity) {
  if (typeof capacity === 'number') return capacity;
  const m = String(capacity || '').match(/([\d.]+)/);
  return m ? parseFloat(m[1]) : 2;
}

export function simulate({
  scooter,
  dailyDistance,
  riderWeight = BASELINE_WEIGHT,
  electricityRate,
  petrolPricePerLitre = 110,
  petrolMileageKmPerLitre = 40,
}) {
  const capacityKwh = parseKwh(scooter?.batteryCapacity);
  const claimedRange = Number(scooter?.range) || 80;
  const realFactor = Number(scooter?.realRangeFactor) || 0.83;

  const weightDelta = (Number(riderWeight) || BASELINE_WEIGHT) - BASELINE_WEIGHT;
  const weightFactor = clamp(1 - weightDelta * 0.0035, 0.7, 1.08);

  const realRange = Math.round(claimedRange * realFactor * weightFactor);

  const energyPerCharge = capacityKwh / CHARGE_EFFICIENCY;
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

  const evSpendPer100 =
    petrolCostPerKm > 0 ? Math.round((costPerKm / petrolCostPerKm) * 100) : 0;

  return {
    realRange,
    daysBetweenCharges,
    costPerCharge: Math.round(costPerCharge),
    monthlyCost: Math.round(monthlyCost),
    annualCost: Math.round(annualCost),
    costPerKm: Number(costPerKm.toFixed(2)),
    petrolCostPerKm: Number(petrolCostPerKm.toFixed(2)),
    monthlyPetrol: Math.round(monthlyPetrol),
    annualPetrol: Math.round(annualPetrol),
    monthlySavings: Math.round(monthlySavings),
    annualSavings: Math.round(annualSavings),
    evSpendPer100: Math.min(100, evSpendPer100),
    costMultiplier:
      costPerKm > 0 ? Number((petrolCostPerKm / costPerKm).toFixed(1)) : 0,
    claimedRange,
    weightFactor: Number(weightFactor.toFixed(3)),
    realFactor,
    energyPerCharge: Number(energyPerCharge.toFixed(2)),
  };
}

/** Human-friendly charging frequency — never show decimal "days". */
export function getChargingHabit(daysBetweenCharges) {
  if (daysBetweenCharges >= 2.5) {
    return {
      label: 'Charge every 2–3 days',
      detail: 'Overnight charging fits easily into your routine.',
    };
  }
  if (daysBetweenCharges >= 1.25) {
    return {
      label: 'Charge about once per day',
      detail: 'Plug in overnight — ready every morning.',
    };
  }
  return {
    label: 'Charge once daily',
    detail: 'Higher daily travel — a quick overnight top-up keeps you going.',
  };
}

/** How well this scooter fits the rider's daily distance. */
export function getSuitability(dailyKm, realRangeKm) {
  if (!realRangeKm || !dailyKm) {
    return {
      label: 'Good Match',
      message: 'Adjust daily travel to see how well this model fits.',
      tone: 'good',
    };
  }

  const ratio = dailyKm / realRangeKm;

  if (ratio <= 0.65) {
    return {
      label: 'Excellent Match',
      message: "Your daily travel is well within this scooter's practical range.",
      tone: 'excellent',
    };
  }
  if (ratio <= 0.9) {
    return {
      label: 'Good Match',
      message: 'Comfortable for your daily commute with range to spare.',
      tone: 'good',
    };
  }
  if (ratio <= 1.1) {
    return {
      label: 'Fair Match',
      message: 'Plan for daily charging — still far cheaper than petrol.',
      tone: 'fair',
    };
  }
  return {
    label: 'Consider Longer Range',
    message: 'Your daily travel is high — a bigger battery model may suit you better.',
    tone: 'stretch',
  };
}

/** Short conversion-focused insight line. */
export function getSmartInsight(result) {
  const mult = result.costMultiplier;
  if (mult >= 9) {
    return `You're spending nearly ${Math.round(mult)}× more on petrol than charging.`;
  }
  if (mult >= 5) {
    return `Petrol costs about ${Math.round(mult)}× more per km than home charging.`;
  }
  if (result.annualSavings >= 30000) {
    return `That's over ₹${Math.round(result.annualSavings / 1000)}k back in your pocket every year.`;
  }
  return 'Every km on electric costs a fraction of petrol — the savings add up fast.';
}

export const SUITABILITY_STYLES = {
  excellent: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  good: 'bg-teal-50 text-teal-800 ring-teal-200',
  fair: 'bg-amber-50 text-amber-800 ring-amber-200',
  stretch: 'bg-orange-50 text-orange-800 ring-orange-200',
};
