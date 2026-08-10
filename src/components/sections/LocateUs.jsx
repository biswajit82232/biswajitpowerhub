import { MapPin, Phone, MessageCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { telUrl, whatsappUrl, formatPhoneDisplay } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
import { trackEvent, EVENT } from '@/lib/tracking';

/**
 * LOCATE US — full-width navy band with address, phone, WhatsApp, GET DIRECTION.
 */
export function LocateUs() {
  const { site } = useSite();

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
      </div>
    </section>
  );
}
