import { MapPin, Phone, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { telUrl, whatsappUrl, formatPhoneDisplay } from '@/config/site';
import { getPriorityLocations } from '@/data/locations';
import { useSite } from '@/context/SiteSettingsContext';
import { trackEvent, EVENT } from '@/lib/tracking';

/**
 * LOCATE US — full-width navy band with address, phone, WhatsApp, GET DIRECTION.
 */
export function LocateUs() {
  const { site } = useSite();
  const towns = getPriorityLocations().slice(0, 6);

  return (
    <section
      className="relative overflow-hidden bg-navy py-10 text-white sm:py-12"
      aria-labelledby="locate-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-locate-pattern opacity-40"
        aria-hidden
      />
      <div className="container-px relative z-10">
        <h2 id="locate-heading" className="font-display text-lg font-bold uppercase tracking-wide text-white md:text-[30px]">
          Locate Us
        </h2>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <div className="grid flex-1 gap-5 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-navy">
                <MapPin className="h-5 w-5" />
              </span>
              <p className="text-sm leading-relaxed text-white/95">{site.address.full}</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-navy">
                <Phone className="h-5 w-5" />
              </span>
              <a
                href={telUrl(undefined, site)}
                className="text-sm font-semibold text-white hover:underline"
                onClick={() => trackEvent(EVENT.CALL_CLICK, { from: 'locate-us' })}
              >
                {formatPhoneDisplay(site.phones[0])}
              </a>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-navy">
                <MessageCircle className="h-5 w-5" />
              </span>
              <a
                href={whatsappUrl(undefined, site)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-white hover:underline"
                onClick={() => trackEvent(EVENT.WHATSAPP_CLICK, { from: 'locate-us' })}
              >
                WhatsApp us
              </a>
            </div>
          </div>

          <Button
            href={site.maps?.link}
            variant="dealerPrimary"
            className="shrink-0 self-start lg:self-center"
            onClick={() => trackEvent(EVENT.DIRECTIONS_CLICK, { from: 'locate-us' })}
          >
            Get Direction
          </Button>
        </div>

        <div className="mt-6 border-t border-white/15 pt-5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-white/70">Serving Murshidabad</p>
          <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
            {towns.map((t) => (
              <li key={t.slug}>
                <Link to={t.path} className="text-white/90 underline-offset-2 hover:underline">
                  {t.name}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/areas-we-serve" className="font-semibold text-white underline-offset-2 hover:underline">
                All areas
              </Link>
            </li>
            <li>
              <Link to="/electric-scooter-near-me-berhampore" className="font-semibold text-white underline-offset-2 hover:underline">
                Near me
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
