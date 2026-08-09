import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

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
}) {
  const [errored, setErrored] = useState(false);
  const show = Boolean(src) && !errored;

  return (
    <div
      className={cn('relative isolate overflow-hidden bg-brand-50', className)}
      style={{ aspectRatio: width && height ? `${width} / ${height}` : undefined }}
    >
      {show ? (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          decoding="async"
          fetchPriority={fetchPriority}
          onError={() => setErrored(true)}
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
