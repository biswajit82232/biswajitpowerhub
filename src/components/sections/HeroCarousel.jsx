import { useCallback, useEffect, useState } from 'react';
import { SiteImage } from '@/components/common/SiteImage';
import { useSitePhotos } from '@/context/SitePhotosContext';
import { useSite } from '@/context/SiteSettingsContext';
import { cn } from '@/lib/utils';

/**
 * Full-bleed dealer hero carousel — showroom / campaign slides, dots only.
 */
export function HeroCarousel({ heroImageUrl }) {
  const { site } = useSite();
  const { photos } = useSitePhotos();
  const slides = [];

  if (photos?.hero?.url || heroImageUrl) {
    slides.push({
      url: photos?.hero?.url || heroImageUrl,
      alt: photos?.hero?.alt || `${site.name} showroom`,
    });
  }
  (photos?.gallery || []).forEach((g) => {
    if (g?.url) slides.push({ url: g.url, alt: g.alt || `${site.name} gallery` });
  });

  if (!slides.length) {
    slides.push({
      url: null,
      alt: `${site.name} electric scooter showroom at Chunakhali Bus Stand Berhampore`,
    });
  }

  const [index, setIndex] = useState(0);
  const count = slides.length;

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % count);
  }, [count]);

  useEffect(() => {
    if (count < 2) return undefined;
    const id = setInterval(next, 5500);
    return () => clearInterval(id);
  }, [count, next]);

  const slide = slides[index];

  return (
    <section className="relative isolate w-full overflow-hidden bg-surface-alt" aria-label="Hero">
      <div className="relative aspect-[16/7] min-h-[220px] w-full sm:min-h-[320px] lg:min-h-[420px]">
        {slides.map((s, i) => (
          <div
            key={`${s.url || 'empty'}-${i}`}
            className={cn(
              'absolute inset-0 transition-opacity duration-700',
              i === index ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
            aria-hidden={i !== index}
          >
            <SiteImage
              src={s.url}
              alt={s.alt}
              width={1920}
              height={840}
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : undefined}
              className="h-full w-full !aspect-auto bg-surface-alt"
              imgClassName="object-cover object-center"
              placeholderLabel="Upload showroom / banner photo"
            />
          </div>
        ))}

        {/* Soft readability gradient — no badges/chips */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-6 sm:px-8 sm:pb-8">
          <p className="font-display text-lg font-extrabold uppercase tracking-wide text-white drop-shadow sm:text-2xl lg:text-3xl">
            {site.name}
          </p>
          <p className="mt-1 text-sm font-medium text-white/90 sm:text-base">{site.tagline}</p>
        </div>

        {count > 1 && (
          <div className="absolute bottom-4 right-4 z-10 flex gap-1.5 sm:bottom-6 sm:right-8">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  'h-1 w-6 rounded-sm transition sm:w-8',
                  i === index ? 'bg-brand-500' : 'bg-white/50 hover:bg-white/80',
                )}
              />
            ))}
          </div>
        )}
      </div>
      <span className="sr-only">
        Slide {index + 1} of {count}: {slide.alt}
      </span>
    </section>
  );
}
