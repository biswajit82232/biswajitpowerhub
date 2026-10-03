import { Link } from 'react-router-dom';
import { Bike, GitCompare, IndianRupee, LayoutGrid, Tag } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';

const SHORTCUTS = [
  { id: 'models', labelKey: 'short.models', to: '/#models', icon: LayoutGrid },
  { id: 'offers', labelKey: 'short.offers', to: '/offers', icon: Tag },
  { id: 'ride', labelKey: 'short.ride', to: '/test-ride-berhampore', icon: Bike },
  { id: 'emi', labelKey: 'short.emi', to: '/finance', icon: IndianRupee },
  { id: 'compare', labelKey: 'short.compare', to: '/compare', icon: GitCompare },
];

/**
 * Mobile side rail. Desktop keeps FloatingDealerRail.
 * Sits above the Call / WhatsApp / Map bar.
 */
export function MobileSideShortcuts() {
  const { t } = useLocale();

  return (
    <nav
      className="pointer-events-none fixed right-0 z-[80] flex items-center lg:hidden"
      style={{ top: 'calc(var(--header-offset) + 0.5rem)', bottom: 'calc(4.75rem + env(safe-area-inset-bottom))' }}
      aria-label={t('short.label')}
    >
      <ul className="pointer-events-auto flex flex-col overflow-hidden rounded-l-dealer shadow-card">
        {SHORTCUTS.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.id}>
              <Link
                to={item.to}
                className="flex w-[52px] flex-col items-center gap-0.5 bg-navy px-1 py-2 text-center text-[8px] font-bold uppercase leading-tight tracking-wide text-white transition active:bg-brand-500"
              >
                <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
                {t(item.labelKey)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
