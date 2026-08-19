import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocale } from '@/context/LocaleContext';

/**
 * Visual breadcrumb trail. Pass items: [{ name, to? }] — last item is current (no link).
 */
export function Breadcrumbs({ items = [], className }) {
  const { t } = useLocale();
  if (!items.length) return null;

  const label = (name) => (name === 'Home' ? t('crumb.home') : name);

  return (
    <nav aria-label="Breadcrumb" className={cn('mb-4 text-sm', className)}>
      <ol className="flex flex-wrap items-center gap-1 text-muted">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          const name = label(item.name);
          return (
            <li key={`${item.name}-${i}`} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden />}
              {isLast || !item.to ? (
                <span className="font-medium text-current opacity-95" aria-current="page">
                  {name}
                </span>
              ) : (
                <Link to={item.to} className="transition hover:text-brand-700 hover:opacity-100">
                  {name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
