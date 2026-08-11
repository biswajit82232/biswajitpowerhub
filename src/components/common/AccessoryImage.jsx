import { useState } from 'react';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { optimizedImageUrl, isSupabaseStorageUrl } from '@/lib/imageCdn';

const HUES = {
  blue: 'from-brand-100 via-brand-50 to-white text-brand-400',
  teal: 'from-accent-100 via-accent-50 to-white text-accent-500',
  sky: 'from-sky-100 via-sky-50 to-white text-sky-400',
  green: 'from-emerald-100 via-emerald-50 to-white text-emerald-400',
  indigo: 'from-indigo-100 via-indigo-50 to-white text-indigo-400',
  cyan: 'from-cyan-100 via-cyan-50 to-white text-cyan-500',
};

export function AccessoryImage({
  src,
  alt,
  hue = 'teal',
  className,
  name,
  loading = 'lazy',
  fit = 'cover',
  width,
  height,
}) {
  // Fallback chain: optimized CDN variant -> original URL -> placeholder.
  const [failStage, setFailStage] = useState(0);
  const canOptimize = isSupabaseStorageUrl(src);
  const exhausted = failStage >= (canOptimize ? 2 : 1);
  const resolvedSrc =
    failStage === 0 && canOptimize ? optimizedImageUrl(src, width || 800) : src;
  const showImage = Boolean(src) && !exhausted;

  return (
    <div className={cn('relative isolate overflow-hidden', className)}>
      {showImage ? (
        <img
          src={resolvedSrc}
          alt={alt}
          width={width || 800}
          height={height || 600}
          loading={loading}
          decoding="async"
          onError={() => setFailStage((s) => s + 1)}
          className={cn(
            'h-full w-full',
            fit === 'contain' ? 'object-contain object-center' : 'object-cover',
          )}
        />
      ) : (
        <div
          className={cn(
            'flex h-full w-full flex-col items-center justify-center bg-gradient-to-br p-6',
            HUES[hue] || HUES.teal
          )}
          aria-label={alt}
          role="img"
        >
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/40 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-white/30 blur-2xl" />
          <Package className="relative h-1/3 max-h-20 w-auto opacity-90" strokeWidth={1.4} />
          {name && (
            <span className="relative mt-3 text-center text-xs font-bold uppercase tracking-widest opacity-70">
              {name}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
