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

const buttonClass = [
  'flex h-14 w-14 flex-col items-center justify-center gap-0.5 rounded-2xl',
  'bg-navy/95 text-white shadow-[0_10px_24px_rgba(0,18,51,0.38)] ring-1 ring-white/25',
  'transition duration-150',
  'hover:-translate-y-0.5 hover:bg-brand-500 hover:shadow-[0_14px_28px_rgba(185,28,28,0.35)]',
  'active:translate-y-0 active:scale-95 active:bg-brand-600',
].join(' ');

/**
 * Floating shortcut buttons on small screens.
 * They sit over the page, above the Call / WhatsApp / Map bar.
 */
export function MobileSideShortcuts() {
  const { t } = useLocale();

  return (
    <nav
      className="pointer-events-none fixed right-3 z-[80] flex items-center lg:hidden"
      style={{ top: 'calc(var(--header-offset) + 0.5rem)', bottom: 'calc(4.75rem + env(safe-area-inset-bottom))' }}
      aria-label={t('short.label')}
    >
      <ul className="pointer-events-auto flex flex-col gap-2">
        {SHORTCUTS.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.id}>
              <Link to={item.to} className={buttonClass}>
                <Icon className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                <span className="text-[8px] font-bold uppercase leading-none tracking-wide">{t(item.labelKey)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
