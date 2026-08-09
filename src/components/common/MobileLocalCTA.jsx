import { Phone, Navigation } from 'lucide-react';
import Button from '@/components/ui/Button';
import { SITE, telUrl } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
import { trackEvent, EVENT } from '@/lib/tracking';

/**
 * Mobile sticky bar — Call + Directions (showroom visits).
 * Call = brand blue; Directions = Maps blue; bar = navy.
 * GA/Ads conversions fire via trackEvent → trackGAEvent.
 */
export function MobileLocalCTA() {
  const { site } = useSite();
  const mapsHref =
    site.maps?.link ||
    'https://www.google.com/maps?q=Biswajit+Power+Hub+Chunakhali+Berhampore';

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[9999] flex h-16 items-center bg-brand-900 px-2 pb-[env(safe-area-inset-bottom)] lg:hidden"
      role="navigation"
      aria-label="Call or get directions"
    >
      <div className="mx-auto grid w-full max-w-lg grid-cols-2 gap-2">
        <Button
          href={telUrl(undefined, site)}
          target="_self"
          variant="primary"
          size="sm"
          icon={Phone}
          fullWidth
          className="min-h-11 rounded-lg"
          onClick={() => trackEvent(EVENT.CALL_CLICK, { from: 'mobile_sticky' })}
        >
          Call
        </Button>
        <Button
          href={mapsHref}
          variant="directions"
          size="sm"
          icon={Navigation}
          fullWidth
          className="min-h-11 rounded-lg"
          onClick={() => trackEvent(EVENT.DIRECTIONS_CLICK, { from: 'mobile_sticky' })}
        >
          Directions
        </Button>
      </div>
      <span className="sr-only">{SITE.name}</span>
    </div>
  );
}
