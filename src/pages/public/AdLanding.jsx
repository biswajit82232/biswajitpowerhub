import { Phone, MessageCircle, Navigation, Check } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { SITE, whatsappUrl, telUrl, formatPhoneDisplay, SITE_URL } from '@/config/site';
import { trackEvent, EVENT } from '@/lib/tracking';

/**
 * Bare Google Ads landing — noindex, no main nav, conversion-first.
 */
export default function AdLanding() {
  const phone = SITE.phones[0];
  const maps = SITE.maps.link;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SEO
        title="No Licence Electric Scooters in Berhampore — Test Ride Today"
        description="No licence electric scooters in Berhampore. Test ride at Biswajit Power Hub, Chunakhali. Call 096355 05436."
        path="/ad-landing"
        noindex
        titleTemplate={false}
      />

      <main className="mx-auto max-w-lg px-4 pb-28 pt-8 sm:pt-12">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-500">
          Biswajit Power Hub
        </p>
        <h1 className="mt-3 text-center font-display text-2xl font-extrabold leading-tight sm:text-3xl">
          No Licence Electric Scooters in Berhampore — Test Ride Today
        </h1>
        <p className="mt-3 text-center text-sm leading-relaxed text-slate-600">
          Low-speed e-scooters from ₹38,999. No RTO registration. 3 free servicing. Visit Chunakhali Bus
          Stand, Murshidabad.
        </p>

        <div className="mt-6 grid gap-3">
          <img
            src={`${SITE_URL}/og-image.png`}
            alt="Biswajit Power Hub showroom at Chunakhali Bus Stand Berhampore Murshidabad"
            width={800}
            height={420}
            className="h-44 w-full rounded-2xl object-cover ring-1 ring-slate-200"
            loading="eager"
            fetchPriority="high"
          />
          <img
            src={`${SITE_URL}/logo-512.png`}
            alt="Activa electric scooter test ride at Berhampore showroom"
            width={512}
            height={512}
            className="mx-auto h-28 w-28 rounded-2xl object-contain bg-white p-3 ring-1 ring-slate-200"
            loading="lazy"
          />
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <a
            href={telUrl(phone)}
            onClick={() => trackEvent(EVENT.CALL_CLICK, { from: 'ad-landing' })}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-base font-bold text-white transition hover:bg-brand-700"
          >
            <Phone className="h-5 w-5" />
            Call Now: {formatPhoneDisplay(phone).replace('+91 ', '0')}
          </a>
          <a
            href={whatsappUrl('Hi, I saw your ad — I want a test ride', SITE)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent(EVENT.WHATSAPP_CLICK, { from: 'ad-landing' })}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#25d366] px-4 text-base font-bold text-white"
          >
            <MessageCircle className="h-5 w-5" />
            WhatsApp Us
          </a>
          <a
            href={maps}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent(EVENT.DIRECTIONS_CLICK, { from: 'ad-landing' })}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#4285f4] px-4 text-base font-bold text-white"
          >
            <Navigation className="h-5 w-5" />
            Get Directions
          </a>
        </div>

        <address className="mt-8 rounded-2xl bg-white p-5 text-sm not-italic leading-relaxed text-slate-700 ring-1 ring-slate-200">
          <strong className="block text-base text-slate-900">{SITE.name}</strong>
          Chunakhali Bus Stand, Nimtala
          <br />
          Berhampore, Murshidabad
          <br />
          West Bengal — 742149, India
          <br />
          <span className="mt-2 block">{SITE.hours?.summary || 'Open all days: 9:00 AM – 8:30 PM'}</span>
        </address>

        <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm font-semibold text-slate-800">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 ring-1 ring-slate-200">
            <Check className="h-4 w-4 text-emerald-600" /> 3 Free Servicing
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 ring-1 ring-slate-200">
            <Check className="h-4 w-4 text-emerald-600" /> 1 Year Warranty
          </span>
        </div>
      </main>
    </div>
  );
}
