import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { optimizedImageUrl, isSupabaseStorageUrl } from '@/lib/imageCdn';

/**
 * Showroom/model image with gray "Upload Photo" placeholder when src is missing/broken.
 */
export function SiteImage({
  src,
  alt,
  width = 800,
  height = 600,
  loading = 'lazy',
  fetchPriority,
  className,
  imgClassName,
  placeholderLabel = 'Upload Photo',
  /** When false, serve the original Storage URL (no CDN resize/compress). */
  optimize = true,
  quality = 75,
  sizes,
  /** Optional responsive widths for CDN srcset (e.g. [640, 960, 1280]). */
  srcSetWidths,
}) {
  // Fallback chain: optimized CDN variant -> original URL -> placeholder.
  const [failStage, setFailStage] = useState(0);
  const canOptimize = optimize && isSupabaseStorageUrl(src);
  const exhausted = failStage >= (canOptimize ? 2 : 1);

  let resolvedSrc = src;
  let resolvedSrcSet;
  if (failStage === 0 && canOptimize) {
    const w = Math.min(width || 800, 1280);
    const h = Math.min(height || 600, 720);
    resolvedSrc = optimizedImageUrl(src, w, quality, { height: h, resize: 'cover' });
    if (Array.isArray(srcSetWidths) && srcSetWidths.length > 1 && width > 0 && height > 0) {
      resolvedSrcSet = srcSetWidths
        .map((sw) => {
          const sh = Math.round((height / width) * sw);
          return `${optimizedImageUrl(src, sw, quality, { height: sh, resize: 'cover' })} ${sw}w`;
        })
        .join(', ');
    }
  }

  const show = Boolean(src) && !exhausted;

  return (
    <div
      className={cn('relative isolate overflow-hidden bg-brand-50', className)}
      style={{ aspectRatio: width && height ? `${width} / ${height}` : undefined }}
    >
      {show ? (
        <img
          src={resolvedSrc}
          srcSet={resolvedSrcSet}
          alt={alt}
          width={width}
          height={height}
          sizes={resolvedSrcSet ? sizes : undefined}
          loading={loading}
          decoding="async"
          fetchPriority={fetchPriority}
          onError={() => setFailStage((s) => s + 1)}
          className={cn('h-full w-full max-w-full object-cover', imgClassName)}
        />
      ) : (
        <div
          className="flex h-full min-h-[140px] w-full flex-col items-center justify-center gap-2 p-6 text-center"
          role="img"
          aria-label={alt || placeholderLabel}
        >
          <ImageIcon className="h-8 w-8 text-brand-300" strokeWidth={1.5} />
          <span className="text-sm font-semibold text-muted">{placeholderLabel}</span>
          {alt ? <span className="sr-only">{alt}</span> : null}
        </div>
      )}
    </div>
  );
}
