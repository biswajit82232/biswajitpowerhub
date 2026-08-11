import { Link } from 'react-router-dom';
import { Phone, Navigation, MessageCircle, Wrench } from 'lucide-react';
import { SITE, telUrl, whatsappUrl } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
import { trackEvent, EVENT } from '@/lib/tracking';
import { cn } from '@/lib/utils';

const ITEM =
  'flex min-h-[2.75rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-0.5 py-1 text-center transition active:scale-[0.97] tap-target';

/**
 * Compact mobile bottom nav — icon + label, space-saving, clear taps.
 */
export function MobileLocalCTA() {
  const { site } = useSite();
  const mapsHref =
    site.maps?.link ||
    'https://www.google.com/maps?q=Biswajit+Power+Hub+Chunakhali+Berhampore';

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[9999] border-t border-navy/10 bg-white/95 shadow-[0_-4px_20px_rgba(15,23,42,0.08)] backdrop-blur-md lg:hidden"
      aria-label="Quick actions"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex h-12 max-w-lg items-stretch px-1">
        <a
          href={telUrl(undefined, site)}
          className={cn(ITEM, 'text-brand-600')}
          onClick={() => trackEvent(EVENT.CALL_CLICK, { from: 'mobile_sticky' })}
        >
          <Phone className="h-4 w-4" strokeWidth={2.4} aria-hidden />
          <span className="text-[10px] font-bold leading-none tracking-wide">Call</span>
        </a>

        <Link to="/service#book" className={cn(ITEM, 'text-navy')}>
          <Wrench className="h-4 w-4" strokeWidth={2.4} aria-hidden />
          <span className="text-[10px] font-bold leading-none tracking-wide">Service</span>
        </Link>

        <a
          href={whatsappUrl(undefined, site)}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(ITEM, 'text-[#1da851]')}
          onClick={() => trackEvent(EVENT.WHATSAPP_CLICK, { from: 'mobile_sticky' })}
        >
          <MessageCircle className="h-4 w-4" strokeWidth={2.4} aria-hidden />
          <span className="text-[10px] font-bold leading-none tracking-wide">Chat</span>
        </a>

        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(ITEM, 'text-navy')}
          onClick={() => trackEvent(EVENT.DIRECTIONS_CLICK, { from: 'mobile_sticky' })}
        >
          <Navigation className="h-4 w-4" strokeWidth={2.4} aria-hidden />
          <span className="text-[10px] font-bold leading-none tracking-wide">Map</span>
        </a>
      </div>
      <span className="sr-only">{SITE.name}</span>
    </nav>
  );
}
