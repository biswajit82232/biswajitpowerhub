import { Phone, MessageCircle, Navigation, Check } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import Button from '@/components/ui/Button';
import { LanguageToggle } from '@/components/common/LanguageToggle';
import { SITE_URL, whatsappUrl, telUrl, formatPhoneDisplay } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
import { useLocale } from '@/context/LocaleContext';
import { trackEvent, EVENT } from '@/lib/tracking';
import { useAsync } from '@/hooks/useAsync';
import { getScooters } from '@/features/scooters/scooterService';
import { SCOOTERS } from '@/data/scooters';
import { formatCatalogFromPrice } from '@/lib/catalogCopy';

/**
 * Bare Google Ads landing — noindex, no main nav, conversion-first.
 */
export default function AdLanding() {
  const { site } = useSite();
  const { t } = useLocale();
  const phone = site.phones[0];
  const maps = site.maps.link;
  const perks = (site.perks || []).slice(0, 3);
  const { data: scooters } = useAsync(() => getScooters(), []);
  const fromPrice = formatCatalogFromPrice(scooters?.length ? scooters : SCOOTERS);

  return (
    <div className="relative min-h-screen bg-white text-body">
      <SEO
        title="No Licence Electric Scooters in Berhampore — Test Ride Today"
        description={`No licence electric scooters in Berhampore. Test ride at ${site.name}, Chunakhali. Call ${formatPhoneDisplay(phone)}.`}
        path="/ad-landing"
        noindex
        titleTemplate={false}
      />

      <div className="absolute right-4 top-4 z-10">
        <LanguageToggle compact />
      </div>

      <main className="relative mx-auto max-w-lg px-4 pb-16 pt-10 sm:pt-14">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-brand-500">
          {site.name} · Chunakhali
        </p>
        <h1 className="mt-3 text-center font-display text-2xl font-extrabold uppercase leading-tight tracking-wide text-navy sm:text-3xl">
          {t('ad.h1')}
        </h1>
        <p className="mt-3 text-center text-sm leading-relaxed text-body">
          {t('ad.sub', {
            from: fromPrice ? `From ${fromPrice}. ` : '',
            line: site.address.line,
            city: site.address.city,
          })}
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Button
            href={telUrl(phone, site)}
            target="_self"
            variant="dealerPrimary"
            size="lg"
            icon={Phone}
            fullWidth
            onClick={() => trackEvent(EVENT.CALL_CLICK, { from: 'ad-landing' })}
          >
            {t('cta.call')}: {formatPhoneDisplay(phone).replace('+91 ', '0')}
          </Button>
          <Button
            href={whatsappUrl('Hi, I saw your ad — I want a test ride', site)}
            variant="whatsapp"
            size="lg"
            icon={MessageCircle}
            fullWidth
            className="!rounded-dealer"
            onClick={() => trackEvent(EVENT.WHATSAPP_CLICK, { from: 'ad-landing' })}
          >
            {t('cta.whatsapp')}
          </Button>
          <Button
            href={maps}
            variant="dealerSecondary"
            size="lg"
            icon={Navigation}
            fullWidth
            onClick={() => trackEvent(EVENT.DIRECTIONS_CLICK, { from: 'ad-landing' })}
          >
            {t('cta.map')}
          </Button>
        </div>

        <img
          src={`${SITE_URL}/og-image.png`}
          alt={`${site.name} showroom at Chunakhali Bus Stand Berhampore Murshidabad`}
          width={800}
          height={420}
          className="mt-8 h-44 w-full border border-line object-cover"
          loading="lazy"
        />

        <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm font-semibold text-navy">
          {perks.map((p) => (
            <span key={p.id || p.title} className="inline-flex items-center gap-1.5 border border-line bg-white px-3 py-2">
              <Check className="h-4 w-4 text-brand-500" />
              {p.title}
            </span>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted">
          {site.address.full}
        </p>
        <p className="mt-2 text-center text-sm font-bold text-navy">
          {site.name}
        </p>
      </main>
    </div>
  );
}
