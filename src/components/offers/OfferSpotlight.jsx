import { Link, useLocation } from 'react-router-dom';
import { useLocale } from '@/context/LocaleContext';
import { useSaleOffers } from '@/context/SaleOffersContext';
import { offerHeadline, offerLook, offerSupport, presentOffers } from '@/components/offers/offerLook';
import { cn } from '@/lib/utils';

/** Every active offer, side by side. Nothing is hidden behind a rotator. */
export function OfferSpotlight({ offers, layout = 'row' }) {
  const { t } = useLocale();
  const list = presentOffers(offers);
  if (!list.length) return null;

  return (
    <ul
      className={cn(
        layout === 'grid'
          ? 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3'
          : 'flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
      )}
      aria-label={t('off.active')}
    >
      {list.map((offer) => {
        const look = offerLook(offer, t);
        const Icon = look.Icon;
        const headline = offerHeadline(offer, t);
        const title = offerSupport(offer);
        return (
          <li
            key={offer.id}
            className={cn(
              layout === 'row' && 'w-[calc(100%-0.85rem)] shrink-0 snap-start sm:w-auto sm:min-w-[18rem] sm:flex-1',
            )}
          >
            <Link
              to={`/offers?offer=${encodeURIComponent(offer.id)}`}
              className={cn(
                'flex h-full min-h-[7.5rem] flex-col justify-between rounded-2xl p-3.5 shadow-soft ring-1 transition hover:-translate-y-0.5',
                look.card,
              )}
            >
              <span className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-white/80">
                  {look.eyebrow}
                </span>
                {look.chip ? (
                  <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide', look.chipClass)}>
                    {look.chip}
                  </span>
                ) : null}
              </span>
              <span className="mt-3 flex items-end gap-2">
                <Icon className="mb-0.5 h-5 w-5 shrink-0" aria-hidden />
                <span className="min-w-0">
                  <span className="block font-display text-lg font-black leading-tight">{headline}</span>
                  {title ? (
                    <span className="mt-0.5 line-clamp-2 block text-xs font-semibold text-white/85">{title}</span>
                  ) : null}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Compact offer row on every public page except home, which has the full set in the hero. */
export function SiteOfferRail() {
  const { pathname } = useLocation();
  const { offers, loading } = useSaleOffers();
  const { t } = useLocale();
  if (pathname === '/' || pathname === '/offers' || loading || !offers?.length) return null;

  return (
    <section className="border-b border-line bg-white" aria-labelledby="site-offers-heading">
      <div className="container-px py-3 sm:py-4">
        <h2 id="site-offers-heading" className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-navy">
          {t('off.onEveryPage')}
        </h2>
        <OfferSpotlight offers={offers} />
      </div>
    </section>
  );
}
