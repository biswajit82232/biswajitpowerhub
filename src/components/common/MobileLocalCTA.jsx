import { Phone, Navigation, MessageCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { SITE, telUrl, whatsappUrl } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
import { trackEvent, EVENT } from '@/lib/tracking';

/**
 * Mobile sticky bar — Call + WhatsApp + Directions.
 */
export function MobileLocalCTA() {
  const { site } = useSite();
  const mapsHref =
    site.maps?.link ||
    'https://www.google.com/maps?q=Biswajit+Power+Hub+Chunakhali+Berhampore';

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[9999] flex h-16 items-center bg-navy px-2 pb-[env(safe-area-inset-bottom)] lg:hidden"
      role="navigation"
      aria-label="Call, WhatsApp, or get directions"
    >
      <div className="mx-auto grid w-full max-w-lg grid-cols-3 gap-1.5">
        <Button
          href={telUrl(undefined, site)}
          target="_self"
          variant="dealerPrimary"
          size="sm"
          icon={Phone}
          fullWidth
          className="min-h-11 !rounded-dealer"
          onClick={() => trackEvent(EVENT.CALL_CLICK, { from: 'mobile_sticky' })}
        >
          Call
        </Button>
        <Button
          href={whatsappUrl(undefined, site)}
          target="_blank"
          rel="noopener noreferrer"
          variant="whatsapp"
          size="sm"
          icon={MessageCircle}
          fullWidth
          className="min-h-11 !rounded-dealer"
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
          className="min-h-11 !rounded-dealer"
          onClick={() => trackEvent(EVENT.DIRECTIONS_CLICK, { from: 'mobile_sticky' })}
        >
          Map
        </Button>
      </div>
      <span className="sr-only">{SITE.name}</span>
    </div>
  );
}
