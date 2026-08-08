/** Old Supabase product IDs → canonical model IDs (with optional default variant). */
export const LEGACY_SCOOTER_REDIRECTS = {
  'glide-mini': { id: 'single-light' },
  'metro-eco': { id: 'double-light' },
  'single-light-lithium-pro': { id: 'single-light', variant: 'lithium-pro' },
  'breeze-x': { id: 'activa' },
  'spark-lite': { id: 'zoom' },
  'urban-pro': { id: 'activa' },
  'thunder-gt': null,
  'ceeon-bmw': null,
};

export function resolveLegacyScooterId(id) {
  if (!id || !(id in LEGACY_SCOOTER_REDIRECTS)) return undefined;
  return LEGACY_SCOOTER_REDIRECTS[id];
}
