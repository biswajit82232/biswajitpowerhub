/**
 * Parse battery capacity strings like "48V / 24Ah" into kWh.
 * Falls back to a plain number when already in kWh.
 */
export function parseBatteryKwhOrNull(capacity) {
  if (typeof capacity === 'number' && Number.isFinite(capacity) && capacity > 0) {
    return capacity;
  }

  const text = String(capacity || '').trim();
  if (!text) return null;

  const voltAh = text.match(/(\d+(?:\.\d+)?)\s*V\s*[/\s]+\s*(\d+(?:\.\d+)?)\s*Ah/i);
  if (voltAh) {
    return (Number(voltAh[1]) * Number(voltAh[2])) / 1000;
  }

  const ahOnly = text.match(/(\d+(?:\.\d+)?)\s*Ah/i);
  if (ahOnly) {
    return (48 * Number(ahOnly[1])) / 1000;
  }

  const kwh = text.match(/([\d.]+)\s*kWh/i);
  if (kwh) return Number(kwh[1]);

  const plain = text.match(/^([\d.]+)$/);
  return plain ? Number(plain[1]) : null;
}

export function parseBatteryKwh(capacity) {
  return parseBatteryKwhOrNull(capacity) ?? 1.5;
}
