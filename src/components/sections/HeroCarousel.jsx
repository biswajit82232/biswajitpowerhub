import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Gift, Tag } from 'lucide-react';
import { SiteImage } from '@/components/common/SiteImage';
import { useSitePhotos } from '@/context/SitePhotosContext';
import { useSite } from '@/context/SiteSettingsContext';
import { useAsync } from '@/hooks/useAsync';
import { getActiveOffers } from '@/features/offers/offerService';
import { optimizedImageUrl, isSupabaseStorageUrl } from '@/lib/imageCdn';
import { cn } from '@/lib/utils';

/**
 * Full-bleed dealer hero — showroom slide + promo bar and/or sticky free-with-purchase badge.
 */
export function HeroCarousel({ heroImageUrl }) {
  const { site } = useSite();
  const { photos } = useSitePhotos();
  const { data: offers, loading: offersLoading } = useAsync(() => getActiveOffers(), []);

  const heroOffers = (offers || []).filter((o) => o.showOnHero !== false);
  const promoOffers = heroOffers.filter((o) => o.kind !== 'free_with_purchase');
  const freeOffers = heroOffers.filter((o) => o.kind === 'free_with_purchase');
  const stickyFree = freeOffers[0] || null;

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
  const offerCount = promoOffers.length;

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
  const offer = promoOffers[offerIndex] || promoOffers[0];

  const freeThumb = stickyFree?.imageUrl
    ? isSupabaseStorageUrl(stickyFree.imageUrl)
      ? optimizedImageUrl(stickyFree.imageUrl, 160, 78, { height: 160, resize: 'cover' })
      : stickyFree.imageUrl
    : null;

  return (
    <section className="relative isolate w-full overflow-hidden bg-surface-alt" aria-label="Hero">
      <div className="relative aspect-[16/7] min-h-[220px] w-full sm:min-h-[320px] lg:min-h-[420px]">
        {/* Only mount current + next slide to cut DOM/image weight */}
        {slides.map((s, i) => {
          const active = i === index;
          const near = i === (index + 1) % count;
          if (!active && !near && count > 2) return null;
          return (
            <div
              key={`${s.url || 'empty'}-${i}`}
              className={cn(
                'absolute inset-0 transition-opacity duration-700',
                active ? 'opacity-100' : 'pointer-events-none opacity-0',
              )}
              aria-hidden={!active}
            >
              <SiteImage
                src={s.url}
                alt={s.alt}
                width={960}
                height={420}
                loading={i === 0 ? 'eager' : 'lazy'}
                fetchPriority={i === 0 ? 'high' : undefined}
                optimize
                quality={72}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1280px"
                className="h-full w-full !aspect-auto bg-surface-alt"
                imgClassName="object-cover object-center"
                placeholderLabel="Showroom photos coming soon — visit us at Chunakhali Bus Stand"
              />
            </div>
          );
        })}

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent"
          aria-hidden
        />

        {/* Sticky free-with-purchase badge — red, top-right on hero */}
        {stickyFree ? (
          <Link
            to="/offers"
            className="absolute right-3 top-3 z-20 flex max-w-[11.5rem] items-center gap-2 rounded-xl bg-red-600 px-2.5 py-2 text-white shadow-lg ring-2 ring-white/90 sm:right-5 sm:top-5 sm:max-w-[15rem] sm:gap-2.5 sm:rounded-2xl sm:px-3 sm:py-2.5"
            aria-label={`${stickyFree.discountText} ${stickyFree.title} — free with scooter purchase`}
          >
            {freeThumb ? (
              <img
                src={freeThumb}
                alt=""
                width={48}
                height={48}
                className="h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-white/40 sm:h-12 sm:w-12"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/15 sm:h-12 sm:w-12">
                <Gift className="h-5 w-5" strokeWidth={2.2} />
              </span>
            )}
            <span className="min-w-0">
              <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-white/90 sm:text-[10px]">
                Free with scooty
              </span>
              <span className="mt-0.5 block truncate font-display text-xs font-extrabold leading-tight sm:text-sm">
                {stickyFree.discountText || stickyFree.title}
              </span>
              {stickyFree.title && stickyFree.discountText ? (
                <span className="mt-0.5 block truncate text-[10px] font-medium text-white/90 sm:text-xs">
                  {stickyFree.title}
                </span>
              ) : null}
            </span>
          </Link>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-6 sm:px-8 sm:pb-8">
          <p className="font-display text-xl font-extrabold uppercase tracking-wide text-white drop-shadow sm:text-2xl lg:text-3xl">
            {site.name}
          </p>
          <h1 className="mt-1 font-display text-xs font-bold uppercase leading-snug tracking-wide text-white drop-shadow sm:text-xl lg:text-2xl">
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

      {offersLoading ? null : offer ? (
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
