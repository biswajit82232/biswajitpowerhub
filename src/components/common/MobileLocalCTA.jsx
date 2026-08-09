import { Phone, Navigation } from 'lucide-react';
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
        <a
          href={telUrl(undefined, site)}
          onClick={() => trackEvent(EVENT.CALL_CLICK, { from: 'mobile_sticky' })}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-600 px-3 text-sm font-bold text-white transition hover:bg-brand-500 active:scale-[0.98]"
        >
          <Phone className="h-4 w-4" aria-hidden />
          Call
        </a>
        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent(EVENT.DIRECTIONS_CLICK, { from: 'mobile_sticky' })}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#4285f4] px-3 text-sm font-bold text-white transition hover:bg-[#3367d6] active:scale-[0.98]"
        >
          <Navigation className="h-4 w-4" aria-hidden />
          Directions
        </a>
      </div>
      <span className="sr-only">{SITE.name}</span>
    </div>
  );
}
