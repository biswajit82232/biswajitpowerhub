import { useState } from 'react';
import { Bike } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Renders a scooter image when a real URL is available; otherwise falls back
 * to a premium branded gradient placeholder keyed by the model's `hue`.
 * This guarantees a polished look even before real photography is uploaded.
 */
const HUES = {
  blue: 'from-brand-100 via-brand-50 to-white text-brand-400',
  teal: 'from-accent-100 via-accent-50 to-white text-accent-500',
  sky: 'from-sky-100 via-sky-50 to-white text-sky-400',
  green: 'from-emerald-100 via-emerald-50 to-white text-emerald-400',
  indigo: 'from-indigo-100 via-indigo-50 to-white text-indigo-400',
  cyan: 'from-cyan-100 via-cyan-50 to-white text-cyan-500',
};

export function ScooterImage({ src, alt, hue = 'blue', className, name, loading = 'lazy', fit = 'cover' }) {
  const [errored, setErrored] = useState(false);
  const showImage = src && !errored;

  return (
    <div className={cn('relative isolate overflow-hidden', className)}>
      {showImage ? (
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          onError={() => setErrored(true)}
          className={cn(
            'h-full w-full',
            fit === 'contain' ? 'object-contain object-center' : 'object-cover',
          )}
        />
      ) : (
        <div
          className={cn(
            'flex h-full w-full flex-col items-center justify-center bg-gradient-to-br p-6',
            HUES[hue] || HUES.blue
          )}
          aria-label={alt}
          role="img"
        >
          {/* Decorative blurred orbs */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/40 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-white/30 blur-2xl" />
          <Bike className="relative h-1/3 max-h-24 w-auto opacity-90" strokeWidth={1.4} />
          {name && (
            <span className="relative mt-3 text-sm font-bold uppercase tracking-widest opacity-70">
              {name}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
