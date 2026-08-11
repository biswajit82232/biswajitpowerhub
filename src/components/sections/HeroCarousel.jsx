import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag } from 'lucide-react';
import { SiteImage } from '@/components/common/SiteImage';
import { useSitePhotos } from '@/context/SitePhotosContext';
import { useSite } from '@/context/SiteSettingsContext';
import { useAsync } from '@/hooks/useAsync';
import { getActiveOffers } from '@/features/offers/offerService';
import { cn } from '@/lib/utils';

/**
 * Full-bleed dealer hero carousel — showroom slides + active offer bar.
 */
export function HeroCarousel({ heroImageUrl }) {
  const { site } = useSite();
  const { photos } = useSitePhotos();
  const { data: offers, loading: offersLoading } = useAsync(() => getActiveOffers(), []);
  const activeOffers = offers?.length ? offers : [];

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
  const [offerIndex, setOfferIndex] = useState(0);
  const count = slides.length;
  const offerCount = activeOffers.length;

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % count);
  }, [count]);

  useEffect(() => {
    if (count < 2) return undefined;
    const id = setInterval(next, 5500);
    return () => clearInterval(id);
  }, [count, next]);

  useEffect(() => {
    if (offerCount < 2) return undefined;
    const id = setInterval(() => {
      setOfferIndex((i) => (i + 1) % offerCount);
    }, 4500);
    return () => clearInterval(id);
  }, [offerCount]);

  useEffect(() => {
    setOfferIndex(0);
  }, [offerCount]);

  const slide = slides[index];
  const offer = activeOffers[offerIndex] || activeOffers[0];

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
              optimize={false}
              className="h-full w-full !aspect-auto bg-surface-alt"
              imgClassName="object-cover object-center"
              placeholderLabel="Showroom photos coming soon — visit us at Chunakhali Bus Stand"
            />
          </div>
        ))}

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-6 sm:px-8 sm:pb-8">
          <p className="font-display text-lg font-extrabold uppercase tracking-wide text-white drop-shadow sm:text-2xl lg:text-3xl">
            {site.name}
          </p>
          <h1 className="mt-1 font-display text-base font-bold uppercase leading-snug tracking-wide text-white drop-shadow sm:text-xl lg:text-2xl">
            Best Electric Scooter Dealer in Berhampore, Murshidabad
          </h1>
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

      {offersLoading ? (
        // Reserve the offer-bar space while offers load to avoid layout shift.
        <div className="border-t border-brand-600 bg-brand-500 text-white" aria-hidden>
          <div className="container-px flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-3.5">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">
                Current offer
              </p>
              <p className="mt-0.5 h-6 w-56 max-w-full animate-pulse rounded bg-white/25 sm:h-7" />
              <p className="mt-0.5 h-4 w-32 max-w-full animate-pulse rounded bg-white/20" />
            </div>
            <span className="inline-flex h-10 w-full shrink-0 animate-pulse rounded-dealer bg-white/30 sm:w-28" />
          </div>
        </div>
      ) : offer ? (
        <div className="border-t border-brand-600 bg-brand-500 text-white">
          <div className="container-px flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-3.5">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">
                Current offer{offerCount > 1 ? ` · ${offerIndex + 1}/${offerCount}` : ''}
              </p>
              <p className="mt-0.5 truncate font-display text-base font-extrabold uppercase tracking-wide sm:text-lg">
                {offer.discountText}
                {offer.title ? (
                  <span className="ml-2 font-semibold normal-case tracking-normal text-white/95">
                    {offer.title}
                  </span>
                ) : null}
              </p>
              {offer.promoCode ? (
                <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-white/90">
                  <Tag className="h-3.5 w-3.5" />
                  Code {offer.promoCode}
                </p>
              ) : null}
            </div>
            <Link
              to="/offers"
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-dealer border border-white bg-white px-4 text-xs font-bold uppercase tracking-wide text-brand-600 transition hover:bg-brand-50"
            >
              View Offers
            </Link>
          </div>
        </div>
      ) : null}

      <span className="sr-only">
        Slide {index + 1} of {count}: {slide.alt}
      </span>
    </section>
  );
}
