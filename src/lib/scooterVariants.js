/** Helpers for scooter model variants (Standard / Lithium Pro). */

export function getScooterVariants(scooter) {
  return Array.isArray(scooter?.variants) ? scooter.variants : [];
}

export function hasVariants(scooter) {
  return getScooterVariants(scooter).length > 0;
}

export function getStartingPrice(scooter) {
  const variants = getScooterVariants(scooter);
  if (variants.length) return Math.min(...variants.map((v) => v.price));
  return scooter?.price ?? 0;
}

export function getVariantById(scooter, variantId) {
  const variants = getScooterVariants(scooter);
  if (!variants.length) return null;
  return variants.find((v) => v.id === variantId) || variants[0];
}

/** Merge base scooter with a selected variant for display / EMI / enquiries. */
export function withVariant(scooter, variantId) {
  if (!scooter) return null;
  const variant = getVariantById(scooter, variantId);
  if (!variant) return scooter;

  return {
    ...scooter,
    price: variant.price,
    batteryType: variant.batteryType ?? scooter.batteryType,
    batteryCapacity: variant.batteryCapacity ?? scooter.batteryCapacity,
    batteryWarranty: variant.batteryWarranty ?? scooter.batteryWarranty,
    range: variant.range ?? scooter.range,
    realRangeFactor: variant.realRangeFactor ?? scooter.realRangeFactor,
    selectedVariant: variant,
  };
}

export function formatPriceRange(scooter, formatINR) {
  const variants = getScooterVariants(scooter);
  if (variants.length < 2) return formatINR(getStartingPrice(scooter));
  const prices = variants.map((v) => v.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return formatINR(min);
  return `${formatINR(min)} – ${formatINR(max)}`;
}

/** e.g. "50–65 km" across Standard / Lithium Pro */
export function formatRangeRange(scooter) {
  const variants = getScooterVariants(scooter);
  if (variants.length < 2) return `${scooter.range ?? variants[0]?.range ?? 0} km`;
  const ranges = variants.map((v) => v.range ?? scooter.range).filter((n) => n != null);
  if (!ranges.length) return '—';
  const min = Math.min(...ranges);
  const max = Math.max(...ranges);
  if (min === max) return `${min} km`;
  return `${min}–${max} km`;
}

function parseCapacityParts(capacity) {
  const text = String(capacity || '');
  const voltAh = text.match(/(\d+(?:\.\d+)?)\s*V\s*[/\s·]+\s*(\d+(?:\.\d+)?)\s*Ah/i);
  if (voltAh) return { voltage: Number(voltAh[1]), ah: Number(voltAh[2]) };
  return null;
}

/** e.g. "48V · 24Ah / 40Ah" instead of "48V / 24Ah / 48V / 40Ah" */
export function formatBatteryCapacityRange(scooter) {
  const variants = getScooterVariants(scooter);
  const capacities = variants.length
    ? variants.map((v) => v.batteryCapacity ?? scooter.batteryCapacity).filter(Boolean)
    : [scooter.batteryCapacity].filter(Boolean);

  if (!capacities.length) return '—';

  const parsed = capacities.map(parseCapacityParts).filter(Boolean);
  if (parsed.length === capacities.length) {
    const voltages = [...new Set(parsed.map((p) => p.voltage))];
    const ahs = [...new Set(parsed.map((p) => p.ah))].sort((a, b) => a - b);
    if (voltages.length === 1) {
      return ahs.length === 1
        ? `${voltages[0]}V · ${ahs[0]}Ah`
        : `${voltages[0]}V · ${ahs.map((a) => `${a}Ah`).join(' / ')}`;
    }
  }

  const unique = [...new Set(capacities)];
  if (unique.length === 1) return unique[0].replace(/\s*\/\s*/, ' · ');
  return unique.join(' / ');
}

/** e.g. "Standard / Lithium Pro" */
export function formatBatteryTypeRange(scooter) {
  const variants = getScooterVariants(scooter);
  if (variants.length >= 2) {
    const labels = variants.map((v) => v.name || v.batteryType?.replace(/\s*battery\s*/i, '').trim()).filter(Boolean);
    if (labels.length) return labels.join(' / ');
  }
  return variants[0]?.batteryType ?? scooter.batteryType ?? '—';
}

/** Distinct variant values joined for compare rows (battery, type, etc.) */
export function formatVariantSpec(scooter, key) {
  if (key === 'batteryCapacity') return formatBatteryCapacityRange(scooter);
  if (key === 'batteryType') return formatBatteryTypeRange(scooter);

  const variants = getScooterVariants(scooter);
  if (variants.length < 2) {
    return variants[0]?.[key] ?? scooter[key] ?? '—';
  }
  const values = [...new Set(
    variants.map((v) => v[key] ?? scooter[key]).filter(Boolean),
  )];
  if (!values.length) return '—';
  if (values.length === 1) return values[0];
  return values.join(' / ');
}

export function normalizeScooter(scooter) {
  if (!scooter) return scooter;
  const variants = getScooterVariants(scooter);
  if (!variants.length) return scooter;
  const base = variants.reduce((a, b) => (a.price <= b.price ? a : b));
  return {
    ...scooter,
    price: base.price,
    batteryType: base.batteryType ?? scooter.batteryType,
    batteryCapacity: base.batteryCapacity ?? scooter.batteryCapacity,
    batteryWarranty: base.batteryWarranty ?? scooter.batteryWarranty,
    range: base.range ?? scooter.range,
  };
}

/** Pick the variant with the longest range (for range/suitability estimates). */
export function getMaxRangeVariant(scooter) {
  const variants = getScooterVariants(scooter);
  if (!variants.length) return null;
  return variants.reduce((a, b) => ((a.range ?? 0) >= (b.range ?? 0) ? a : b));
}
