import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Visual breadcrumb trail. Pass items: [{ name, to? }] — last item is current (no link).
 */
export function Breadcrumbs({ items = [], className }) {
  if (!items.length) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn('mb-4 text-sm', className)}>
      <ol className="flex flex-wrap items-center gap-1 text-muted">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.name}-${i}`} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden />}
              {isLast || !item.to ? (
                <span className="font-medium text-heading" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link to={item.to} className="transition hover:text-brand-700">
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
