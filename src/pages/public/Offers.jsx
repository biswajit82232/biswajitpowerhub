import { SEO } from '@/components/common/SEO';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { PromotionalOffers } from '@/components/sections/PromotionalOffers';
import { LocateUs } from '@/components/sections/LocateUs';
import Button from '@/components/ui/Button';
import { telUrl } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
import { trackEvent, EVENT } from '@/lib/tracking';
import { breadcrumbList } from '@/lib/schemaHelpers';

export default function Offers() {
  const { site } = useSite();
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
          <Breadcrumbs items={[{ name: 'Home', to: '/' }, { name: 'Offers' }]} />
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-brand-500">Offers</p>
          <h1 className="mt-2 font-display text-2xl font-extrabold uppercase tracking-wide text-navy sm:text-3xl">
            Offers &amp; Promotions
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-body sm:text-base">
            Seasonal deals and showroom promotions. Call to confirm what&apos;s available today.
          </p>
          <Button
            href={telUrl(undefined, site)}
            target="_self"
            variant="dealerPrimary"
            className="mt-6"
            onClick={() => trackEvent(EVENT.CALL_CLICK, { from: 'offers-page' })}
          >
            Call For Offers
          </Button>
        </div>
      </section>

      <PromotionalOffers showEmpty />
      <LocateUs />
    </>
  );
}
