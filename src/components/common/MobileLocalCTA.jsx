import { Phone, Navigation } from 'lucide-react';
import { SITE, telUrl } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
import { trackEvent, EVENT } from '@/lib/tracking';
import { trackAdsConversion } from '@/lib/googleAnalytics';

/**
 * Mobile sticky bar — Call + Directions (showroom visits).
 * Spec: z-9999, 64px, #1a1a1a bar, Call #ff6600, Directions #4285f4.
 */
export function MobileLocalCTA() {
  const { site } = useSite();
  const mapsHref =
    site.maps?.link ||
    'https://www.google.com/maps?q=Biswajit+Power+Hub+Chunakhali+Berhampore';

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[9999] flex h-16 items-center px-2 pb-[env(safe-area-inset-bottom)] lg:hidden"
      style={{ backgroundColor: '#1a1a1a' }}
      role="navigation"
      aria-label="Call or get directions"
    >
      <div className="mx-auto grid w-full max-w-lg grid-cols-2 gap-2">
        <a
          href={telUrl(undefined, site)}
          onClick={() => {
            trackEvent(EVENT.CALL_CLICK, { from: 'mobile_sticky' });
            trackAdsConversion('phone_click');
          }}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-bold text-white active:scale-[0.98]"
          style={{ backgroundColor: '#ff6600' }}
        >
          <Phone className="h-4 w-4" aria-hidden />
          Call
        </a>
        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            trackEvent(EVENT.DIRECTIONS_CLICK, { from: 'mobile_sticky' });
            trackAdsConversion('directions_click');
          }}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-bold text-white active:scale-[0.98]"
          style={{ backgroundColor: '#4285f4' }}
        >
          <Navigation className="h-4 w-4" aria-hidden />
          Directions
        </a>
      </div>
      <span className="sr-only">{SITE.name}</span>
    </div>
  );
}
