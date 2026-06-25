/**
 * Parse battery capacity strings like "48V / 24Ah" into kWh.
 * Falls back to a plain number when already in kWh.
 */
export function parseBatteryKwh(capacity) {
  if (typeof capacity === 'number' && Number.isFinite(capacity)) return capacity;

  const text = String(capacity || '');
  const voltAh = text.match(/(\d+(?:\.\d+)?)\s*V\s*[/\s]+\s*(\d+(?:\.\d+)?)\s*Ah/i);
  if (voltAh) {
    return (Number(voltAh[1]) * Number(voltAh[2])) / 1000;
  }

  const ahOnly = text.match(/(\d+(?:\.\d+)?)\s*Ah/i);
  if (ahOnly) {
    return (48 * Number(ahOnly[1])) / 1000;
  }

  const plain = text.match(/([\d.]+)/);
  return plain ? Number(plain[1]) : 1.5;
}
