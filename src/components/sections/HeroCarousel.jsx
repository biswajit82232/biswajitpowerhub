import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag } from 'lucide-react';
import { SiteImage } from '@/components/common/SiteImage';
import { SaleOfferSticker } from '@/components/common/SaleOfferSticker';
import { useSitePhotos } from '@/context/SitePhotosContext';
import { useSite } from '@/context/SiteSettingsContext';
import { useAsync } from '@/hooks/useAsync';
import { getActiveOffers } from '@/features/offers/offerService';
import { HERO_IMAGE } from '@/lib/imageCdn';
import { cn } from '@/lib/utils';
import { useLocale } from '@/context/LocaleContext';

/**
 * Full-bleed dealer hero — showroom slide + promo bar and/or sticky sale sticker.
 */
export function HeroCarousel({ heroImageUrl }) {
  const { site } = useSite();
  const { t } = useLocale();
  const { photos } = useSitePhotos();
  const { data: offers, loading: offersLoading } = useAsync(() => getActiveOffers(), []);

  const heroOffers = (offers || []).filter((o) => o.showOnHero !== false);
  const promoOffers = heroOffers.filter((o) => o.kind !== 'free_with_purchase');
  const freeOffers = heroOffers.filter((o) => o.kind === 'free_with_purchase');
  // Sticker is free-with-purchase only — never duplicate the promo bar.
  const stickerOffer = freeOffers[0] || null;

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
  // Defer mounting the next slide so LCP isn't competing for bandwidth.
  const [mountNear, setMountNear] = useState(false);
  const count = slides.length;
  const offerCount = promoOffers.length;

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % count);
  }, [count]);

  useEffect(() => {
    if (count < 2) return undefined;
    let idleId;
    let timeoutId;
    const enable = () => setMountNear(true);
    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(enable, { timeout: 3500 });
    } else {
      timeoutId = window.setTimeout(enable, 2800);
    }
    return () => {
      if (idleId != null && 'cancelIdleCallback' in window) window.cancelIdleCallback(idleId);
      if (timeoutId != null) window.clearTimeout(timeoutId);
    };
  }, [count]);

  useEffect(() => {
    if (count < 2 || !mountNear) return undefined;
    const id = setInterval(next, 5500);
    return () => clearInterval(id);
  }, [count, next, mountNear]);

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

  return (
    <section className="relative isolate w-full bg-surface-alt" aria-label="Hero">
      <div className="relative aspect-[16/7] min-h-[220px] w-full overflow-hidden sm:min-h-[320px] lg:min-h-[420px]">
        {/* Only mount current (+ next after idle) to protect LCP bandwidth */}
        {slides.map((s, i) => {
          const active = i === index;
          const near = mountNear && i === (index + 1) % count;
          if (!active && !near && count > 2) return null;
          if (!active && !near && count === 2 && !mountNear) return null;
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
                width={HERO_IMAGE.baseWidth}
                height={HERO_IMAGE.baseHeight}
                loading={i === 0 ? 'eager' : 'lazy'}
                fetchPriority={i === 0 ? 'high' : undefined}
                optimize
                quality={HERO_IMAGE.quality}
                srcSetWidths={i === 0 ? HERO_IMAGE.widths : undefined}
                sizes={HERO_IMAGE.sizes}
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

        <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-6 sm:px-8 sm:pb-8">
          <p className="font-display text-xl font-extrabold uppercase tracking-wide text-white drop-shadow sm:text-2xl lg:text-3xl">
            {site.name}
          </p>
          <h1 className="mt-1 font-display text-xs font-bold uppercase leading-snug tracking-wide text-white drop-shadow sm:text-xl lg:text-2xl">
            {t('home.h1')}
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
                onClick={() => {
                  setMountNear(true);
                  setIndex(i);
                }}
                className={cn(
                  'h-1 w-6 rounded-sm transition sm:w-8',
                  i === index ? 'bg-brand-500' : 'bg-white/50 hover:bg-white/80',
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sale sticker sits above the clipped media so the burst is never cut off */}
      {stickerOffer ? (
        <SaleOfferSticker
          offer={stickerOffer}
          to={`/offers?offer=${encodeURIComponent(stickerOffer.id)}`}
          className="right-2 top-2 z-30 sm:right-4 sm:top-3 lg:right-6 lg:top-4"
        />
      ) : null}

      {/* Reserve promo-bar height while loading to avoid pushing #models (CLS). */}
      {offersLoading ? (
        <div className="min-h-[4.75rem] border-t border-brand-600 bg-brand-500 sm:min-h-[5.5rem]" aria-hidden />
      ) : offer ? (
        <Link
          to={`/offers?offer=${encodeURIComponent(offer.id)}`}
          className="block min-h-[4.75rem] border-t border-brand-600 bg-brand-500 text-white transition hover:bg-brand-600 sm:min-h-[5.5rem]"
          aria-label={`View offer: ${offer.discountText}${offer.title ? ` — ${offer.title}` : ''}`}
        >
          <div className="container-px flex items-center justify-between gap-3 py-2.5 sm:gap-6 sm:py-3.5">
            <div className="min-w-0 flex-1 text-left">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/85 sm:text-[10px] sm:tracking-[0.18em]">
                {t('home.offer')}{offerCount > 1 ? ` · ${offerIndex + 1}/${offerCount}` : ''}
              </p>
              <p className="mt-0.5 font-display text-[13px] font-black leading-snug tracking-tight text-white sm:text-lg">
                {offer.discountText}
              </p>
              {offer.title && offer.title !== offer.discountText ? (
                <p className="mt-0.5 text-[11px] font-semibold leading-snug text-white/90 sm:text-sm">
                  {offer.title}
                </p>
              ) : null}
              {offer.promoCode ? (
                <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-md bg-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-brand-600 sm:text-xs">
                  <Tag className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden />
                  {t('home.code')} {offer.promoCode}
                </p>
              ) : null}
            </div>
            <span className="inline-flex h-9 shrink-0 items-center justify-center rounded-dealer border border-white bg-white px-3 text-[10px] font-black uppercase tracking-wide text-brand-600 sm:h-11 sm:px-5 sm:text-xs">
              {t('home.details')}
            </span>
          </div>
        </Link>
      ) : null}

      <span className="sr-only">
        Slide {index + 1} of {count}: {slide.alt}
      </span>
    </section>
  );
}
