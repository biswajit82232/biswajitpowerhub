import { Phone, MessageCircle, Navigation, Check } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import Button from '@/components/ui/Button';
import { SITE, whatsappUrl, telUrl, formatPhoneDisplay, SITE_URL } from '@/config/site';
import { trackEvent, EVENT } from '@/lib/tracking';

/**
 * Bare Google Ads landing — noindex, no main nav, conversion-first.
 */
export default function AdLanding() {
  const phone = SITE.phones[0];
  const maps = SITE.maps.link;

  return (
    <div className="min-h-screen bg-sky-fade text-heading">
      <div className="pointer-events-none fixed inset-0 bg-hero-mesh opacity-50" aria-hidden />
      <SEO
        title="No Licence Electric Scooters in Berhampore — Test Ride Today"
        description="No licence electric scooters in Berhampore. Test ride at Biswajit Power Hub, Chunakhali. Call 096355 05436."
        path="/ad-landing"
        noindex
        titleTemplate={false}
      />

      <main className="relative mx-auto max-w-lg px-4 pb-16 pt-10 sm:pt-14">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-brand-600">
          Biswajit Power Hub · Chunakhali
        </p>
        <h1 className="mt-3 text-center font-display text-2xl font-extrabold leading-tight sm:text-3xl">
          No Licence Electric Scooters — Test Ride Today
        </h1>
        <p className="mt-3 text-center text-sm leading-relaxed text-body">
          From ₹38,999. No RTO. 3 free servicing. Free test ride at Chunakhali Bus Stand, Berhampore.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Button
            href={telUrl(phone)}
            target="_self"
            variant="primary"
            size="lg"
            icon={Phone}
            fullWidth
            onClick={() => trackEvent(EVENT.CALL_CLICK, { from: 'ad-landing' })}
          >
            Call Now: {formatPhoneDisplay(phone).replace('+91 ', '0')}
          </Button>
          <Button
            href={whatsappUrl('Hi, I saw your ad — I want a test ride', SITE)}
            variant="whatsapp"
            size="lg"
            icon={MessageCircle}
            fullWidth
            onClick={() => trackEvent(EVENT.WHATSAPP_CLICK, { from: 'ad-landing' })}
          >
            WhatsApp Us
          </Button>
          <Button
            href={maps}
            variant="directions"
            size="lg"
            icon={Navigation}
            fullWidth
            onClick={() => trackEvent(EVENT.DIRECTIONS_CLICK, { from: 'ad-landing' })}
          >
            Get Directions
          </Button>
        </div>

        <img
          src={`${SITE_URL}/og-image.png`}
          alt="Biswajit Power Hub showroom at Chunakhali Bus Stand Berhampore Murshidabad"
          width={800}
          height={420}
          className="mt-8 h-44 w-full rounded-2xl object-cover shadow-card ring-1 ring-line"
          loading="lazy"
        />

        <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm font-semibold text-heading">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-2 ring-1 ring-line">
            <Check className="h-4 w-4 text-emerald-600" /> 3 Free Servicing
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-2 ring-1 ring-line">
            <Check className="h-4 w-4 text-emerald-600" /> 1 Year Warranty
          </span>
        </div>

        <address className="mt-8 rounded-2xl bg-surface p-5 text-sm not-italic leading-relaxed text-body shadow-soft ring-1 ring-line">
          <strong className="block font-display text-base text-heading">{SITE.name}</strong>
          Chunakhali Bus Stand, Nimtala
          <br />
          Berhampore, Murshidabad — 742149
          <br />
          <span className="mt-2 block">{SITE.hours?.summary || 'Open all days: 9:00 AM – 8:30 PM'}</span>
        </address>
      </main>
    </div>
  );
}
