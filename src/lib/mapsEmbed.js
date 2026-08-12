const MAPS_EMBED_HOSTS = new Set([
  'www.google.com',
  'google.com',
  'maps.google.com',
  'www.google.co.in',
  'google.co.in',
  'maps.googleapis.com',
]);

/** Only allow Google Maps embed URLs in iframes (admin-controlled setting). */
export function safeMapsEmbedUrl(url) {
  if (!url || typeof url !== 'string') return '';
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return '';
    if (!MAPS_EMBED_HOSTS.has(parsed.hostname.toLowerCase())) return '';
    const path = parsed.pathname.toLowerCase();
    if (!path.includes('/maps') && !path.includes('/embed')) return '';
    return parsed.toString();
  } catch {
    return '';
  }
}
