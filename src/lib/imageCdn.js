const OBJECT_MARKER = '/storage/v1/object/public/';
const RENDER_MARKER = '/storage/v1/render/image/public/';

/**
 * Rewrite a Supabase Storage public URL to the image-render endpoint so the
 * CDN serves a resized (and, for browsers that accept it, webp-converted)
 * variant instead of the full-resolution original.
 *
 * @param {string} src
 * @param {number} [width=800]
 * @param {number} [quality=75]
 * @param {{ height?: number, resize?: 'cover' | 'contain' | 'fill' }} [opts]
 */
export function optimizedImageUrl(src, width = 800, quality = 75, opts = {}) {
  if (!src || typeof src !== 'string') return src;
  if (!src.includes(OBJECT_MARKER)) return src;
  const url = src.replace(OBJECT_MARKER, RENDER_MARKER);
  const params = new URLSearchParams();
  params.set('width', String(Math.round(width)));
  params.set('quality', String(quality));
  if (opts.height) params.set('height', String(Math.round(opts.height)));
  // When both dimensions are known, cover fills the frame (no letterbox padding
  // baked into the CDN file). Width-only keeps original aspect ratio.
  if (opts.resize) params.set('resize', opts.resize);
  else if (opts.height) params.set('resize', 'cover');
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}${params.toString()}`;
}

/** True when the URL points at Supabase Storage (i.e. can be optimized). */
export function isSupabaseStorageUrl(src) {
  return typeof src === 'string' && src.includes(OBJECT_MARKER);
}
