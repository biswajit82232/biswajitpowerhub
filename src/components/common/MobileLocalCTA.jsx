import { Phone, Navigation, MessageCircle, Wrench } from 'lucide-react';
import Button from '@/components/ui/Button';
import { SITE, telUrl, whatsappUrl } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
import { trackEvent, EVENT } from '@/lib/tracking';

/**
 * Mobile sticky bar — Call + Book Service + WhatsApp + Directions.
 * Mirrors the desktop dealer rail’s Book Service entry point.
 */
export function MobileLocalCTA() {
  const { site } = useSite();
  const mapsHref =
    site.maps?.link ||
    'https://www.google.com/maps?q=Biswajit+Power+Hub+Chunakhali+Berhampore';

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[9999] flex h-16 items-center bg-navy px-1.5 pb-[env(safe-area-inset-bottom)] sm:px-2 lg:hidden"
      role="navigation"
      aria-label="Call, book service, WhatsApp, or get directions"
    >
      <div className="mx-auto grid w-full max-w-lg grid-cols-4 gap-1 sm:gap-1.5">
        <Button
          href={telUrl(undefined, site)}
          target="_self"
          variant="dealerPrimary"
          size="sm"
          icon={Phone}
          fullWidth
          className="min-h-11 !rounded-dealer !px-1 !text-[10px] sm:!px-2 sm:!text-xs"
          onClick={() => trackEvent(EVENT.CALL_CLICK, { from: 'mobile_sticky' })}
        >
          Call
        </Button>
        <Button
          to="/service#book"
          variant="dealerSecondary"
          size="sm"
          icon={Wrench}
          fullWidth
          className="min-h-11 !rounded-dealer !px-1 !text-[10px] sm:!px-2 sm:!text-xs"
        >
          Service
        </Button>
        <Button
          href={whatsappUrl(undefined, site)}
          variant="whatsapp"
          size="sm"
          icon={MessageCircle}
          fullWidth
          className="min-h-11 !rounded-dealer !px-1 !text-[10px] sm:!px-2 sm:!text-xs"
          onClick={() => trackEvent(EVENT.WHATSAPP_CLICK, { from: 'mobile_sticky' })}
        >
          Chat
        </Button>
        <Button
          href={mapsHref}
          variant="dealerSecondary"
          size="sm"
          icon={Navigation}
          fullWidth
          className="min-h-11 !rounded-dealer !px-1 !text-[10px] sm:!px-2 sm:!text-xs"
          onClick={() => trackEvent(EVENT.DIRECTIONS_CLICK, { from: 'mobile_sticky' })}
        >
          Map
        </Button>
      </div>
      <span className="sr-only">{SITE.name}</span>
    </div>
  );
}
