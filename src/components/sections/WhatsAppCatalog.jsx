import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { ScooterImage } from '@/components/common/ScooterImage';
import { useAsync } from '@/hooks/useAsync';
import { getScooters } from '@/features/scooters/scooterService';
import { SCOOTERS } from '@/data/scooters';
import { getStartingPrice } from '@/lib/scooterVariants';
import { formatINR } from '@/lib/utils';
import { whatsappCatalogUrl } from '@/lib/whatsappLinks';
import { useSite } from '@/context/SiteSettingsContext';
import { useSitePhotos } from '@/context/SitePhotosContext';
import { useLocale } from '@/context/LocaleContext';
import { trackEvent, EVENT } from '@/lib/tracking';

function trackCatalog(from, extra = {}) {
  trackEvent(EVENT.WHATSAPP_CLICK, { from, channel: 'whatsapp-catalog', ...extra });
}

/**
 * WhatsApp Business catalog — opens the official catalog in the WhatsApp app.
 * Product tiles are a preview from this website (Meta does not offer a free embed).
 */
export function WhatsAppCatalog() {
  const { site } = useSite();
  const { t } = useLocale();
  const { photos } = useSitePhotos();
  const catalogUrl = whatsappCatalogUrl(site);
  const { data: remote } = useAsync(() => getScooters(), []);
  const scooters = (remote?.length ? remote : SCOOTERS).slice(0, 4);

  if (!catalogUrl) return null;

  return (
    <section
      id="catalog"
      className="scroll-mt-[calc(var(--header-offset)+0.75rem)] border-t border-line bg-surface-alt py-8 sm:py-12"
      aria-labelledby="wa-catalog-heading"
    >
      <div className="container-px">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-500">
          {t('cta.whatsapp')}
        </p>
        <h2 id="wa-catalog-heading" className="dealer-section-title mt-2 !text-left">
          {t('social.catalogTitle')}
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-body sm:text-base">
          {t('social.catalogSub')}
        </p>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            href={catalogUrl}
            variant="whatsapp"
            size="dealer"
            onClick={() => trackCatalog('social-catalog')}
          >
            {t('social.catalogCta')}
          </Button>
        </div>

        {scooters.length ? (
          <ul className="-mx-4 mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
            {scooters.map((scooter) => {
              const img = photos?.models?.[scooter.id]?.url || scooter.images?.[0];
              const price = getStartingPrice(scooter);
              return (
                <li
                  key={scooter.id}
                  className="w-[11.5rem] shrink-0 snap-start sm:w-auto"
                >
                  <a
                    href={catalogUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackCatalog('social-catalog-item', { scooterId: scooter.id })}
                    className="flex h-full flex-col border border-line bg-white p-2.5 shadow-soft transition hover:border-brand-500 active:scale-[0.99]"
                    aria-label={`${scooter.name}. ${t('social.catalogCta')}. ${t('social.opensNew')}`}
                  >
                    <ScooterImage
                      src={img}
                      alt=""
                      hue={scooter.hue}
                      name={scooter.name}
                      width={400}
                      height={300}
                      loading="lazy"
                      className="aspect-[4/3] w-full bg-surface-alt"
                      fit="cover"
                    />
                    <p className="mt-2 font-display text-xs font-bold uppercase tracking-wide text-navy sm:text-sm">
                      {scooter.name}
                    </p>
                    {price ? (
                      <p className="mt-0.5 text-sm font-semibold text-body">{formatINR(price)}</p>
                    ) : null}
                    <span className="mt-2 text-[11px] font-bold uppercase tracking-wide text-[#128c7e]">
                      {t('social.catalogCta')}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        ) : null}

        <p className="mt-4 text-xs text-muted sm:text-sm">
          {t('social.catalogHint')}{' '}
          <Link to="/scooters" className="font-semibold text-navy underline-offset-2 hover:underline">
            {t('social.catalogSite')}
          </Link>
        </p>
      </div>
    </section>
  );
}
