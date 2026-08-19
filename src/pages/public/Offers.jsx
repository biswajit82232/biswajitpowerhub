import { SEO } from '@/components/common/SEO';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { PromotionalOffers } from '@/components/sections/PromotionalOffers';
import { LocateUs } from '@/components/sections/LocateUs';
import Button from '@/components/ui/Button';
import { telUrl } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
import { trackEvent, EVENT } from '@/lib/tracking';
import { breadcrumbList } from '@/lib/schemaHelpers';
import { useLocale } from '@/context/LocaleContext';

export default function Offers() {
  const { site } = useSite();
  const { t } = useLocale();
  const jsonLd = breadcrumbList([
    { name: 'Home', path: '/' },
    { name: 'Offers', path: '/offers' },
  ]);

  return (
    <>
      <SEO
        title="Offers & Promotions | Biswajit Power Hub Berhampore"
        description="Current offers and deals on electric scooters at Biswajit Power Hub, Chunakhali, Berhampore."
        path="/offers"
        jsonLd={[jsonLd]}
        titleTemplate={false}
      />

      <section className="border-b border-line bg-white">
        <div className="container-px py-8 sm:py-12">
          <Breadcrumbs items={[{ name: t('crumb.home'), to: '/' }, { name: t('footer.offers') }]} />
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-brand-500">{t('off.eyebrow')}</p>
          <h1 className="mt-2 font-display text-2xl font-extrabold uppercase tracking-wide text-navy sm:text-3xl">
            {t('off.h1')}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-body sm:text-base">
            {t('off.sub')}
          </p>
          <Button
            href={telUrl(undefined, site)}
            target="_self"
            variant="dealerPrimary"
            className="mt-6"
            onClick={() => trackEvent(EVENT.CALL_CLICK, { from: 'offers-page' })}
          >
            {t('off.call')}
          </Button>
        </div>
      </section>

      <PromotionalOffers showEmpty />
      <LocateUs />
    </>
  );
}
