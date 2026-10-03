import { Link } from 'react-router-dom';
import { ScooterImage } from '@/components/common/ScooterImage';
import { SalePriceStack } from '@/components/common/SaleMark';
import { useFinance } from '@/context/FinanceSettingsContext';
import { useLocale } from '@/context/LocaleContext';
import { useSaleOffers } from '@/context/SaleOffersContext';
import { useSitePhotos } from '@/context/SitePhotosContext';
import { emiFrom } from '@/lib/finance';
import { buildShowroomGuides, sortByShowroomPrice } from '@/lib/shopperGuide';
import { getStartingPrice } from '@/lib/scooterVariants';
import { formatINR } from '@/lib/utils';

const ROLE_CLASS = {
  lowest: 'bg-navy text-white',
  bestDeal: 'bg-red-600 text-white',
  value: 'bg-emerald-700 text-white',
  next: 'bg-surface-alt text-navy ring-1 ring-line',
};

/**
 * Horizontal price board. Cheapest payable price first, with up to three
 * honest labels (lowest price, best rupee save, most km per rupee).
 */
export function HomeModelPrices({ scooters = [] }) {
  const { t } = useLocale();
  const { quote, offers } = useSaleOffers();
  const { settings } = useFinance();
  const { photos } = useSitePhotos();

  if (!scooters.length) return null;

  const guides = buildShowroomGuides(scooters, offers);
  const roleById = new Map(guides.map((guide) => [guide.id, guide.role]));
  const board = sortByShowroomPrice(scooters, offers);
  return (
    <section className="border-b border-line bg-surface-alt py-6 sm:py-8" aria-labelledby="prices-heading">
      <div className="container-px">
        <h2 id="prices-heading" className="dealer-section-title text-center">
          {t('home.prices')}
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-xs text-muted sm:text-sm">
          {t('home.pricesHint')}
        </p>
        <ul className="mt-5 flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {board.map((scooter) => {
            const priceQuote = quote(getStartingPrice(scooter), scooter.id);
            const emi = emiFrom({ price: priceQuote.sale, settings });
            const role = roleById.get(String(scooter.id));
            const imgSrc = photos?.models?.[scooter.id]?.url || scooter.images?.[0];
            return (
              <li key={scooter.id} className="w-[calc(100%-1.25rem)] shrink-0 snap-start sm:w-[11.5rem]">
                <Link
                  to={`/scooters/${scooter.id}`}
                  className="flex h-full flex-col rounded-2xl bg-white p-3 shadow-soft ring-1 ring-line transition hover:-translate-y-0.5 hover:ring-navy/30"
                >
                  {role ? (
                    <span className={`mb-2 inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${ROLE_CLASS[role] || ROLE_CLASS.next}`}>
                      {t(`guide.${role}`)}
                    </span>
                  ) : (
                    <span className="mb-2 inline-flex h-[18px]" aria-hidden />
                  )}
                  <ScooterImage
                    src={imgSrc}
                    alt=""
                    hue={scooter.hue}
                    name=""
                    width={240}
                    height={160}
                    loading="lazy"
                    className="aspect-[4/3] w-full rounded-xl bg-surface-alt"
                    fit="cover"
                  />
                  <span className="mt-2 block font-display text-sm font-extrabold uppercase tracking-wide text-navy">
                    {scooter.name}
                  </span>
                  <SalePriceStack quote={priceQuote} size="sm" align="start" className="mt-1" caption={false} />
                  <span className="mt-1 block text-[11px] font-semibold text-brand-700">
                    {t('card.emiFrom', { amount: formatINR(emi) })}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
