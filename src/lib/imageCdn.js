const OBJECT_MARKER = '/storage/v1/object/public/';
const RENDER_MARKER = '/storage/v1/render/image/public/';

/**
 * Rewrite a Supabase Storage public URL to the image-render endpoint so the
 * CDN serves a resized (and, for browsers that accept it, webp-converted)
 * variant instead of the full-resolution original. Uploaded photos can be
 * multi-MB PNGs; a 640–1200px webp is typically 30–60 KB.
 *
 * Non-Supabase URLs (data:, local assets, external hosts) pass through as-is.
 */
export function optimizedImageUrl(src, width = 800, quality = 75) {
  if (!src || typeof src !== 'string') return src;
  if (!src.includes(OBJECT_MARKER)) return src;
  const url = src.replace(OBJECT_MARKER, RENDER_MARKER);
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}width=${Math.round(width)}&quality=${quality}`;
}

/** True when the URL points at Supabase Storage (i.e. can be optimized). */
export function isSupabaseStorageUrl(src) {
  return typeof src === 'string' && src.includes(OBJECT_MARKER);
}
