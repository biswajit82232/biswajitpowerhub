import { Link } from 'react-router-dom';
import { Percent, BookOpen, Wrench, Package } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';

const ITEMS = [
  { id: 'finance', labelKey: 'more.finance', descKey: 'more.financeD', to: '/finance', icon: Percent },
  { id: 'guides', labelKey: 'more.guides', descKey: 'more.guidesD', to: '/guides', icon: BookOpen },
  { id: 'service', labelKey: 'more.service', descKey: 'more.serviceD', to: '/service', icon: Wrench },
  { id: 'accessories', labelKey: 'more.accessories', descKey: 'more.accessoriesD', to: '/accessories', icon: Package },
];

/**
 * More From Us — four icon tiles (dealer pattern).
 */
export function MoreFromUs() {
  const { t } = useLocale();
  return (
    <section className="bg-white py-10 sm:py-14" aria-labelledby="more-heading">
      <div className="container-px">
        <h2 id="more-heading" className="dealer-section-title text-center text-body">
          {t('home.more')}
        </h2>
        <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-6">
          {ITEMS.map(({ id, labelKey, descKey, to, icon: Icon }) => (
            <Link
              key={id}
              to={to}
              className="group flex flex-col items-center text-center transition hover:opacity-90"
            >
              <span className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-navy text-navy transition group-hover:border-brand-500 group-hover:text-brand-500 sm:h-24 sm:w-24">
                <Icon className="h-9 w-9 sm:h-11 sm:w-11" strokeWidth={1.5} />
              </span>
              <span className="mt-4 text-sm font-bold uppercase tracking-wide text-body sm:text-base">
                {t(labelKey)}
              </span>
              <span className="mt-1 text-xs text-muted">{t(descKey)}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
