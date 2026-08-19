import { Link } from 'react-router-dom';
import { Bike, FileText, MapPin, Phone, Wrench } from 'lucide-react';
import { telUrl } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
import { useLocale } from '@/context/LocaleContext';
import { trackEvent, EVENT } from '@/lib/tracking';
import { cn } from '@/lib/utils';

const RAIL = [
  {
    id: 'test-ride',
    labelKey: 'rail.testRide',
    to: '/test-ride-berhampore',
    icon: Bike,
    event: null,
  },
  {
    id: 'service',
    labelKey: 'rail.service',
    to: '/service#book',
    icon: Wrench,
    event: null,
  },
  {
    id: 'quote',
    labelKey: 'rail.quote',
    to: '/contact#callback',
    icon: FileText,
    event: null,
  },
  {
    id: 'location',
    labelKey: 'rail.location',
    hrefKey: 'maps',
    icon: MapPin,
    event: EVENT.DIRECTIONS_CLICK,
  },
  {
    id: 'call',
    labelKey: 'rail.call',
    hrefKey: 'tel',
    icon: Phone,
    event: EVENT.CALL_CLICK,
  },
];

/**
 * Desktop right-side dealer rail (Test Ride / Service / Quotation / Location / Call).
 * Hidden on small screens — MobileLocalCTA covers mobile.
 */
export function FloatingDealerRail() {
  const { site } = useSite();
  const { t } = useLocale();

  return (
    <aside
      className="pointer-events-none fixed right-0 top-1/2 z-[90] hidden -translate-y-1/2 lg:block"
      aria-label="Quick actions"
    >
      <ul className="pointer-events-auto flex flex-col gap-px overflow-hidden rounded-l-dealer shadow-card">
        {RAIL.map((item) => {
          const Icon = item.icon;
          const className = cn(
            'flex w-[52px] flex-col items-center gap-1 bg-navy px-1.5 py-2.5 text-center text-[9px] font-bold uppercase leading-tight tracking-wide text-white transition hover:bg-brand-500',
          );

          if (item.hrefKey === 'tel') {
            return (
              <li key={item.id}>
                <a
                  href={telUrl(undefined, site)}
                  className={className}
                  onClick={() => trackEvent(item.event, { from: 'dealer_rail' })}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                  {t(item.labelKey)}
                </a>
              </li>
            );
          }

          if (item.hrefKey === 'maps') {
            return (
              <li key={item.id}>
                <a
                  href={site.maps?.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                  onClick={() => trackEvent(item.event, { from: 'dealer_rail' })}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                  {t(item.labelKey)}
                </a>
              </li>
            );
          }

          return (
            <li key={item.id}>
              <Link to={item.to} className={className}>
                <Icon className="h-4 w-4" strokeWidth={2} />
                {t(item.labelKey)}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
